import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // PayHere sends data as application/x-www-form-urlencoded
    const formData = await req.formData();
    
    const merchantId = formData.get('merchant_id') as string;
    const orderId = formData.get('order_id') as string; // This will be our booking ID
    const paymentId = formData.get('payment_id') as string;
    const payhereAmount = formData.get('payhere_amount') as string;
    const payhereCurrency = formData.get('payhere_currency') as string;
    const statusCode = formData.get('status_code') as string;
    const md5sig = formData.get('md5sig') as string;
    // const custom1 = formData.get('custom_1') as string; // Can be used for reference_no
    
    const secret = process.env.PAYHERE_MERCHANT_SECRET;
    
    if (!secret || !merchantId) {
      console.error('PayHere webhook missing server credentials.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 1. Verify Signature
    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
    
    // Amount must be formatted to 2 decimal places
    const amountFormatted = parseFloat(payhereAmount).toFixed(2);
    
    const hashString = `${merchantId}${orderId}${amountFormatted}${payhereCurrency}${statusCode}${hashedSecret}`;
    const expectedMd5 = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    if (expectedMd5 !== md5sig) {
      console.error('PayHere webhook signature mismatch.', { expectedMd5, md5sig });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2. Process the status
    // Status Codes: 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Charged back
    const supabase = createAdminClient();
    
    if (!supabase) {
      console.error('PayHere webhook: Admin client creation failed (missing service key).');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // Find booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, payment_status')
      .eq('id', orderId)
      .single();

    if (fetchError || !booking) {
      console.error('PayHere webhook: Booking not found.', orderId);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (statusCode === '2') {
      // Payment Success! Update booking status to advance_paid
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'advance_paid',
          payhere_payment_id: paymentId,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('PayHere webhook: Failed to update booking.', updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      
      console.log(`PayHere webhook: Successfully marked booking ${orderId} as advance_paid. Payment ID: ${paymentId}`);
    } else if (statusCode === '-2') {
      // Payment Failed
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', orderId);
        
      console.log(`PayHere webhook: Marked booking ${orderId} as failed.`);
    }

    // Always return 200 OK to PayHere so they don't retry unnecessarily
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error) {
    console.error('PayHere webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
