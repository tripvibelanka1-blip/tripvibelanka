'use server';

import { createClient } from '@/utils/supabase/server';
import { Booking, Enquiry, Tour } from '@/types/database';

export interface DashboardMetrics {
  financials: {
    revenueUSD: number;
    revenueLKR: number;
    advanceUSD: number;
    advanceLKR: number;
    balanceUSD: number;
    balanceLKR: number;
    settledCount: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  catalog: {
    totalTours: number;
    activeTours: number;
    featuredTours: number;
    totalDestinations: number;
    totalActivities: number;
    activeActivities: number;
    totalVehicles: number;
    activeVehicles: number;
    activeBanners: number;
  };
  enquiries: {
    total: number;
    unread: number;
    inProgress: number;
    resolved: number;
  };
  recentBookings: (Booking & { tours?: { title: string } | null })[];
  recentEnquiries: Enquiry[];
}

/**
 * Aggregates live operational and financial metrics across all tables
 * for the Executive Command Center Dashboard
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();

  try {
    const today = new Date().toISOString().split('T')[0];

    // Parallel aggregate queries
    const [
      // Bookings counts
      { count: totalBookings },
      { count: pendingBookings },
      { count: confirmedBookings },
      { count: completedBookings },
      { count: cancelledBookings },

      // All bookings for financial calculations
      { data: allBookings },

      // Catalog counts
      { count: totalTours },
      { count: activeTours },
      { count: featuredTours },
      { count: totalDestinations },
      { count: totalActivities },
      { count: activeActivities },
      { count: totalVehicles },
      { count: activeVehicles },
      { count: activeBanners },

      // Enquiries counts
      { count: totalEnquiries },
      { count: unreadEnquiries },
      { count: inProgressEnquiries },
      { count: resolvedEnquiries },

      // Activity feeds
      { data: recentBookingsData },
      { data: recentEnquiriesData },
    ] = await Promise.all([
      // Bookings counts
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'pending'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'confirmed'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'completed'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'cancelled'),

      // Financials rows (select amounts and currency)
      supabase.from('bookings').select('total_amount, advance_amount, remaining_balance, currency, booking_status, payment_status'),

      // Tours counts
      supabase.from('tours').select('*', { count: 'exact', head: true }),
      supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_featured', true),

      // Destinations count
      supabase.from('destinations').select('*', { count: 'exact', head: true }),

      // Activities counts
      supabase.from('activities').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*', { count: 'exact', head: true }).eq('is_active', true),

      // Vehicles counts
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('is_active', true),

      // Active Banners count
      supabase
        .from('banners')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`),

      // Enquiries counts
      supabase.from('enquiries').select('*', { count: 'exact', head: true }),
      supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
      supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),

      // Latest 5 Bookings
      supabase
        .from('bookings')
        .select('*, tours(title)')
        .order('created_at', { ascending: false })
        .limit(5),

      // Latest 5 Enquiries
      supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Compute Financials
    let revenueUSD = 0;
    let revenueLKR = 0;
    let advanceUSD = 0;
    let advanceLKR = 0;
    let balanceUSD = 0;
    let balanceLKR = 0;
    let settledCount = 0;

    if (allBookings && Array.isArray(allBookings)) {
      for (const b of allBookings) {
        // Exclude cancelled bookings from revenue calculations
        if (b.booking_status === 'cancelled') continue;

        const isSettled = b.payment_status === 'fully_paid';
        if (isSettled) settledCount++;

        const total = Number(b.total_amount) || 0;
        const advance = Number(b.advance_amount) || 0;
        const balance = Number(b.remaining_balance) || 0;

        if (b.currency === 'USD') {
          revenueUSD += total;
          advanceUSD += advance;
          if (!isSettled) balanceUSD += balance;
        } else {
          revenueLKR += total;
          advanceLKR += advance;
          if (!isSettled) balanceLKR += balance;
        }
      }
    }

    return {
      financials: {
        revenueUSD,
        revenueLKR,
        advanceUSD,
        advanceLKR,
        balanceUSD,
        balanceLKR,
        settledCount,
      },
      bookings: {
        total: totalBookings ?? 0,
        pending: pendingBookings ?? 0,
        confirmed: confirmedBookings ?? 0,
        completed: completedBookings ?? 0,
        cancelled: cancelledBookings ?? 0,
      },
      catalog: {
        totalTours: totalTours ?? 0,
        activeTours: activeTours ?? 0,
        featuredTours: featuredTours ?? 0,
        totalDestinations: totalDestinations ?? 0,
        totalActivities: totalActivities ?? 0,
        activeActivities: activeActivities ?? 0,
        totalVehicles: totalVehicles ?? 0,
        activeVehicles: activeVehicles ?? 0,
        activeBanners: activeBanners ?? 0,
      },
      enquiries: {
        total: totalEnquiries ?? 0,
        unread: unreadEnquiries ?? 0,
        inProgress: inProgressEnquiries ?? 0,
        resolved: resolvedEnquiries ?? 0,
      },
      recentBookings: (recentBookingsData as any) || [],
      recentEnquiries: (recentEnquiriesData as Enquiry[]) || [],
    };
  } catch (error) {
    console.error('[getDashboardMetrics] Exception:', error);
    // Return safe fallback metrics in case of network or DB timeout
    return {
      financials: {
        revenueUSD: 0,
        revenueLKR: 0,
        advanceUSD: 0,
        advanceLKR: 0,
        balanceUSD: 0,
        balanceLKR: 0,
        settledCount: 0,
      },
      bookings: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
      catalog: {
        totalTours: 0,
        activeTours: 0,
        featuredTours: 0,
        totalDestinations: 0,
        totalActivities: 0,
        activeActivities: 0,
        totalVehicles: 0,
        activeVehicles: 0,
        activeBanners: 0,
      },
      enquiries: { total: 0, unread: 0, inProgress: 0, resolved: 0 },
      recentBookings: [],
      recentEnquiries: [],
    };
  }
}
