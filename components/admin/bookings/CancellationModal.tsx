'use client';

import React, { useState, useMemo } from 'react';
import { Booking } from '@/types/database';
import { calculateCancellationEligibility, CancellationEligibility } from '@/lib/utils/cancellation';
import { cancelBookingWithRefund } from '@/app/admin/bookings/actions';
import {
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  Loader2,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onCancelled: (updatedBooking: Booking) => void;
}

const CANCELLATION_REASONS = [
  'Customer Request (Voluntary)',
  'Medical / Health Emergency',
  'Extreme Weather / Safety / Force Majeure',
  'Customer No-Show (No Prior Notice)',
  'Rescheduled to Future Itinerary Date',
  'Company / Operational Cancellation',
  'Other Administrative Reason',
];

export default function CancellationModal({
  isOpen,
  onClose,
  booking,
  onCancelled,
}: CancellationModalProps) {
  const eligibility: CancellationEligibility = useMemo(() => {
    return calculateCancellationEligibility(booking.travel_date, booking.advance_amount);
  }, [booking.travel_date, booking.advance_amount]);

  // Admin selected refund tier (defaults to policy recommendation)
  const [selectedTier, setSelectedTier] = useState<'recommended' | '100' | '50' | '0' | 'custom'>('recommended');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPayHere, setCopiedPayHere] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cancelledResult, setCancelledResult] = useState<Booking | null>(null);

  // Calculate actual refund amount based on selection
  const actualRefundPercentage = useMemo(() => {
    if (selectedTier === 'recommended') return eligibility.percentage;
    if (selectedTier === '100') return 100;
    if (selectedTier === '50') return 50;
    if (selectedTier === '0') return 0;
    // custom
    const num = parseFloat(customAmount) || 0;
    return booking.advance_amount > 0 ? Math.round((num / booking.advance_amount) * 100) : 0;
  }, [selectedTier, eligibility.percentage, customAmount, booking.advance_amount]);

  const actualRefundAmount = useMemo(() => {
    if (selectedTier === 'recommended') return eligibility.refundAmount;
    if (selectedTier === '100') return booking.advance_amount;
    if (selectedTier === '50') return Math.round(booking.advance_amount * 0.5 * 100) / 100;
    if (selectedTier === '0') return 0;
    return Math.max(0, parseFloat(customAmount) || 0);
  }, [selectedTier, eligibility.refundAmount, customAmount, booking.advance_amount]);

  if (!isOpen) return null;

  const actualRetainedAmount = Math.max(0, Math.round((booking.advance_amount - actualRefundAmount) * 100) / 100);

  const handleCopyPayHere = () => {
    if (booking.payhere_payment_id) {
      navigator.clipboard.writeText(booking.payhere_payment_id);
      setCopiedPayHere(true);
      setTimeout(() => setCopiedPayHere(false), 2000);
    }
  };

  const handleConfirmCancellation = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await cancelBookingWithRefund(booking.id, {
        refundPercentage: actualRefundPercentage,
        refundAmount: actualRefundAmount,
        reason: selectedReason,
        notes: additionalNotes,
      });

      if (res.error) {
        setErrorMsg(res.error);
        setIsSubmitting(false);
        return;
      }

      if (res.data) {
        setIsSuccess(true);
        setCancelledResult(res.data as Booking);
        onCancelled(res.data as Booking);
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  // WhatsApp confirmation text generator
  const cleanPhone = booking.customer_phone.replace(/[^0-9]/g, '');
  const refundMessage =
    actualRefundAmount > 0
      ? `Hello ${booking.customer_name}, Greetings from Tripvibe Lanka. Regarding your booking ${booking.reference_no} for ${booking.travel_date}: Your reservation has been cancelled. As per our cancellation policy (${eligibility.daysUntilTour} days notice), an eligible refund of ${booking.currency} ${actualRefundAmount.toLocaleString()} has been approved and processed to your original payment method. Reference: ${booking.payhere_payment_id || booking.reference_no}. Funds typically reflect within 3 to 7 business days. Please feel free to reach out if you have any questions.`
      : `Hello ${booking.customer_name}, Greetings from Tripvibe Lanka. Regarding your booking ${booking.reference_no} for ${booking.travel_date}: Your reservation has been cancelled per your request. As per our cancellation terms (${eligibility.daysUntilTour} days notice), cancellations made less than 15 days before departure are non-refundable as vehicle and guide allocations have already been committed. We appreciate your understanding and hope to welcome you to Sri Lanka in the future.`;

  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(refundMessage)}`;

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Cancellation &amp; Refund Policy
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Booking: <span className="text-[#FF6B00] font-bold">{booking.reference_no}</span> · {booking.customer_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm text-slate-700">
          {isSuccess ? (
            /* Success View */
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 font-heading">
                  Booking Successfully Cancelled
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  The status has been updated to <strong className="text-rose-600">Cancelled</strong> and payment status set to{' '}
                  <strong className="text-emerald-700">{cancelledResult?.payment_status}</strong>.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Notice Given:</span>
                  <span className="font-bold text-slate-800">{eligibility.daysUntilTour} Days until departure</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Refund Approved:</span>
                  <span className="font-bold text-emerald-700">
                    {booking.currency} {actualRefundAmount.toLocaleString()} ({actualRefundPercentage}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Retained Fee:</span>
                  <span className="font-bold text-slate-700">
                    {booking.currency} {actualRetainedAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action: Send WhatsApp Confirmation */}
              <div className="pt-2 space-y-2">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Send WhatsApp Confirmation to Customer</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                >
                  Done &amp; Close Drawer
                </button>
              </div>
            </div>
          ) : (
            /* Assessment & Confirmation Form */
            <>
              {/* 1. Automated System Policy Eligibility Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="space-y-1 pb-2.5 border-b border-slate-200/70">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Calendar className="w-4 h-4 text-[#FF6B00]" />
                      <span>Departure Date: {booking.travel_date}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-800 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                      {eligibility.daysUntilTour > 1
                        ? `${eligibility.daysUntilTour} Days Until Tour Starts`
                        : eligibility.daysUntilTour === 1
                        ? '1 Day Until Tour (Departs Tomorrow)'
                        : eligibility.daysUntilTour === 0
                        ? 'Departs Today'
                        : 'Tour Departure Passed'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                    <span>
                      Notice Period: <strong>Today</strong> vs. <strong>Departure ({booking.travel_date})</strong>
                    </span>
                    <span className="font-semibold text-slate-700">
                      {eligibility.daysUntilTour >= 0
                        ? `${eligibility.daysUntilTour} days notice`
                        : `${Math.abs(eligibility.daysUntilTour)} days ago`}
                    </span>
                  </div>
                </div>

                {/* Policy Tier Output Badge */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    System Policy Rule Match:
                  </span>
                  <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${eligibility.badgeClass}`}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold">{eligibility.tierTitle}</div>
                      <div className="opacity-90">{eligibility.policySummary}</div>
                    </div>
                  </div>
                </div>

                {/* Financial Calculation Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 font-medium block">20% Advance Paid</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {booking.currency} {Number(booking.advance_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/70">
                    <span className="text-[10px] text-emerald-600 font-bold block">Policy Refund</span>
                    <span className="font-black text-emerald-800 text-xs">
                      {booking.currency} {eligibility.refundAmount.toLocaleString()} ({eligibility.percentage}%)
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200/70">
                    <span className="text-[10px] text-slate-500 font-medium block">Retained Fee</span>
                    <span className="font-bold text-slate-700 text-xs">
                      {booking.currency} {eligibility.retainedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Refund Decision Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Select Refund Resolution:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Recommended Policy Tier */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTier === 'recommended'
                        ? 'bg-orange-50/50 border-[#FF6B00] text-slate-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="refundTier"
                      value="recommended"
                      checked={selectedTier === 'recommended'}
                      onChange={() => setSelectedTier('recommended')}
                      className="accent-[#FF6B00]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>Recommended ({eligibility.percentage}%)</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#FF6B00] text-white rounded font-bold">
                          Policy
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {booking.currency} {eligibility.refundAmount.toLocaleString()}
                      </span>
                    </div>
                  </label>

                  {/* 100% Full Refund Override */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTier === '100'
                        ? 'bg-emerald-50/60 border-emerald-500 text-slate-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="refundTier"
                      value="100"
                      checked={selectedTier === '100'}
                      onChange={() => setSelectedTier('100')}
                      className="accent-emerald-600"
                    />
                    <div>
                      <span>Full 100% Refund</span>
                      <span className="text-[11px] text-emerald-700 block font-normal">
                        {booking.currency} {Number(booking.advance_amount).toLocaleString()}
                      </span>
                    </div>
                  </label>

                  {/* 50% Partial Refund Override */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTier === '50'
                        ? 'bg-amber-50/60 border-amber-500 text-slate-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="refundTier"
                      value="50"
                      checked={selectedTier === '50'}
                      onChange={() => setSelectedTier('50')}
                      className="accent-amber-600"
                    />
                    <div>
                      <span>Partial 50% Refund</span>
                      <span className="text-[11px] text-amber-700 block font-normal">
                        {booking.currency} {(Math.round(booking.advance_amount * 0.5)).toLocaleString()}
                      </span>
                    </div>
                  </label>

                  {/* 0% No Refund */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTier === '0'
                        ? 'bg-rose-50/60 border-rose-500 text-slate-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="refundTier"
                      value="0"
                      checked={selectedTier === '0'}
                      onChange={() => setSelectedTier('0')}
                      className="accent-rose-600"
                    />
                    <div>
                      <span>No Refund (0%)</span>
                      <span className="text-[11px] text-rose-700 block font-normal">
                        Advance retained
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. PayHere Gateway Information Box */}
              {booking.payhere_payment_id ? (
                <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-sky-900">
                      <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                      <span>PayHere Online Transaction ID</span>
                    </div>
                    <a
                      href="https://www.payhere.lk/merchant/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:underline"
                    >
                      <span>PayHere Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-sky-100 font-mono text-xs">
                    <span className="text-slate-800 font-bold">{booking.payhere_payment_id}</span>
                    <button
                      type="button"
                      onClick={handleCopyPayHere}
                      className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 cursor-pointer"
                    >
                      {copiedPayHere ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPayHere ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-sky-800 leading-snug">
                    Log into PayHere &gt; Transactions &gt; search this ID &gt; click <strong>Refund</strong> to return funds to customer&apos;s card.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No PayHere ID recorded (Direct simulation or Bank transfer booking).</span>
                </div>
              )}

              {/* 4. Reason for Cancellation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Primary Reason for Cancellation:
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                >
                  {CANCELLATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Additional Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Internal Audit Note (Optional):
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Customer requested refund due to flight cancellation; processed via PayHere."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Keep Active (Back)
            </button>

            <button
              type="button"
              onClick={handleConfirmCancellation}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )}
              <span>
                Confirm Cancellation ({booking.currency} {actualRefundAmount.toLocaleString()} Refund)
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
