'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  MessageSquare,
  ArrowRight,
  User,
  Clock,
  ExternalLink,
  MessageCircle,
  Mail,
  ChevronRight,
  Compass,
  Ticket,
  Car,
  CheckCircle2,
  Inbox,
  Plus,
} from 'lucide-react';
import { Booking, Enquiry, EnquiryStatus, EnquiryType } from '@/types/database';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/admin/bookings/StatusBadges';

interface RecentActivityProps {
  recentBookings: (Booking & { tours?: { title: string } | null })[];
  recentEnquiries: Enquiry[];
}

export default function RecentActivity({
  recentBookings,
  recentEnquiries,
}: RecentActivityProps) {
  // Relative time helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Travel date formatter
  const formatTravelDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Category Icon helper
  const getTypeBadge = (type: EnquiryType) => {
    switch (type) {
      case 'Tour':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
            <Compass className="w-3 h-3 text-blue-500" />
            <span>Tour</span>
          </span>
        );
      case 'Activity':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
            <Ticket className="w-3 h-3 text-purple-500" />
            <span>Activity</span>
          </span>
        );
      case 'Vehicle':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
            <Car className="w-3 h-3 text-amber-600" />
            <span>Fleet</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
            <MessageSquare className="w-3 h-3 text-slate-500" />
            <span>General</span>
          </span>
        );
    }
  };

  // Status Pill helper for enquiries
  const getEnquiryStatusPill = (status: EnquiryStatus) => {
    switch (status) {
      case 'unread':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Unread</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>In Review</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT COLUMN: RECENT BOOKINGS (lg:col-span-7)               */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Recent Bookings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest client reservations and itinerary orders
            </p>
          </div>

          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Content */}
        {recentBookings.length === 0 ? (
          <div className="py-12 px-6 text-center text-slate-500">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <p className="font-semibold text-slate-800 text-sm">No reservations recorded yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              New website bookings and customized itineraries will appear here in real time.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Booking</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-2.5">Booking Ref & Traveler</th>
                  <th className="px-4 py-2.5">Tour Package</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((b) => {
                  const tourTitle = b.tours?.title || 'Custom Tour';
                  const currencySymbol = b.currency === 'USD' ? '$' : 'Rs. ';

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Ref & Customer */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="font-mono text-[11px] font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                          #{b.reference_no}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                          <span className="font-medium text-slate-800">{b.customer_name}</span>
                          {b.customer_country && (
                            <span className="text-[10px] text-slate-400">
                              ({b.customer_country})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Package & Date */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <div className="font-medium text-slate-900 truncate" title={tourTitle}>
                          {tourTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Depart: {formatTravelDate(b.travel_date)}</span>
                        </div>
                      </td>

                      {/* Financial Amount */}
                      <td className="px-4 py-3 text-right whitespace-nowrap font-mono">
                        <div className="font-bold text-slate-900">
                          {currencySymbol}
                          {Number(b.total_amount).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Adv: {currencySymbol}
                          {Number(b.advance_amount).toLocaleString()}
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center gap-1">
                          <BookingStatusBadge status={b.booking_status} />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/bookings?search=${b.reference_no}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg inline-flex items-center transition-colors"
                          title="View booking details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. RIGHT COLUMN: INBOUND ENQUIRIES (lg:col-span-5)            */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Customer Leads
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Incoming questions & custom quotes
            </p>
          </div>

          <Link
            href="/admin/enquiries"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
          >
            <span>Open CRM</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Content */}
        {recentEnquiries.length === 0 ? (
          <div className="py-12 px-6 text-center text-slate-500">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="font-semibold text-slate-800 text-sm">No inquiries yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Questions submitted from tour pages and contact forms will arrive directly here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentEnquiries.map((e) => {
              const isUnread = e.status === 'unread';
              const cleanPhone = e.phone ? e.phone.replace(/[^0-9]/g, '') : '';
              const whatsAppUrl = cleanPhone
                ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hi ${e.name}, thank you for contacting TripVibe Lanka regarding your travel inquiry.`
                  )}`
                : null;

              return (
                <div
                  key={e.id}
                  className={`p-4 transition-colors hover:bg-slate-50/70 ${
                    isUnread ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {e.name}
                      </span>
                      {getTypeBadge(e.enquiry_type)}
                      {getEnquiryStatusPill(e.status)}
                    </div>

                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(e.created_at)}
                    </span>
                  </div>

                  {/* Reference context if available */}
                  {e.reference_title && (
                    <div className="text-[11px] font-medium text-slate-700 mb-1 truncate">
                      <span className="text-slate-400">Target:</span> {e.reference_title}
                    </div>
                  )}

                  {/* Message preview */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
                    {e.message}
                  </p>

                  {/* Dispatch actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                      {e.email}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {whatsAppUrl && (
                        <a
                          href={whatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          title="Chat via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={`mailto:${e.email}?subject=TripVibe Lanka Enquiry Response`}
                        className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                      <Link
                        href="/admin/enquiries"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="View in CRM"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
