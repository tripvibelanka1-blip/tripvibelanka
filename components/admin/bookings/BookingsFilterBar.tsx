import React from 'react';
import { Booking } from '@/types/database';
import { Search, Download, Filter, Calendar, X } from 'lucide-react';

interface BookingsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (status: string) => void;
  bookingFilter: string;
  onBookingFilterChange: (status: string) => void;
  dateFilter: 'all' | 'upcoming' | 'today' | 'past';
  onDateFilterChange: (dateFilter: 'all' | 'upcoming' | 'today' | 'past') => void;
  filteredBookings: Booking[];
}

export default function BookingsFilterBar({
  searchQuery,
  onSearchChange,
  paymentFilter,
  onPaymentFilterChange,
  bookingFilter,
  onBookingFilterChange,
  dateFilter,
  onDateFilterChange,
  filteredBookings,
}: BookingsFilterBarProps) {
  // Export CSV function for Operations Roster
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) return;

    const headers = [
      'Reference No',
      'Travel Date',
      'Customer Name',
      'Country',
      'WhatsApp Phone',
      'Email',
      'Tour Package',
      'Adults',
      'Children',
      'Currency',
      'Total Amount',
      'Advance Amount (20%)',
      'Balance Due on Arrival (80%)',
      'Payment Status',
      'Booking Status',
      'Assigned Driver/Guide',
      'Pickup Location',
      'Special Requests',
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.reference_no}"`,
      `"${b.travel_date}"`,
      `"${b.customer_name.replace(/"/g, '""')}"`,
      `"${b.customer_country || 'Sri Lanka'}"`,
      `"${b.customer_phone}"`,
      `"${b.customer_email}"`,
      `"${(b.tours?.title || 'Custom Tour').replace(/"/g, '""')}"`,
      b.adults || 1,
      b.children || 0,
      b.currency,
      b.total_amount,
      b.advance_amount,
      b.remaining_balance,
      b.payment_status,
      b.booking_status,
      `"${(b.assigned_driver_guide || 'Unassigned').replace(/"/g, '""')}"`,
      `"${(b.pickup_location || '').replace(/"/g, '""')}"`,
      `"${(b.special_requests || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tripvibe-bookings-roster-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters =
    searchQuery || paymentFilter !== 'all' || bookingFilter !== 'all' || dateFilter !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onPaymentFilterChange('all');
    onBookingFilterChange('all');
    onDateFilterChange('all');
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Ref # (e.g. TVL-), guest name, WhatsApp, email..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Export CSV */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={filteredBookings.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Download full operational roster for drivers and staff"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Export Operations Manifest ({filteredBookings.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Selects & Date Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Date Filters Tabs */}
        <div className="flex items-center p-0.5 bg-slate-100/90 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => onDateFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            All Dates
          </button>
          <button
            onClick={() => onDateFilterChange('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              dateFilter === 'upcoming'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Next 7 Days
          </button>
          <button
            onClick={() => onDateFilterChange('today')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              dateFilter === 'today'
                ? 'bg-white text-[#FF6B00] shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Today&apos;s Departures
          </button>
          <button
            onClick={() => onDateFilterChange('past')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              dateFilter === 'past'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Past Trips
          </button>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF6B00] cursor-pointer"
          >
            <option value="all">Payment: All Statuses</option>
            <option value="advance_paid">20% Advance Paid</option>
            <option value="fully_paid">Fully Settled</option>
            <option value="pending">Pending Payment</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={bookingFilter}
            onChange={(e) => onBookingFilterChange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF6B00] cursor-pointer"
          >
            <option value="all">Booking: All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending Confirmation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
}
