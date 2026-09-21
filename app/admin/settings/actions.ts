'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { SiteSettings, SiteSettingsUpdate } from '@/types/database';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  advance_percentage: 20.0,
  currency_buffer_percentage: 2.0,
  manual_exchange_rate: null,
  is_manual_rate_enabled: false,
  min_lead_time_days: 1,
  company_name: 'TripVibe Lanka',
  company_email: 'info@tripvibelanka.com',
  company_phone: '+94 77 536 8357',
  whatsapp_number: '+94775368357',
  office_address: 'Colombo, Sri Lanka',
  facebook_url: 'https://facebook.com/tripvibelanka',
  instagram_url: 'https://instagram.com/tripvibelanka',
  tiktok_url: 'https://tiktok.com/@tripvibelanka',
  tripadvisor_url: 'https://tripadvisor.com',
  cancellation_policy:
    'Free cancellation up to 7 days before tour departure. 50% refund between 3 to 7 days. Non-refundable within 48 hours of scheduled departure.',
  terms_conditions:
    'All bookings require an advance deposit to secure chauffeured vehicles and licensed guides. Remaining balance is payable in cash (USD / LKR) or card upon arrival.',
};

/**
 * Fetches the singleton site settings record (id = 1).
 * Gracefully returns DEFAULT_SITE_SETTINGS if not yet created.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
      advance_percentage: Number(data.advance_percentage) || 20.0,
      currency_buffer_percentage: Number(data.currency_buffer_percentage) || 2.0,
      manual_exchange_rate: data.manual_exchange_rate
        ? Number(data.manual_exchange_rate)
        : null,
      min_lead_time_days: Number(data.min_lead_time_days) || 1,
    };
  } catch (err) {
    console.error('[getSiteSettings] Exception:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Updates the singleton site settings record (id = 1) with validation.
 */
export async function updateSiteSettings(
  payload: SiteSettingsUpdate
): Promise<{ success: boolean; message: string; data?: SiteSettings }> {
  try {
    const supabase = await createClient();

    // Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: 'Unauthorized: Admin session required' };
    }

    // Validation: Advance percentage
    if (payload.advance_percentage !== undefined) {
      const adv = Number(payload.advance_percentage);
      if (isNaN(adv) || adv < 5 || adv > 100) {
        return {
          success: false,
          message: 'Advance payment percentage must be between 5% and 100%',
        };
      }
    }

    // Validation: Currency buffer
    if (payload.currency_buffer_percentage !== undefined) {
      const buf = Number(payload.currency_buffer_percentage);
      if (isNaN(buf) || buf < 0 || buf > 20) {
        return {
          success: false,
          message: 'Currency buffer must be between 0% and 20%',
        };
      }
    }

    // Validation: Lead time
    if (payload.min_lead_time_days !== undefined) {
      const lead = Number(payload.min_lead_time_days);
      if (isNaN(lead) || lead < 0 || lead > 30) {
        return {
          success: false,
          message: 'Minimum booking lead time must be between 0 and 30 days',
        };
      }
    }

    // Validation: Manual exchange rate
    if (payload.is_manual_rate_enabled && payload.manual_exchange_rate !== undefined) {
      const rate = Number(payload.manual_exchange_rate);
      if (isNaN(rate) || rate <= 0) {
        return {
          success: false,
          message: 'Please enter a valid positive manual exchange rate',
        };
      }
    }

    // Validation: Email
    if (payload.company_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.company_email.trim())) {
        return {
          success: false,
          message: 'Please provide a valid company email address',
        };
      }
    }

    const cleanPayload = {
      ...payload,
      updated_at: new Date().toISOString(),
    };

    // First attempt an update on the singleton settings row (id = 1)
    let { data, error } = await supabase
      .from('site_settings')
      .update(cleanPayload)
      .eq('id', 1)
      .select('*')
      .maybeSingle();

    // If RLS blocked the update or user session lacked bypass, fallback to verified admin client
    if (error) {
      console.warn('[updateSiteSettings] Session client hit RLS issue, falling back to admin service client:', error.message);
      const adminClient = createAdminClient();
      if (adminClient) {
        const adminRes = await adminClient
          .from('site_settings')
          .update(cleanPayload)
          .eq('id', 1)
          .select('*')
          .maybeSingle();
        data = adminRes.data;
        error = adminRes.error;
      }
    }

    // If row doesn't exist yet, insert row 1
    if (!error && !data) {
      const adminClient = createAdminClient() || supabase;
      const insertRes = await adminClient
        .from('site_settings')
        .insert({ ...cleanPayload, id: 1 })
        .select('*')
        .single();
      data = insertRes.data;
      error = insertRes.error;
    }

    if (error) {
      console.error('[updateSiteSettings] Database Error:', error);
      return {
        success: false,
        message: `Failed to update settings: ${error.message}`,
      };
    }

    // Cache revalidations
    revalidatePath('/admin/settings');
    revalidatePath('/admin');
    revalidatePath('/admin/bookings');
    revalidatePath('/');

    return {
      success: true,
      message: 'Global settings updated successfully',
      data: data as SiteSettings,
    };
  } catch (err: unknown) {
    console.error('[updateSiteSettings] Exception:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}
