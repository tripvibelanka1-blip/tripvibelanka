'use client';

import React, { useState, useMemo } from 'react';
import { Booking } from '@/types/database';
import BookingsKPI from './BookingsKPI';
import BookingsFilterBar from './BookingsFilterBar';
import BookingsTable from './BookingsTable';
import BookingDetailDrawer from './BookingDetailDrawer';
import CreateBookingModal from './CreateBookingModal';
import { Plus, CalendarCheck, Sparkles } from 'lucide-react';

interface BookingsManagerProps {
  initialBookings: Booking[];
}

export default function BookingsManager({ initialBookings }: BookingsManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'today' | 'past'>('all');

  // Filtered Bookings Computation
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = b.reference_no.toLowerCase().includes(q);
        const matchesName = b.customer_name.toLowerCase().includes(q);
        const matchesPhone = b.customer_phone.toLowerCase().includes(q);
        const matchesEmail = b.customer_email.toLowerCase().includes(q);
        const matchesTour = b.tours?.title?.toLowerCase().includes(q) || false;
        if (!matchesRef && !matchesName && !matchesPhone && !matchesEmail && !matchesTour) {
          return false;
        }
      }

      // 2. Payment Filter
      if (paymentFilter !== 'all' && b.payment_status !== paymentFilter) {
        return false;
      }

      // 3. Booking Filter
      if (bookingFilter !== 'all' && b.booking_status !== bookingFilter) {
        return false;
      }

      // 4. Date Filter
      if (dateFilter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tripDate = new Date(b.travel_date);
        tripDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today' && diffDays !== 0) return false;
        if (dateFilter === 'upcoming' && (diffDays < 0 || diffDays > 7)) return false;
        if (dateFilter === 'past' && diffDays >= 0) return false;
      }

      return true;
    });
  }, [bookings, searchQuery, paymentFilter, bookingFilter, dateFilter]);

  // Handler for updates from drawer
  const handleBookingUpdated = (updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBooking(updated);
  };

  // Handler for new booking created
  const handleBookingCreated = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setSelectedBooking(newBooking);
  };

  // Handler for booking deleted
  const handleBookingDeleted = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <CalendarCheck className="w-6 h-6 text-[#FF6B00]" />
              <span>Bookings & Orders</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
              Adaptive PayHere Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer reservations, track 20% advance deposits, reconcile 80% balances on arrival, and dispatch drivers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Manual Booking</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <BookingsKPI bookings={bookings} />

      {/* Search, Date Tabs & Filters Bar */}
      <BookingsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        bookingFilter={bookingFilter}
        onBookingFilterChange={setBookingFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        filteredBookings={filteredBookings}
      />

      {/* Bookings Table */}
      <BookingsTable
        bookings={filteredBookings}
        onSelectBooking={(b) => setSelectedBooking(b)}
        onDeleteBooking={handleBookingDeleted}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Slide-over Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onBookingUpdated={handleBookingUpdated}
        onBookingDeleted={handleBookingDeleted}
      />

      {/* Manual / Test Booking Creation Modal */}
      <CreateBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  );
}
