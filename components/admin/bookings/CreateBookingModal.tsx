'use client';

import React, { useState, useEffect } from 'react';
import { Booking, Tour } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import {
  X,
  Plus,
  Compass,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Clock,
} from 'lucide-react';
import CustomSelect, { CustomSelectOption } from '@/components/admin/CustomSelect';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (booking: Booking) => void;
}

export default function CreateBookingModal({
  isOpen,
  onClose,
  onBookingCreated,
}: CreateBookingModalProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCountry, setCustomerCountry] = useState('Sri Lanka');
  const [pickupLocation, setPickupLocation] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [travelDate, setTravelDate] = useState(tomorrowStr);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  // Financials
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('USD');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [advancePercentage, setAdvancePercentage] = useState<number>(20);
  const [advancePaidNow, setAdvancePaidNow] = useState<boolean>(true); // For testing simulation
  const [bookingStatus, setBookingStatus] = useState<'confirmed' | 'pending'>('confirmed');

  // Load tours when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchTours = async () => {
        setIsLoadingTours(true);
        try {
          const supabase = createClient();
          const { data } = await supabase
            .from('tours')
            .select('*')
            .eq('is_active', true)
            .order('title', { ascending: true });
          if (data) {
            setTours(data as Tour[]);
            if (data.length > 0 && !selectedTourId) {
              const firstTour = data[0];
              setSelectedTourId(firstTour.id);
              setTotalAmount(currency === 'USD' ? Number(firstTour.price_usd || 0) : Number(firstTour.price_lkr || 0));
            }
          }
        } catch (err) {
          console.error('Failed to load tours for booking modal:', err);
        } finally {
          setIsLoadingTours(false);
        }
      };
      fetchTours();
    }
  }, [isOpen]);

  // When tour or currency changes, update total amount
  const handleTourChange = (tourId: string) => {
    setSelectedTourId(tourId);
    const tour = tours.find((t) => t.id === tourId);
    if (tour) {
      const basePrice = currency === 'USD' ? Number(tour.price_usd || 0) : Number(tour.price_lkr || 0);
      setTotalAmount(basePrice);
    }
  };

  const handleCurrencyChange = (curr: 'USD' | 'LKR') => {
    setCurrency(curr);
    const tour = tours.find((t) => t.id === selectedTourId);
    if (tour) {
      const price = curr === 'USD' ? Number(tour.price_usd || 0) : Number(tour.price_lkr || 0);
      setTotalAmount(price);
    }
  };

  // Calculations
  const advanceAmount = Math.round((totalAmount * (advancePercentage / 100)) * 100) / 100;
  const remainingBalance = Math.round((totalAmount - advanceAmount) * 100) / 100;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Customer name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('WhatsApp phone number is required.');
      return;
    }
    if (!travelDate) {
      setErrorMsg('Travel date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const currentYear = new Date().getFullYear();
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const refNo = `TVL-${currentYear}-${randomSuffix}`;

      const newBookingRecord = {
        reference_no: refNo,
        tour_id: selectedTourId || null,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || 'guest@example.com',
        customer_phone: customerPhone.trim(),
        customer_country: customerCountry.trim() || 'Sri Lanka',
        pickup_location: pickupLocation.trim() || null,
        special_requests: specialRequests.trim() || null,
        travel_date: travelDate,
        travelers_count: (Number(adults) || 1) + (Number(children) || 0),
        adults: Number(adults) || 1,
        children: Number(children) || 0,
        selected_activities: [],
        currency,
        total_amount: Number(totalAmount),
        advance_percentage: Number(advancePercentage),
        advance_amount: advanceAmount,
        remaining_balance: remainingBalance,
        payment_status: advancePaidNow ? 'advance_paid' : 'pending',
        booking_status: bookingStatus,
        payment_method: advancePaidNow ? 'TEST_SIMULATION' : 'CASH_ON_ARRIVAL',
        balance_settled_at: null,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(newBookingRecord)
        .select('*, tours(id, title, duration_days, duration_nights, price_usd, price_lkr, cover_image)')
        .single();

      if (error) throw error;
      if (data) {
        onBookingCreated(data as Booking);
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      setErrorMsg(err.message || 'Failed to create booking. Please ensure database migration has been run.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100/70 text-[#FF6B00] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Admin / Simulator Mode</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Create Booking Record</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate or manually record a tour package reservation with automatic 20% advance & 80% balance calculation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Tour Selection & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tour Package *
              </label>
              <CustomSelect
                options={tours.map((t) => ({
                  value: t.id,
                  label: t.title,
                  badge: `${t.duration_days}D/${t.duration_nights}N`,
                  description: `$${t.price_usd} / Rs. ${t.price_lkr.toLocaleString()}`,
                  icon: <Compass className="w-3.5 h-3.5 text-[#FF6B00]" />,
                }))}
                value={selectedTourId}
                onChange={(val) => handleTourChange(val)}
                placeholder={tours.length === 0 ? "Custom Tour / Itinerary" : "Select tour package..."}
                showDescriptionInTrigger
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Currency
              </label>
              <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('LKR')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    currency === 'LKR' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  LKR (Rs.)
                </button>
              </div>
            </div>
          </div>

          {/* Traveler Details */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Traveler Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. David Miller"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  WhatsApp Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +44 7700 900077"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. david.miller@example.com"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Country of Residence
                </label>
                <input
                  type="text"
                  value={customerCountry}
                  onChange={(e) => setCustomerCountry(e.target.value)}
                  placeholder="e.g. United Kingdom"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          {/* Schedule & Headcount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Departure Date *
              </label>
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adults (Age 12+)
              </label>
              <input
                type="number"
                min="1"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Children (Age 0-11)
              </label>
              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Pickup & Requests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Address / Flight Details
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. CMB Colombo Airport or Hotel Name"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Requests / Notes
              </label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Vegetarian meals, twin beds"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Financial Breakdown Panel */}
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Financial Calculation</span>
              <span className="text-[11px] font-bold text-[#FF6B00]">20% Advance / 80% Arrival</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Total Amount ({currency})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">20% Online Advance</label>
                <div className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-sky-700">
                  {currency} {advanceAmount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">80% Balance on Arrival</label>
                <div className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-amber-700">
                  {currency} {remainingBalance.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Test Simulation Checkbox */}
            <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={advancePaidNow}
                  onChange={(e) => setAdvancePaidNow(e.target.checked)}
                  className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00] accent-[#FF6B00]"
                />
                <span>Mark 20% Advance as Paid (Simulation / Wire Received)</span>
              </label>

              <CustomSelect
                size="sm"
                containerClassName="w-auto min-w-[145px]"
                align="right"
                options={[
                  { value: 'confirmed', label: 'Confirmed', badge: 'Active', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
                  { value: 'pending', label: 'Pending', badge: 'Review', icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
                ]}
                value={bookingStatus}
                onChange={(val) => setBookingStatus(val as 'confirmed' | 'pending')}
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Create Booking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
