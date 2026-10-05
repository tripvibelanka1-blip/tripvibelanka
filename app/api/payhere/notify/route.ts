import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const merchantId = formData.get('merchant_id') as string;
    const orderId = formData.get('order_id') as string; 
    const paymentId = formData.get('payment_id') as string;
    const payhereAmount = (formData.get('payhere_amount') as string || '').trim();
    const payhereCurrency = (formData.get('payhere_currency') as string || '').trim();
    const statusCode = (formData.get('status_code') as string || '').trim();
    const md5sig = (formData.get('md5sig') as string || '').trim().toUpperCase();
    
    const secret = process.env.PAYHERE_MERCHANT_SECRET;
    const envMerchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    
    if (!secret || !envMerchantId) {
      console.error('PayHere webhook missing server credentials.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 🔒 1. Verify the webhook was intended for this merchant account
    if (merchantId !== envMerchantId) {
      console.error('PayHere webhook: Merchant ID mismatch');
      return NextResponse.json({ error: 'Invalid Merchant' }, { status: 400 });
    }

    // 🔒 2. Verify Signature using RAW payhere_amount string with constant-time comparison
    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
    const hashString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
    const expectedMd5 = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    const expectedBuffer = Buffer.from(expectedMd5);
    const signatureBuffer = Buffer.from(md5sig);
    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      console.error('PayHere webhook: Signature verification failed for order', orderId);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      console.error('PayHere webhook: Admin client creation failed (missing service key).');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 3. Fetch booking record
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, payment_status, booking_status, advance_amount, currency')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchError || !booking) {
      console.error('PayHere webhook: Booking not found.', orderId);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 🔒 4. Idempotency First: If already acknowledged as paid, exit early with 200 OK
    if (booking.payment_status === 'advance_paid' || booking.payment_status === 'fully_paid') {
      console.log(`PayHere webhook: Booking ${orderId} already paid. Skipping duplicate processing.`);
      return NextResponse.json({ status: 'success' }, { status: 200 });
    }

    // 🔒 5. Strict Price and Currency Tamper Detection
    const expectedDbAmount = Number(booking.advance_amount).toFixed(2);
    const receivedAmountFormatted = Number(payhereAmount).toFixed(2);

    if (expectedDbAmount !== receivedAmountFormatted || booking.currency !== payhereCurrency) {
      console.error(`PayHere webhook: Price tampering detected on order ${orderId}! Expected ${expectedDbAmount} ${booking.currency}, received ${receivedAmountFormatted} ${payhereCurrency}`);
      
      // Update fraud notice only if booking is still pending (never overwrite an already settled booking)
      await supabase
        .from('bookings')
        .update({ 
          payment_status: 'failed',
          admin_notes: `[FRAUD FLAG]: Price tampering detected! Expected ${expectedDbAmount} ${booking.currency}, received ${receivedAmountFormatted} ${payhereCurrency}. PayHere Payment ID: ${paymentId || 'N/A'}`
        })
        .eq('id', orderId)
        .eq('payment_status', 'pending');

      return NextResponse.json({ error: 'Data mismatch' }, { status: 400 });
    }

    // 🔒 6. Atomic compare-and-set by Status Code with Row Count Verification
    // Status Codes: 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Charged back
    if (statusCode === '2') {
      const { data: updatedRows, error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'advance_paid',
          booking_status: 'confirmed',
          payhere_payment_id: paymentId,
        })
        .eq('id', orderId)
        .eq('payment_status', 'pending')
        .select('id');

      if (updateError) {
        console.error('PayHere webhook: Failed to atomically update booking.', updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      if (!updatedRows || updatedRows.length === 0) {
        console.log(`PayHere webhook: Concurrent notification or already processed for order ${orderId}.`);
      } else {
        console.log(`PayHere webhook: Successfully marked booking ${orderId} as advance_paid. Payment ID: ${paymentId}`);
      }
    } else if (statusCode === '-3') {
      // Chargeback
      await supabase
        .from('bookings')
        .update({
          payment_status: 'failed',
          admin_notes: `[CHARGEBACK DETECTED]: PayHere Payment ID ${paymentId}`,
        })
        .eq('id', orderId);
      console.warn(`PayHere webhook: Marked booking ${orderId} as chargeback.`);
    } else if (statusCode === '-1' || statusCode === '-2') {
      // Canceled or Failed
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', orderId)
        .eq('payment_status', 'pending');
      console.log(`PayHere webhook: Marked booking ${orderId} as failed/canceled.`);
    }

    // Always return 200 OK so PayHere does not retry unnecessarily
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error) {
    console.error('PayHere webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
