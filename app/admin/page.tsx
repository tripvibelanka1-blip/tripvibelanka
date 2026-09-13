import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import {
  CalendarCheck,
  Plus,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { getDashboardMetrics } from '@/app/admin/dashboard-actions';
import KPIGrid from '@/components/admin/dashboard/KPIGrid';
import RecentActivity from '@/components/admin/dashboard/RecentActivity';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch unified operational and financial metrics across all tables
  const metrics = await getDashboardMetrics();

  const hasActionItems = metrics.enquiries.unread > 0 || metrics.bookings.pending > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Clean Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time overview of revenue, reservations, customer leads, and catalog inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-lg shadow-2xs transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Manage Bookings</span>
          </Link>
          <Link
            href="/admin/tours/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#e05e00] rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tour Package</span>
          </Link>
        </div>
      </div>

      {/* 2. Operational Action Alert (Conditional, highly useful) */}
      {hasActionItems && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Action Required:
              {metrics.enquiries.unread > 0 && (
                <span className="ml-1">
                  <strong>{metrics.enquiries.unread}</strong> unread customer {metrics.enquiries.unread === 1 ? 'inquiry' : 'inquiries'}
                </span>
              )}
              {metrics.enquiries.unread > 0 && metrics.bookings.pending > 0 && ' and '}
              {metrics.bookings.pending > 0 && (
                <span className="ml-1">
                  <strong>{metrics.bookings.pending}</strong> pending {metrics.bookings.pending === 1 ? 'booking' : 'bookings'} awaiting review
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {metrics.enquiries.unread > 0 && (
              <Link
                href="/admin/enquiries"
                className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2"
              >
                Review Inquiries →
              </Link>
            )}
            {metrics.bookings.pending > 0 && (
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2"
              >
                Review Bookings →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. Unified KPI Cards & Quick Module Navigation */}
      <KPIGrid metrics={metrics} />

      {/* 4. High-Density Activity Feeds (Latest Bookings & Inquiries) */}
      <RecentActivity
        recentBookings={metrics.recentBookings}
        recentEnquiries={metrics.recentEnquiries}
      />
    </div>
  );
}
