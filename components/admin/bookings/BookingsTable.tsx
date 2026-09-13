'use client';

import React, { useState } from 'react';
import { Booking } from '@/types/database';
import { PaymentStatusBadge, BookingStatusBadge } from './StatusBadges';
import {
  Calendar,
  Users,
  Compass,
  MessageCircle,
  ChevronRight,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { deleteBooking } from '@/app/admin/bookings/actions';

interface BookingsTableProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onDeleteBooking?: (bookingId: string) => void;
  onCreateClick: () => void;
}

export default function BookingsTable({
  bookings,
  onSelectBooking,
  onDeleteBooking,
  onCreateClick,
}: BookingsTableProps) {
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<Booking | null>(null);

  const handleCopy = (e: React.MouseEvent, ref: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 1800);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmBooking) return;
    setDeletingId(deleteConfirmBooking.id);
    try {
      const res = await deleteBooking(deleteConfirmBooking.id);
      if (res.error) {
        alert(res.error);
      } else {
        if (onDeleteBooking) {
          onDeleteBooking(deleteConfirmBooking.id);
        }
        setDeleteConfirmBooking(null);
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
      alert('An error occurred while deleting the booking.');
    } finally {
      setDeletingId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-slate-900">No Bookings Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No bookings match your selected filters. You can create a test booking or reset your filters.
        </p>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00] rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <span>+ Create Manual Booking</span>
        </button>
      </div>
    );
  }

  // Calculate relative day string
  const getRelativeDeparture = (travelDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripDate = new Date(travelDateStr);
    tripDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] border border-emerald-200/60">Today!</span>;
    }
    if (diffDays === 1) {
      return <span className="text-[#FF6B00] font-bold bg-orange-50 px-2 py-0.5 rounded-md text-[10px] border border-orange-200/60">Tomorrow</span>;
    }
    if (diffDays > 1 && diffDays <= 7) {
      return <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-md text-[10px] border border-sky-200/60">In {diffDays} days</span>;
    }
    if (diffDays > 7) {
      return <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">In {diffDays} days</span>;
    }
    return <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md text-[10px]">{Math.abs(diffDays)}d ago</span>;
  };

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Tour & Add-ons</th>
                <th className="py-3 px-4">Travel Date</th>
                <th className="py-3 px-4">Travelers</th>
                <th className="py-3 px-4">Financials (Total / Due)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Booking</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {bookings.map((booking) => {
                const cleanPhone = booking.customer_phone.replace(/[^0-9]/g, '');
                const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hello ${booking.customer_name}, regarding your TripVibe Lanka booking ${booking.reference_no}:`
                )}`;
                const addOnsCount = booking.selected_activities?.length || 0;

                return (
                  <tr
                    key={booking.id}
                    onClick={() => onSelectBooking(booking)}
                    className="hover:bg-orange-50/30 transition-colors cursor-pointer group"
                  >
                    {/* Reference with Quick Copy */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                          {booking.reference_no}
                        </span>
                        <button
                          onClick={(e) => handleCopy(e, booking.reference_no)}
                          className="p-1 rounded text-slate-300 hover:text-slate-600 transition-colors"
                          title="Copy reference"
                        >
                          {copiedRef === booking.reference_no ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(booking.created_at || '').toLocaleDateString()}
                      </div>
                    </td>

                    {/* Customer & WhatsApp Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{booking.customer_name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded text-[10px]">
                          {booking.customer_country || 'Sri Lanka'}
                        </span>
                        <span>&bull;</span>
                        <a
                          href={whatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span className="font-mono">{booking.customer_phone}</span>
                        </a>
                      </div>
                    </td>

                    {/* Tour & Add-ons Badge */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="font-semibold text-slate-800 truncate" title={booking.tours?.title || 'Tour'}>
                        {booking.tours?.title || 'Custom Itinerary'}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {booking.tours && (
                          <span className="text-[10px] text-slate-400">
                            {booking.tours.duration_days}D/{booking.tours.duration_nights}N
                          </span>
                        )}
                        {addOnsCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-md border border-purple-200/60">
                            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                            <span>+{addOnsCount} Add-ons</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Travel Date & Relative Countdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{booking.travel_date}</div>
                      <div className="mt-0.5">{getRelativeDeparture(booking.travel_date)}</div>
                    </td>

                    {/* Travelers Count */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{booking.adults || 1} Adults{booking.children > 0 ? `, ${booking.children} Kids` : ''}</span>
                      </span>
                    </td>

                    {/* Financials: Total / Advance / Balance Due */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {booking.currency} {Number(booking.total_amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </div>
                      <div className="text-[11px] mt-0.5">
                        {booking.payment_status === 'fully_paid' ? (
                          <span className="text-emerald-600 font-bold">100% Settled</span>
                        ) : (
                          <span className="text-amber-700 font-semibold">
                            Due: {booking.currency} {Number(booking.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PaymentStatusBadge status={booking.payment_status} />
                    </td>

                    {/* Booking Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <BookingStatusBadge status={booking.booking_status} />
                    </td>

                    {/* Actions: View / Manage & Delete */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectBooking(booking)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#FF6B00] bg-orange-50 hover:bg-orange-100 border border-orange-200/60 transition-all cursor-pointer"
                          title="View & manage dossier"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmBooking(booking)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmBooking && (
        <div className="fixed inset-0 z-70 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Booking Record</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete reservation <strong className="font-mono text-slate-800">{deleteConfirmBooking.reference_no}</strong> for <strong>{deleteConfirmBooking.customer_name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmBooking(null)}
                disabled={Boolean(deletingId)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {deletingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
