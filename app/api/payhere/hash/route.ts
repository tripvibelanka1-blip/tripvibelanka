import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, currency } = await req.json();

    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    const secret = process.env.PAYHERE_MERCHANT_SECRET;
    const env = process.env.NEXT_PUBLIC_PAYHERE_ENV || 'sandbox';

    if (!merchantId || !secret) {
      return NextResponse.json({ error: 'PayHere credentials not configured' }, { status: 500 });
    }

    if (!orderId || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Format amount to 2 decimal places as required by PayHere
    const amountFormatted = parseFloat(amount).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, '');

    // 1. md5(secret) -> uppercase
    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();

    // 2. merchantId + orderId + amountFormatted + currency + hashedSecret
    const hashString = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
    
    // 3. md5(hashString) -> uppercase
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    return NextResponse.json({
      hash,
      merchantId,
      env
    });
  } catch (error) {
    console.error('Error generating PayHere hash:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
