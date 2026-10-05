import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyBookingAccessToken } from '@/lib/tokens';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting by IP
    const realIp = req.headers.get('x-real-ip');
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = realIp || (forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1');

    const rateCheck = await checkRateLimit('payhere_hash', ip, 15, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // 2. Extract payload
    const body = await req.json().catch(() => ({}));
    const { orderId, accessToken } = body;

    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    const secret = process.env.PAYHERE_MERCHANT_SECRET;
    const rawEnv = (process.env.PAYHERE_ENV || process.env.NEXT_PUBLIC_PAYHERE_ENV || '').trim().toLowerCase();
    const env = rawEnv === 'production' ? 'live' : rawEnv;

    // Fail closed: reject if credentials missing or env is neither 'live' nor 'sandbox'
    if (!merchantId || !secret) {
      console.error('PayHere credentials missing from environment.');
      return NextResponse.json({ error: 'Server misconfiguration: payment credentials missing' }, { status: 500 });
    }

    if (env !== 'live' && env !== 'sandbox') {
      console.error(`PayHere invalid environment setting: "${rawEnv}". Must be "live" or "sandbox".`);
      return NextResponse.json({ error: 'Server misconfiguration: payment environment invalid' }, { status: 500 });
    }

    const siteUrl =
      process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null);

    if (!siteUrl) {
      console.error('SITE_URL environment variable missing.');
      return NextResponse.json({ error: 'Server misconfiguration: site URL missing' }, { status: 500 });
    }


    if (!orderId || !accessToken) {
      return NextResponse.json({ error: 'Missing required authentication parameters' }, { status: 400 });
    }

    // 3. Timing-Safe HMAC Token Verification
    if (!verifyBookingAccessToken(orderId, accessToken)) {
      return NextResponse.json({ error: 'Invalid or expired access token' }, { status: 403 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }
    
    // 4. Fetch authoritative booking record
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, advance_amount, currency, payment_status, booking_status, created_at')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 404 });
    }

    // 5. Lifecycle & Expiry Guards
    if (booking.payment_status === 'advance_paid' || booking.payment_status === 'fully_paid') {
      return NextResponse.json({ error: 'Booking advance has already been paid.' }, { status: 409 });
    }

    if (booking.booking_status === 'cancelled') {
      return NextResponse.json({ error: 'This reservation has been cancelled.' }, { status: 409 });
    }

    // Stale booking expiration check (24 hours)
    const createdAtMs = new Date(booking.created_at).getTime();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    if (Date.now() - createdAtMs > twentyFourHoursMs) {
      return NextResponse.json({ error: 'Reservation has expired. Please initiate a new booking.' }, { status: 409 });
    }

    // 6. Format amount strictly to 2 decimal places
    const amountFormatted = Number(booking.advance_amount).toFixed(2);
    
    // 7. MD5 Signature Generation
    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
    const hashString = `${merchantId}${orderId}${amountFormatted}${booking.currency}${hashedSecret}`;
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    const notifyUrl = `${siteUrl.replace(/\/$/, '')}/api/payhere/notify`;

    return NextResponse.json({
      hash,
      merchantId,
      env,
      amount: amountFormatted,
      currency: booking.currency,
      notifyUrl,
    });
  } catch (error) {
    console.error('Error generating PayHere hash:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
