import React from 'react';
import { PaymentStatus, BookingStatus } from '@/types/database';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';

export function PaymentStatusBadge({ status }: { status: PaymentStatus | string }) {
  switch (status) {
    case 'advance_paid':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
          <Clock className="w-3 h-3 text-sky-600" />
          <span>20% Advance Paid</span>
        </span>
      );
    case 'fully_paid':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Fully Settled</span>
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Payment Pending</span>
        </span>
      );
    case 'refunded':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
          <RefreshCw className="w-3 h-3 text-slate-500" />
          <span>Refunded</span>
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Payment Failed</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
          <span>{status}</span>
        </span>
      );
  }
}

export function BookingStatusBadge({ status }: { status: BookingStatus | string }) {
  switch (status) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-900 border border-orange-200/80 shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-[#FF6B00]" />
          <span>Confirmed</span>
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Tour Completed</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>Cancelled</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending Confirmation</span>
        </span>
      );
  }
}
