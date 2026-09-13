'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Banner, BannerInsert } from '@/types/database';

export type PromoBanner = Banner;

export interface ActionResult<T = any> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all promotional banners for admin management table
 */
export async function getAdminBanners(): Promise<ActionResult<Banner[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: (data as Banner[]) || [], error: null };
  } catch (err: any) {
    console.error('[getAdminBanners] Error:', err);
    return { data: null, error: err.message || 'Failed to fetch banners' };
  }
}

/**
 * Fetch a single promotional banner by ID for edit form
 */
export async function getBannerById(id: string): Promise<ActionResult<Banner>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: data as Banner, error: null };
  } catch (err: any) {
    console.error('[getBannerById] Error:', err);
    return { data: null, error: err.message || 'Failed to fetch banner' };
  }
}

/**
 * Fetch currently active and schedule-valid promotional banner for client frontend
 */
export async function getActivePublicBanner(): Promise<ActionResult<Banner | null>> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { data: data as Banner | null, error: null };
  } catch (err: any) {
    console.error('[getActivePublicBanner] Error:', err);
    return { data: null, error: err.message || 'Failed to fetch active banner' };
  }
}

/**
 * Create or update a promotional banner
 */
export async function upsertBanner(payload: BannerInsert & { id?: string }): Promise<ActionResult<Banner>> {
  try {
    if (!payload.title || !payload.title.trim()) {
      return { data: null, error: 'Promotion title is required' };
    }
    if (!payload.button_text || !payload.button_text.trim()) {
      return { data: null, error: 'Button text is required' };
    }
    if (!payload.button_link || !payload.button_link.trim()) {
      return { data: null, error: 'Button link target is required' };
    }

    const supabase = await createClient();

    const bannerData = {
      badge_text: payload.badge_text?.trim() || 'Limited Seasonal Offer',
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      coupon_code: payload.coupon_code?.trim() ? payload.coupon_code.trim().toUpperCase() : null,
      discount_type: payload.discount_type || 'percentage',
      discount_value: Number(payload.discount_value ?? 15),
      button_text: payload.button_text.trim(),
      button_link: payload.button_link.trim(),
      validity_text: payload.validity_text?.trim() || null,
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      is_active: payload.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    let resultData: Banner;

    if (payload.id) {
      // Update existing
      const { data, error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', payload.id)
        .select()
        .single();

      if (error) throw error;
      resultData = data as Banner;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('banners')
        .insert({
          ...bannerData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      resultData = data as Banner;
    }

    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { data: resultData, error: null };
  } catch (err: any) {
    console.error('[upsertBanner] Error:', err);
    return { data: null, error: err.message || 'Failed to save promotional banner' };
  }
}

/**
 * Toggle active/inactive status of a promotional banner
 */
export async function toggleBannerStatus(id: string, currentStatus: boolean): Promise<ActionResult<Banner>> {
  try {
    const supabase = await createClient();
    const nextStatus = !currentStatus;

    const { data, error } = await supabase
      .from('banners')
      .update({
        is_active: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { data: data as Banner, error: null };
  } catch (err: any) {
    console.error('[toggleBannerStatus] Error:', err);
    return { data: null, error: err.message || 'Failed to toggle banner status' };
  }
}

/**
 * Delete a promotional banner
 */
export async function deleteBanner(id: string): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { data: true, error: null };
  } catch (err: any) {
    console.error('[deleteBanner] Error:', err);
    return { data: false, error: err.message || 'Failed to delete banner' };
  }
}

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
 * Validate customer coupon code against active promotional banners
 * and calculate the exact discounted amount in real-time
 */
export async function validateCouponCode(
  code: string,
  subtotal: number,
  currency: 'USD' | 'LKR' = 'USD',
  exchangeRate: number = 328.0
): Promise<CouponValidationResult> {
  try {
    const cleanCode = code?.trim().toUpperCase();
    if (!cleanCode) {
      return { isValid: false, error: 'Please enter a promo code' };
    }

    if (subtotal <= 0) {
      return { isValid: false, error: 'Cannot apply coupon to zero subtotal' };
    }

    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Find matching banner by coupon_code (case-insensitive)
    const { data: banner, error } = await supabase
      .from('banners')
      .select('*')
      .ilike('coupon_code', cleanCode)
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
    const discountValue = Number(banner.discount_value) || 15;
    let calculatedDiscount = 0;

    if (discountType === 'percentage') {
      calculatedDiscount = Math.round(subtotal * (discountValue / 100) * 100) / 100;
    } else {
      // Fixed amount discount
      if (currency === 'USD') {
        calculatedDiscount = discountValue;
      } else {
        // Converted fixed discount for LKR
        calculatedDiscount = Math.round(discountValue * (exchangeRate || 328.0));
      }
    }

    // Ensure discount does not exceed subtotal
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

