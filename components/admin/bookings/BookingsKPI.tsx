import React from 'react';
import { Booking } from '@/types/database';
import {
  CalendarCheck2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface BookingsKPIProps {
  bookings: Booking[];
}

export default function BookingsKPI({ bookings }: BookingsKPIProps) {
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.booking_status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.booking_status === 'confirmed').length;

  // Active bookings (not cancelled) for financial sums
  const nonCancelled = bookings.filter((b) => b.booking_status !== 'cancelled');

  // Advance Payments Collected (20% Advance)
  const advanceUsd = nonCancelled
    .filter((b) => b.currency === 'USD' && (b.payment_status === 'advance_paid' || b.payment_status === 'fully_paid'))
    .reduce((sum, b) => sum + Number(b.advance_amount || 0), 0);
  const advanceLkr = nonCancelled
    .filter((b) => b.currency === 'LKR' && (b.payment_status === 'advance_paid' || b.payment_status === 'fully_paid'))
    .reduce((sum, b) => sum + Number(b.advance_amount || 0), 0);

  // Outstanding Balance Due on Arrival (80% Balance)
  const balanceUsd = nonCancelled
    .filter((b) => b.currency === 'USD' && b.payment_status !== 'fully_paid')
    .reduce((sum, b) => sum + Number(b.remaining_balance || 0), 0);
  const balanceLkr = nonCancelled
    .filter((b) => b.currency === 'LKR' && b.payment_status !== 'fully_paid')
    .reduce((sum, b) => sum + Number(b.remaining_balance || 0), 0);

  const formatDualCurrency = (usd: number, lkr: number) => {
    const parts: string[] = [];
    if (usd > 0 || lkr === 0) {
      parts.push(`$${usd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
    }
    if (lkr > 0) {
      parts.push(`Rs. ${lkr.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
    }
    return parts.join(' + ');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Bookings & Pending Count */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Bookings
          </span>
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
            <CalendarCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
          {totalCount}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              <Clock className="w-3 h-3 text-amber-600" />
              {pendingCount} Pending Review
            </span>
          ) : (
            <span className="text-slate-400 font-medium">All reservations reviewed</span>
          )}
        </div>
      </div>

      {/* 2. Confirmed Bookings */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Confirmed Bookings
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-emerald-700 tracking-tight">
          {confirmedCount}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Locked itineraries & scheduled departures
        </div>
      </div>

      {/* 3. Advance Payments Collected (20%) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Advance Collected (20%)
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-xl font-black text-sky-700 tracking-tight truncate">
          {formatDualCurrency(advanceUsd, advanceLkr)}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Secured via Online / Sim</span>
        </div>
      </div>

      {/* 4. Outstanding Balance Due on Arrival (80%) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Balance Due on Arrival (80%)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Banknote className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-xl font-black text-amber-700 tracking-tight truncate">
          {formatDualCurrency(balanceUsd, balanceLkr)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Payable directly to tour driver in cash/card
        </div>
      </div>
    </div>
  );
}
