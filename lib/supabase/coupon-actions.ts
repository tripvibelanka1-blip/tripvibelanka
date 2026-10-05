'use server';

import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export interface CouponValidationResult {
  isValid: boolean;
  error?: string;
  couponCode?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  bannerTitle?: string;
}

/**
 * Public action: Validate customer coupon code against active promotional banners
 * Protected with rate limiting to prevent code enumeration / brute-forcing.
 */
export async function validateCouponCode(
  code: string,
  subtotal: number,
  currency: 'USD' | 'LKR' = 'USD',
  exchangeRate: number = 328.0
): Promise<CouponValidationResult> {
  try {
    // 1. Rate limiting by IP
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = realIp || (forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1');

    const rateCheck = await checkRateLimit('coupon_validate', ip, 15, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return { isValid: false, error: 'Too many promo code attempts. Please try again in 10 minutes.' };
    }

    const cleanCode = code?.trim().toUpperCase();
    // Strict alphanumeric/hyphen validation: blocks SQL wildcard % and _
    if (!cleanCode || !/^[A-Z0-9-]{2,32}$/.test(cleanCode)) {
      return { isValid: false, error: 'Please enter a valid promo code (letters and numbers only)' };
    }

    if (subtotal <= 0) {
      return { isValid: false, error: 'Cannot apply coupon to zero subtotal' };
    }

    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Find matching banner by exact coupon_code (.eq, not .ilike to prevent wildcard matching)
    const { data: banner, error } = await supabase
      .from('banners')
      .select('title, coupon_code, discount_type, discount_value, start_date, end_date, is_active')
      .eq('coupon_code', cleanCode)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[validateCouponCode] DB Error:', error);
      return { isValid: false, error: 'Failed to validate coupon code' };
    }

    if (!banner) {
      return { isValid: false, error: `Coupon code "${cleanCode}" is invalid or expired` };
    }

    // Verify date range schedule
    if (banner.start_date && banner.start_date > today) {
      return { isValid: false, error: `This promotion starts on ${banner.start_date}` };
    }

    if (banner.end_date && banner.end_date < today) {
      return { isValid: false, error: `Coupon code "${cleanCode}" expired on ${banner.end_date}` };
    }

    const discountType = banner.discount_type || 'percentage';
    const discountValue = Number(banner.discount_value ?? 0);
    if (isNaN(discountValue) || discountValue <= 0) {
      return { isValid: false, error: 'This coupon has no active discount configured' };
    }

    let calculatedDiscount = 0;

    if (discountType === 'percentage') {
      calculatedDiscount = Math.round(subtotal * (discountValue / 100) * 100) / 100;
    } else {
      // Fixed amount discount
      if (currency === 'USD') {
        calculatedDiscount = discountValue;
      } else {
        calculatedDiscount = Math.round(discountValue * (exchangeRate || 328.0));
      }
    }

    calculatedDiscount = Math.min(calculatedDiscount, subtotal);

    return {
      isValid: true,
      couponCode: cleanCode,
      discountType,
      discountValue,
      discountAmount: calculatedDiscount,
      bannerTitle: banner.title,
    };

  } catch (err: any) {
    console.error('[validateCouponCode] Unexpected error:', err);
    return { isValid: false, error: 'Error calculating coupon discount' };
  }
}
