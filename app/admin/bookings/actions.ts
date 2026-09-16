'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { BookingStatus, PaymentStatus } from '@/types/database';

/**
 * Update the overall lifecycle booking status
 */
export async function updateBookingStatus(bookingId: string, status: BookingStatus | string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized. Please log in as an admin.' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_status: status as BookingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('*, tours(id, title, duration_days, duration_nights, price_usd, price_lkr, cover_image)')
      .single();

    if (error) throw error;

    revalidatePath('/admin/bookings');
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to update booking status:', err);
    return { error: err.message || 'Failed to update booking status.' };
  }
}

/**
 * Update the payment status (e.g. pending, advance_paid, fully_paid, refunded)
 */
export async function updatePaymentStatus(bookingId: string, status: PaymentStatus | string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized. Please log in as an admin.' };
    }

    const updates: Record<string, any> = {
      payment_status: status as PaymentStatus,
      updated_at: new Date().toISOString(),
    };

    if (status === 'fully_paid') {
      updates.balance_settled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select('*, tours(id, title, duration_days, duration_nights, price_usd, price_lkr, cover_image)')
      .single();

    if (error) throw error;

    revalidatePath('/admin/bookings');
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to update payment status:', err);
    return { error: err.message || 'Failed to update payment status.' };
  }
}

/**
 * Mark 80% remaining balance as settled upon guest arrival (collected by driver/guide)
 */
export async function markBalanceCollected(bookingId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized. Please log in as an admin.' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        payment_status: 'fully_paid',
        balance_settled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('*, tours(id, title, duration_days, duration_nights, price_usd, price_lkr, cover_image)')
      .single();

    if (error) throw error;

    revalidatePath('/admin/bookings');
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to mark balance as collected:', err);
    return { error: err.message || 'Failed to record balance settlement.' };
  }
}

/**
 * Update dispatch logistics: assigned driver/guide and operator notes
 */
export async function updateDispatchInfo(
  bookingId: string,
  payload: { driver: string; notes: string }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized. Please log in as an admin.' };
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        assigned_driver_guide: payload.driver.trim() || null,
        admin_notes: payload.notes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('*, tours(id, title, duration_days, duration_nights, price_usd, price_lkr, cover_image)')
      .single();

    if (error) throw error;

    revalidatePath('/admin/bookings');
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to update dispatch logistics:', err);
    return { error: err.message || 'Failed to update dispatch info.' };
  }
}

/**
 * Delete a booking record with confirmation
 */
export async function deleteBooking(bookingId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized. Please log in as an admin.' };
    }

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

    if (error) throw error;

    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete booking:', err);
    return { error: err.message || 'Failed to delete booking.' };
  }
}

export interface CancelBookingPayload {
  refundPercentage: number;
  refundAmount: number;
  reason: string;
  notes?: string;
}

/**
 * Cancel a booking and process policy-calculated refund status
 */
export async function cancelBookingWithRefund(
  bookingId: string,
  payload: CancelBookingPayload
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized. Please log in as an admin.' };
    }

    const todayStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const cancellationLog = `[Cancelled on ${todayStr}] Reason: ${payload.reason}. Policy Refund: ${payload.refundPercentage}% (${payload.refundAmount}). ${payload.notes ? `Notes: ${payload.notes.trim()}` : ''}`.trim();

    // If refundAmount > 0: set payment_status to 'refunded'
    // If 0%: keep as 'advance_paid' or 'pending' but record cancellation
    const newPaymentStatus: PaymentStatus = payload.refundAmount > 0 ? 'refunded' : 'advance_paid';

    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        payment_status: newPaymentStatus,
        admin_notes: cancellationLog,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('*, tours(id, title, duration_days, duration_nights, price_usd, price_lkr, cover_image)')
      .single();

    if (error) throw error;

    revalidatePath('/admin/bookings');
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to cancel booking:', err);
    return { error: err.message || 'Failed to cancel booking and apply refund.' };
  }
}

