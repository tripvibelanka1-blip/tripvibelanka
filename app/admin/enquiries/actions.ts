'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Enquiry, EnquiryInsert, EnquiryStatus, EnquiryType } from '@/types/database';

export interface ActionResult<T = unknown> {
  data: T | null;
  error: string | null;
}

export interface EnquiryStats {
  total: number;
  unread: number;
  inProgress: number;
  resolved: number;
}

/**
 * Fetch enquiries with optional status or category filter
 */
export async function getEnquiries(
  status?: EnquiryStatus | 'all',
  type?: EnquiryType | 'all'
): Promise<ActionResult<Enquiry[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (type && type !== 'all') {
      query = query.eq('enquiry_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { data: (data as Enquiry[]) || [], error: null };
  } catch (err: any) {
    console.error('[getEnquiries] Error:', err);
    return { data: null, error: err.message || 'Failed to fetch customer enquiries' };
  }
}

/**
 * Fetch aggregate KPI stats for the enquiries module
 */
export async function getEnquiryStats(): Promise<ActionResult<EnquiryStats>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('enquiries')
      .select('status');

    if (error) throw error;

    const stats: EnquiryStats = {
      total: data?.length || 0,
      unread: data?.filter((e) => e.status === 'unread').length || 0,
      inProgress: data?.filter((e) => e.status === 'in_progress').length || 0,
      resolved: data?.filter((e) => e.status === 'resolved').length || 0,
    };

    return { data: stats, error: null };
  } catch (err: any) {
    console.error('[getEnquiryStats] Error:', err);
    return {
      data: { total: 0, unread: 0, inProgress: 0, resolved: 0 },
      error: err.message || 'Failed to calculate enquiry stats',
    };
  }
}

/**
 * Update the status of an enquiry (unread -> in_progress -> resolved)
 */
export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<ActionResult<Enquiry>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('enquiries')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin');
    return { data: data as Enquiry, error: null };
  } catch (err: any) {
    console.error('[updateEnquiryStatus] Error:', err);
    return { data: null, error: err.message || 'Failed to update enquiry status' };
  }
}

/**
 * Update internal CRM follow-up notes for an enquiry
 */
export async function updateAdminNotes(
  id: string,
  adminNotes: string
): Promise<ActionResult<Enquiry>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('enquiries')
      .update({
        admin_notes: adminNotes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/enquiries');
    return { data: data as Enquiry, error: null };
  } catch (err: any) {
    console.error('[updateAdminNotes] Error:', err);
    return { data: null, error: err.message || 'Failed to save notes' };
  }
}

/**
 * Delete an enquiry permanently from the database
 */
export async function deleteEnquiry(id: string): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin');
    return { data: true, error: null };
  } catch (err: any) {
    console.error('[deleteEnquiry] Error:', err);
    return { data: false, error: err.message || 'Failed to delete enquiry' };
  }
}

/**
 * Submit a public enquiry from visitor website contact or tour/activity detail pages
 */
export async function submitPublicEnquiry(
  payload: EnquiryInsert
): Promise<ActionResult<Enquiry>> {
  try {
    if (!payload.name?.trim()) {
      return { data: null, error: 'Name is required' };
    }
    if (!payload.email?.trim()) {
      return { data: null, error: 'Email address is required' };
    }
    if (!payload.message?.trim()) {
      return { data: null, error: 'Message is required' };
    }

    const supabase = await createClient();
    const insertData = {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim() || null,
      enquiry_type: payload.enquiry_type || 'General',
      reference_title: payload.reference_title?.trim() || null,
      message: payload.message.trim(),
      status: 'unread' as EnquiryStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('enquiries')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin');
    return { data: data as Enquiry, error: null };
  } catch (err: any) {
    console.error('[submitPublicEnquiry] Error:', err);
    return { data: null, error: err.message || 'Failed to send enquiry. Please try again.' };
  }
}
