'use client';

import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  CalendarCheck,
  MessageSquare,
  Compass,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Car,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
} from 'lucide-react';
import { DashboardMetrics } from '@/app/admin/dashboard-actions';

interface KPIGridProps {
  metrics: DashboardMetrics;
}

export default function KPIGrid({ metrics }: KPIGridProps) {
  const { financials, bookings, catalog, enquiries } = metrics;

  return (
    <div className="space-y-4">
      {/* 4-Card Unified Enterprise KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Gross Revenue */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Gross Tour Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                ${financials.revenueUSD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <span className="text-xs font-normal text-slate-500 ml-1.5 font-sans">USD</span>
              </div>
              {financials.revenueLKR > 0 && (
                <div className="text-xs font-medium text-slate-600 font-mono">
                  + Rs. {financials.revenueLKR.toLocaleString()} <span className="text-[10px] text-slate-400">LKR</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">
                Advance (20%)
              </span>
              <span className="font-semibold text-emerald-700 font-mono">
                ${financials.advanceUSD.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">
                Due On Arrival
              </span>
              <span className="font-semibold text-slate-700 font-mono">
                ${financials.balanceUSD.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Bookings Pipeline */}
        <Link
          href="/admin/bookings"
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Bookings Pipeline
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {bookings.total}
              <span className="text-xs font-normal text-slate-500 ml-1.5">Total Orders</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {bookings.confirmed} confirmed
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {bookings.pending} pending
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
        </Link>

        {/* 3. Inbound Enquiries */}
        <Link
          href="/admin/enquiries"
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Customer Leads
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {enquiries.total}
              <span className="text-xs font-normal text-slate-500 ml-1.5">Inquiries</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {enquiries.unread > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {enquiries.unread} unread
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  All caught up
                </span>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">
                {enquiries.inProgress} in review
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
        </Link>

        {/* 4. Active Catalog */}
        <Link
          href="/admin/tours"
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Catalog
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Compass className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {catalog.activeTours}
              <span className="text-xs font-normal text-slate-500 ml-1.5">Tours Published</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2 text-[11px]">
              <span>{catalog.totalDestinations} regions</span>
              <span className="text-slate-300">•</span>
              <span>{catalog.activeActivities} activities</span>
              <span className="text-slate-300">•</span>
              <span>{catalog.activeVehicles} fleet</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Sleek Enterprise Module Quick-Navigation Bar (Replaces old clunky black launchpad) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-semibold text-slate-700">Quick Jump:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/admin/tours"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            Tours ({catalog.totalTours})
          </Link>
          <Link
            href="/admin/bookings"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            Bookings ({bookings.total})
          </Link>
          <Link
            href="/admin/enquiries"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            Enquiries ({enquiries.total})
          </Link>
          <Link
            href="/admin/destinations"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            Destinations ({catalog.totalDestinations})
          </Link>
          <Link
            href="/admin/activities"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            Activities ({catalog.totalActivities})
          </Link>
          <Link
            href="/admin/vehicles"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            Fleet ({catalog.totalVehicles})
          </Link>
          <Link
            href="/admin/banners"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            Banners ({catalog.activeBanners})
          </Link>
          <Link
            href="/admin/settings"
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/60"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
