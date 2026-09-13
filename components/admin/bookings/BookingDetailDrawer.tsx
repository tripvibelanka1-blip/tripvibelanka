'use client';

import React, { useState } from 'react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/database';
import { PaymentStatusBadge, BookingStatusBadge } from './StatusBadges';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Printer,
  Compass,
  DollarSign,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Trash2,
  Receipt,
  UserCheck,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import {
  updateBookingStatus,
  updatePaymentStatus,
  markBalanceCollected,
  updateDispatchInfo,
  deleteBooking,
} from '@/app/admin/bookings/actions';

interface BookingDetailDrawerProps {
  booking: Booking | null;
  onClose: () => void;
  onBookingUpdated: (updated: Booking) => void;
  onBookingDeleted?: (bookingId: string) => void;
}

export default function BookingDetailDrawer({
  booking,
  onClose,
  onBookingUpdated,
  onBookingDeleted,
}: BookingDetailDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isCollectingBalance, setIsCollectingBalance] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Editable dispatch fields
  const [driverGuide, setDriverGuide] = useState(booking?.assigned_driver_guide || '');
  const [adminNotes, setAdminNotes] = useState(booking?.admin_notes || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sync state when booking changes
  React.useEffect(() => {
    if (booking) {
      setDriverGuide(booking.assigned_driver_guide || '');
      setAdminNotes(booking.admin_notes || '');
      setSaveSuccessMsg('');
    }
  }, [booking]);

  if (!booking) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(booking.reference_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct WhatsApp click link
  const cleanPhone = booking.customer_phone.replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${booking.customer_name}, Greetings from TripVibe Lanka! Regarding your booking ${booking.reference_no} for ${
      booking.tours?.title || 'your Sri Lanka tour'
    } on ${booking.travel_date}:`
  )}`;

  // Mark 80% Balance as Collected on Arrival (Calls Server Action)
  const handleMarkBalanceCollected = async () => {
    if (
      !confirm(
        `Are you sure you want to mark the 80% balance (${booking.currency} ${Number(
          booking.remaining_balance
        ).toLocaleString()}) as collected in full by the driver/guide?`
      )
    ) {
      return;
    }

    setIsCollectingBalance(true);
    try {
      const res = await markBalanceCollected(booking.id);
      if (res.error) throw new Error(res.error);
      if (res.data) {
        onBookingUpdated(res.data as Booking);
      }
    } catch (err: any) {
      console.error('Failed to record balance settlement:', err);
      alert(err.message || 'Failed to mark balance as collected. Please try again.');
    } finally {
      setIsCollectingBalance(false);
    }
  };

  // Update Booking Status (Calls Server Action)
  const handleBookingStatusChange = async (newStatus: BookingStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateBookingStatus(booking.id, newStatus);
      if (res.error) throw new Error(res.error);
      if (res.data) {
        onBookingUpdated(res.data as Booking);
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Failed to update booking status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Update Payment Status (Calls Server Action)
  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    setIsUpdatingPayment(true);
    try {
      const res = await updatePaymentStatus(booking.id, newStatus);
      if (res.error) throw new Error(res.error);
      if (res.data) {
        onBookingUpdated(res.data as Booking);
      }
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
      alert(err.message || 'Failed to update payment status.');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  // Save Driver & Notes (Calls Server Action)
  const handleSaveDispatchNotes = async () => {
    setIsSavingNotes(true);
    setSaveSuccessMsg('');
    try {
      const res = await updateDispatchInfo(booking.id, {
        driver: driverGuide,
        notes: adminNotes,
      });
      if (res.error) throw new Error(res.error);
      if (res.data) {
        onBookingUpdated(res.data as Booking);
        setSaveSuccessMsg('Dispatch details saved successfully!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      console.error('Failed to save dispatch details:', err);
      alert(err.message || 'Failed to save dispatch details.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Booking (Calls Server Action)
  const handleDeleteBooking = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteBooking(booking.id);
      if (res.error) throw new Error(res.error);
      if (onBookingDeleted) {
        onBookingDeleted(booking.id);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to delete booking:', err);
      alert(err.message || 'Failed to delete booking.');
      setIsDeleting(false);
    }
  };

  // Calculate Base Tour Price and Add-ons Subtotal
  const selectedActivities = booking.selected_activities || [];
  const addOnsTotal = selectedActivities.reduce((sum, act) => sum + Number(act.total || 0), 0);
  const baseTourTotal = Math.max(0, Number(booking.total_amount) - addOnsTotal);
  const travelersCount = booking.travelers_count || (booking.adults + booking.children) || 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-[#FF6B00] tracking-wider uppercase">
                {booking.reference_no}
              </span>
              <button
                onClick={handleCopyRef}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                title="Copy reference code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">Booking Dossier & Dispatch</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoucherModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
              title="Print Customer Voucher"
            >
              <Printer className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Voucher</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Booking"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status Badges & Quick Control */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-white border border-orange-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookingStatusBadge status={booking.booking_status} />
                <PaymentStatusBadge status={booking.payment_status} />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                METHOD: {booking.payment_method || 'SIMULATION'}
              </span>
            </div>

            {/* Two Dropdowns for Status Control */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-orange-200/60 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Booking Status:
                </label>
                <select
                  value={booking.booking_status}
                  disabled={isUpdatingStatus}
                  onChange={(e) => handleBookingStatusChange(e.target.value as BookingStatus)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl shadow-2xs focus:ring-1 focus:ring-[#FF6B00] cursor-pointer disabled:opacity-50"
                >
                  <option value="pending">Pending Confirmation</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Tour Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment Status:
                </label>
                <select
                  value={booking.payment_status}
                  disabled={isUpdatingPayment}
                  onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl shadow-2xs focus:ring-1 focus:ring-[#FF6B00] cursor-pointer disabled:opacity-50"
                >
                  <option value="pending">Pending Payment</option>
                  <option value="advance_paid">20% Advance Paid</option>
                  <option value="fully_paid">Fully Settled</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Profile Dossier */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Traveler Information
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{booking.customer_name}</div>
                  <div className="text-xs text-slate-500">{booking.customer_country || 'Sri Lanka'}</div>
                </div>

                {/* Direct WhatsApp Action */}
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                  title="Chat directly on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-800">{booking.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${booking.customer_email}`} className="text-[#FF6B00] hover:underline truncate">
                    {booking.customer_email}
                  </a>
                </div>
              </div>

              {booking.pickup_location && (
                <div className="pt-2 border-t border-slate-200/60 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B00] mt-0.5 shrink-0" />
                    <span>
                      <strong className="font-semibold text-slate-900">Pickup Location: </strong>
                      {booking.pickup_location}
                    </span>
                  </div>
                </div>
              )}

              {booking.special_requests && (
                <div className="pt-2 border-t border-slate-200/60 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                    <FileText className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="font-semibold text-amber-900">Special Requests / Dietary: </strong>
                      <p className="mt-0.5 text-slate-700">{booking.special_requests}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tour & Schedule Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Trip & Itinerary Schedule
            </h3>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div>
                <div className="text-xs font-bold text-[#FF6B00] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Reserved Tour Package</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mt-0.5">
                  {booking.tours?.title || 'Custom Tour Package'}
                </h4>
                {booking.tours && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    {booking.tours.duration_days} Days / {booking.tours.duration_nights} Nights
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Departure Date</span>
                  </div>
                  <div className="mt-1 font-bold text-slate-900">{booking.travel_date}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Travelers Headcount</span>
                  </div>
                  <div className="mt-1 font-bold text-slate-900">
                    {booking.adults || 1} Adults{booking.children ? `, ${booking.children} Kids` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Pricing Panel (Deliverable 3 Specification) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Itemized Pricing Breakdown
              </h3>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                Currency: {booking.currency}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
              {/* 1. Base Package Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between items-center text-slate-800 font-bold">
                  <span>Base Package: {booking.tours?.title || 'Tour Itinerary'}</span>
                  <span>
                    {booking.currency} {baseTourTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {travelersCount} Travelers &middot; {booking.currency} {(baseTourTotal / travelersCount).toFixed(2)} per person
                </div>
              </div>

              {/* 2. Itemized Add-ons Breakdown */}
              {selectedActivities.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 block">Experience Add-ons:</span>
                  <div className="space-y-1.5">
                    {selectedActivities.map((act, idx) => (
                      <div
                        key={act.activity_id || idx}
                        className="flex justify-between items-center p-2.5 rounded-xl bg-purple-50/60 border border-purple-100"
                      >
                        <div>
                          <div className="font-bold text-purple-900 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>{act.title}</span>
                          </div>
                          <div className="text-[10px] text-purple-700 mt-0.5">
                            {act.quantity} qty @ {booking.currency} {Number(act.price_per_person).toLocaleString()} / person
                          </div>
                        </div>
                        <span className="font-bold text-purple-900 text-xs">
                          {booking.currency} {Number(act.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Financial Summary & PayHere Advance */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-slate-700 font-semibold">
                  <span>Total Amount (Tour + Add-ons):</span>
                  <span className="font-black text-slate-900 text-sm">
                    {booking.currency} {Number(booking.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sky-700">
                  <span className="flex items-center gap-1">
                    <span>20% Online Advance:</span>
                    {booking.payhere_payment_id && (
                      <span className="text-[10px] font-mono text-slate-500">
                        (Ref: {booking.payhere_payment_id})
                      </span>
                    )}
                  </span>
                  <span className="font-bold">
                    {booking.currency} {Number(booking.advance_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold text-slate-900">
                  <span>80% Balance Due on Arrival:</span>
                  <span
                    className={`font-black text-sm ${
                      booking.payment_status === 'fully_paid'
                        ? 'text-emerald-600 line-through'
                        : 'text-amber-700'
                    }`}
                  >
                    {booking.currency} {Number(booking.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Balance Settlement Button */}
              {booking.payment_status === 'fully_paid' ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">100% Fully Settled</div>
                      {booking.balance_settled_at && (
                        <div className="text-[10px] text-emerald-700">
                          Balance collected on {new Date(booking.balance_settled_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={handleMarkBalanceCollected}
                    disabled={isCollectingBalance}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCollectingBalance ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>Mark Balance as Paid ({booking.currency} {Number(booking.remaining_balance).toLocaleString()})</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-1">
                    Click when the traveler pays the 80% balance in cash or card to the tour driver.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dispatch & Driver Logistics (Deliverable 3 Specification) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Dispatch & Driver Logistics
            </h3>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Driver / Tour Guide & Vehicle Plate:
                </label>
                <input
                  type="text"
                  value={driverGuide}
                  onChange={(e) => setDriverGuide(e.target.value)}
                  placeholder="e.g. Ruwan Silva - Toyota KDH WP-CAA-8899 (+94 77 123 4567)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Operator & Dispatch Notes:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Flight UL-504 arriving 06:30 AM; infant car seat requested..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                />
              </div>

              {saveSuccessMsg && (
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                onClick={handleSaveDispatchNotes}
                disabled={isSavingNotes}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00]" />}
                <span>Save Dispatch Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Booking Dossier</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <strong className="font-mono">{booking.reference_no}</strong> for <strong>{booking.customer_name}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBooking}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8 border border-slate-200">
            {/* Action Bar */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500">Official Travel Confirmation Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00] shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Body */}
            <div className="mt-6 space-y-6 print:m-0">
              <div className="flex justify-between items-start">
                <div>
                  <BrandLogo variant="header" />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Licensed Inbound Travel Operator &middot; Sri Lanka
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#FF6B00]">
                    REF: {booking.reference_no}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Issued: {new Date(booking.created_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                    Traveler Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {booking.customer_name}
                  </span>
                  <span className="text-slate-600 block">{booking.customer_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                    Departure Date
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {booking.travel_date}
                  </span>
                  <span className="text-slate-600 block">
                    {booking.adults || 1} Adults{booking.children ? `, ${booking.children} Kids` : ''}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Reserved Itinerary & Add-ons
                </h4>
                <div className="p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 text-sm">
                    {booking.tours?.title || 'Sri Lanka Tour Package'}
                  </div>
                  {booking.tours && (
                    <div className="text-slate-500">
                      Duration: {booking.tours.duration_days} Days / {booking.tours.duration_nights} Nights
                    </div>
                  )}
                  {selectedActivities.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700">Add-ons:</span>
                      <ul className="list-disc list-inside mt-0.5 text-slate-600">
                        {selectedActivities.map((a, i) => (
                          <li key={i}>{a.title} ({a.quantity} travelers)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {booking.pickup_location && (
                    <div className="pt-1 text-slate-700">
                      <strong>Pickup:</strong> {booking.pickup_location}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Financial Settlement Summary
                </h4>
                <div className="border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Booking Price:</span>
                    <span className="font-bold text-slate-900">
                      {booking.currency} {Number(booking.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>20% Advance Deposit:</span>
                    <span className="font-bold">
                      {booking.currency} {Number(booking.advance_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} (Paid)
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                    <span>Balance Due on Arrival:</span>
                    <span className={booking.payment_status === 'fully_paid' ? 'text-emerald-700 line-through' : 'text-amber-700'}>
                      {booking.currency} {Number(booking.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4">
                Thank you for choosing TripVibe Lanka. For 24/7 travel assistance during your holiday, contact +94 77 123 4567.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
