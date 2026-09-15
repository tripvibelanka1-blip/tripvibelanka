'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Tag,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Clock,
  Car,
  MapPin,
  Compass,
  CheckCircle2,
  Printer,
  Lock,
} from 'lucide-react';
import { Currency } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';
import { validateCouponCode, CouponValidationResult } from '@/app/admin/banners/actions';
import { submitBookingWithCurrencyLock } from '@/lib/supabase/booking-actions';
import { Booking, SiteSettings } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

const DURATION_OPTIONS = ['1-3 Days', '4-6 Days', '7 Days', '8-10 Days', '11-14 Days', '15+ Days'];

export interface BookingTourItem {
  id: string;
  title: string;
  tagline?: string | null;
  duration_days: number;
  duration_nights: number;
  price_usd: number;
  price_lkr: number;
  cover_image?: string | null;
  description?: string | null;
  category?: string | null;
  is_featured?: boolean;
}

export interface BookingVehicleItem {
  id: string;
  name: string;
  type?: string | null;
  category?: string | null;
  capacity_passengers?: number | null;
  capacity_luggage?: number | null;
  price_per_day_usd?: number | null;
  price_per_day_lkr?: number | null;
  cover_image?: string | null;
}

export interface BookingActivityItem {
  id: string;
  title: string;
  duration?: string | null;
  category?: string | null;
  location?: string | null;
  price: number;
  price_lkr?: number;
  cover_image?: string | null;
  description?: string | null;
}

function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${Math.round(amount).toLocaleString()}`;
  }
  return `Rs. ${Math.round(amount).toLocaleString()}`;
}

export default function BookingClient() {
  const searchParams = useSearchParams();
  const { currency, setCurrency, exchangeRate } = useCurrency();

  const initialPkgParam = searchParams.get('package') || undefined;
  const initialDestParam = searchParams.get('destination') || undefined;
  const initialAddonParam = searchParams.get('addon') || undefined;
  const initialCouponParam = searchParams.get('coupon') || undefined;
  const initialVehicleParam = searchParams.get('vehicle') || undefined;

  // Step state (1 to 7)
  const [step, setStep] = useState(1);

  // Form selections
  const [selectedDestination, setSelectedDestination] = useState<string>(
    initialDestParam || 'All Island Signature Circuit'
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPkgParam || '');
  const [startDate, setStartDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('7 Days');
  const [guests, setGuests] = useState<number>(2);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(initialVehicleParam || '');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(
    initialAddonParam ? [initialAddonParam] : []
  );
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [travelerError, setTravelerError] = useState<string | null>(null);

  // Database lists
  const [destinationsList, setDestinationsList] = useState<string[]>(['All Island Signature Circuit']);
  const [tourPackages, setTourPackages] = useState<BookingTourItem[]>([]);
  const [experiencesList, setExperiencesList] = useState<BookingActivityItem[]>([]);
  const [vehiclesList, setVehiclesList] = useState<BookingVehicleItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Promo code state
  const [couponInput, setCouponInput] = useState<string>(initialCouponParam || '');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission state
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Load authentic data from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingData(true);
      try {
        const supabase = createClient();

        const [destRes, tourRes, actRes, vehRes, setRes] = await Promise.allSettled([
          supabase
            .from('destinations')
            .select('name')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false }),
          supabase
            .from('tours')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false }),
          supabase
            .from('activities')
            .select('*, destination:destinations(name)')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false }),
          supabase
            .from('vehicles')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false }),
          supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .maybeSingle(),
        ]);

        if (isMounted) {
          if (destRes.status === 'fulfilled' && destRes.value.data) {
            const rawNames = destRes.value.data.map((d: any) => d.name);
            setDestinationsList(['All Island Signature Circuit', ...rawNames]);
          }

          if (tourRes.status === 'fulfilled' && tourRes.value.data) {
            const mappedTours: BookingTourItem[] = tourRes.value.data.map((t: any) => ({
              id: t.id,
              title: t.title,
              tagline: t.tagline,
              duration_days: t.duration_days || 1,
              duration_nights: t.duration_nights || 0,
              price_usd: Number(t.price_usd) || 0,
              price_lkr: Number(t.price_lkr) || Math.round((Number(t.price_usd) || 0) * (exchangeRate || 310)),
              cover_image: t.cover_image,
              description: t.description,
              category: t.category,
              is_featured: t.is_featured,
            }));
            setTourPackages(mappedTours);
          }

          if (actRes.status === 'fulfilled' && actRes.value.data) {
            const mappedActs: BookingActivityItem[] = actRes.value.data.map((a: any) => ({
              id: a.id,
              title: a.title,
              duration: a.duration,
              category: a.category,
              location: a.location || a.destination?.name,
              price: Number(a.price) || 0,
              price_lkr: Number(a.price_lkr) || Math.round((Number(a.price) || 0) * (exchangeRate || 310)),
              cover_image: a.cover_image,
              description: a.description,
            }));
            setExperiencesList(mappedActs);
          }

          if (vehRes.status === 'fulfilled' && vehRes.value.data) {
            const mappedVehs: BookingVehicleItem[] = vehRes.value.data.map((v: any) => ({
              id: v.id,
              name: v.name,
              type: v.type,
              category: v.category,
              capacity_passengers: v.passenger_capacity || v.capacity_passengers || 3,
              capacity_luggage: v.luggage_capacity || v.capacity_luggage || 2,
              price_per_day_usd: Number(v.price_per_day_usd) || 60,
              price_per_day_lkr: Number(v.price_per_day_lkr) || Math.round((Number(v.price_per_day_usd) || 60) * (exchangeRate || 310)),
              cover_image: v.cover_image,
            }));
            setVehiclesList(mappedVehs);
          }

          if (setRes.status === 'fulfilled' && setRes.value.data) {
            setSiteSettings(setRes.value.data);
          }
        }
      } catch (err) {
        console.error('Error loading booking data from Supabase:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [exchangeRate]);

  // Set default vehicle when vehicle list loads if none chosen
  useEffect(() => {
    if (!selectedVehicle && vehiclesList.length > 0) {
      setSelectedVehicle(vehiclesList[0].id);
    }
  }, [vehiclesList, selectedVehicle]);

  // Pricing Calculations
  const selectedTour = tourPackages.find((p) => p.id === selectedPackageId);
  const selectedVehObj = vehiclesList.find((v) => v.id === selectedVehicle);

  const baseRate = selectedTour
    ? currency === 'USD'
      ? selectedTour.price_usd
      : selectedTour.price_lkr
    : currency === 'USD'
    ? 250
    : 250 * (exchangeRate || 310);

  const vehicleExtra = selectedVehObj
    ? currency === 'USD'
      ? selectedVehObj.price_per_day_usd || 0
      : selectedVehObj.price_per_day_lkr || 0
    : 0;

  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const exp = experiencesList.find((e) => e.id === addonId);
    if (!exp) return acc;
    return acc + (currency === 'USD' ? exp.price : exp.price_lkr || exp.price * (exchangeRate || 310));
  }, 0);

  const subtotalBeforeDiscount = baseRate * guests + vehicleExtra + addonsTotal;

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || !appliedCoupon.isValid) return 0;
    if (typeof appliedCoupon.discountAmount === 'number') {
      return appliedCoupon.discountAmount;
    }
    if (appliedCoupon.discountType === 'percentage' && typeof appliedCoupon.discountValue === 'number') {
      return (subtotalBeforeDiscount * appliedCoupon.discountValue) / 100;
    }
    const val = appliedCoupon.discountValue || 0;
    return currency === 'USD' ? val : val * (exchangeRate || 310);
  }, [appliedCoupon, subtotalBeforeDiscount, currency, exchangeRate]);

  const finalTotal = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const advanceDeposit = Math.round(finalTotal * 0.2); // 20% Advance
  const balanceOnArrival = Math.max(0, finalTotal - advanceDeposit); // 80% Balance

  // Handle promo code apply
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const result = await validateCouponCode(
        couponInput.trim(),
        subtotalBeforeDiscount,
        currency,
        exchangeRate || 328.0
      );
      if (result.isValid) {
        setAppliedCoupon(result);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(result.error || 'Invalid or expired promotional code');
      }
    } catch {
      setCouponError('Unable to validate promo code. Please try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle step navigation & validations
  const handleNextStep = () => {
    if (step === 1) {
      if (!startDate) {
        setTravelerError('Please select an estimated travel start date.');
        return;
      }
      setTravelerError(null);
    }

    if (step === 5) {
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setTravelerError('Please provide your full name, email address, and WhatsApp phone number.');
        return;
      }
      setTravelerError(null);
    }

    setStep((prev) => Math.min(prev + 1, 7));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Toggle addon selection
  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // Handle final booking confirmation
  const handleFinalSubmit = async () => {
    setIsSubmittingBooking(true);
    setTravelerError(null);

    try {
      const selectedActivitiesInput = selectedAddons
        .map((id) => {
          const exp = experiencesList.find((e) => e.id === id);
          if (!exp) return null;
          return {
            activity_id: exp.id,
            title: exp.title,
            price_per_person_usd: exp.price,
            quantity: guests,
          };
        })
        .filter(Boolean) as any[];

      const basePriceUsdCalc = selectedTour
        ? selectedTour.price_usd * guests
        : 250 * guests;

      const result = await submitBookingWithCurrencyLock({
        tourId: selectedPackageId || null,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        pickupLocation: selectedDestination,
        specialRequests: notes.trim() || null,
        travelDate: startDate || new Date().toISOString().split('T')[0],
        adults: guests,
        selectedActivities: selectedActivitiesInput,
        basePriceUsd: basePriceUsdCalc,
        currency: currency,
        couponCode: appliedCoupon?.couponCode || null,
        discountAmount: discountAmount,
      });

      if (result.success && result.booking) {
        setCreatedBooking(result.booking);
        setBookingConfirmed(true);
        setStep(7);
      } else {
        setTravelerError(result.error || 'Failed to submit reservation. Please try again.');
      }
    } catch (err: any) {
      setTravelerError(err.message || 'An unexpected error occurred. Please contact concierge on WhatsApp.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const defaultWhatsapp = siteSettings?.whatsapp_number || '94761560046';
  const cleanWhatsapp = defaultWhatsapp.replace(/\D/g, '');
  const whatsappReservationUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hello Tripvibe Lanka! I have submitted a reservation for ${guests} guests to ${selectedDestination} (Ref: ${createdBooking?.reference_no || 'Custom Circuit'}). Please advise on final confirmation.`
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-orange-500/20 selection:text-orange-950 font-body">
      {/* Zero-jank Scroll Sentinel */}
      <div id="scroll-sentinel" className="absolute top-0 left-0 w-full h-10 pointer-events-none -z-10" />

      {/* Universal Pill Navigation */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => window.scrollTo({ top: 180, behavior: 'smooth' })}
        forceSolid
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24">
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pb-8 sm:pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-stone-200/90 text-stone-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
            <span className="font-heading tracking-wide uppercase text-[11px] text-stone-600">
              Bespoke Journey Reservation · 100% Private Chauffeured Tours
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
            Reserve Your Sri Lankan <span className="text-[#FF6B00]">Journey</span>
          </h1>

          <p className="text-stone-600 text-sm sm:text-base font-body leading-relaxed max-w-2xl mx-auto">
            Configure your private circuit, executive chauffeur vehicle, and signature activities.
            Pay only a 20% advance deposit today to lock in your travel dates.
          </p>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Multi-Step Interactive Configurator */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Progress Stepper Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/90 shadow-xs">
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:pb-0">
                {[
                  { num: 1, label: 'Dates' },
                  { num: 2, label: 'Package' },
                  { num: 3, label: 'Vehicle' },
                  { num: 4, label: 'Add-ons' },
                  { num: 5, label: 'Traveler' },
                  { num: 6, label: 'Review' },
                  { num: 7, label: 'Confirm' },
                ].map((s) => {
                  const isDone = s.num < step;
                  const isCurrent = s.num === step;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      disabled={s.num > step || bookingConfirmed}
                      onClick={() => {
                        if (s.num < step && !bookingConfirmed) setStep(s.num);
                      }}
                      className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-[#FF6B00] text-white shadow-xs'
                          : isDone
                          ? 'bg-orange-50 text-[#FF6B00] border border-orange-200/80 cursor-pointer'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {isDone ? <Check className="w-3 h-3" /> : s.num}
                      </span>
                      <span className="hidden sm:inline-block">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step Card Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
              {/* Error Notice if validation failed */}
              {travelerError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{travelerError}</span>
                </div>
              )}

              {/* STEP 1: DESTINATION & TRAVEL DATES */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                      Step 1: Destinations &amp; Travel Schedule
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Select your primary destination focus and preferred travel dates.
                    </p>
                  </div>

                  {/* Destination Dropdown */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                      Primary Destination Focus
                    </label>
                    <select
                      value={selectedDestination}
                      onChange={(e) => setSelectedDestination(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    >
                      {destinationsList.map((dest) => (
                        <option key={dest} value={dest}>
                          {dest}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Duration Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                        Estimated Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                        Estimated Trip Duration
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Guests Counter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                      Number of Guests (Adults &amp; Children)
                    </label>
                    <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-2xl border border-stone-200 w-fit">
                      <button
                        type="button"
                        onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
                        className="w-9 h-9 rounded-full bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-base font-bold font-heading text-slate-900 min-w-[3ch] text-center">
                        {guests}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuests((prev) => Math.min(20, prev + 1))}
                        className="w-9 h-9 rounded-full bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: TOUR PACKAGE */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                      Step 2: Tour Package Selection
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Choose an authentic private package or select Custom Bespoke Itinerary.
                    </p>
                  </div>

                  {isLoadingData ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
                      <p className="text-xs text-stone-500">Loading tour packages...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Option: Custom Bespoke Route */}
                      <div
                        onClick={() => setSelectedPackageId('')}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          selectedPackageId === ''
                            ? 'border-[#FF6B00] bg-orange-50/40 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 inline-block">
                            Tailor-Made
                          </span>
                          <h3 className="font-bold font-heading text-slate-900 text-sm">
                            Custom Bespoke Circuit
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Craft a 100% custom itinerary with your dedicated private chauffeur guide.
                          </p>
                        </div>
                        <div className="text-xs font-semibold text-emerald-700">
                          Flexible pricing on consultation
                        </div>
                      </div>

                      {/* Live Supabase Tour Packages */}
                      {tourPackages.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        const priceFmt = formatCurrency(
                          currency === 'USD' ? pkg.price_usd : pkg.price_lkr,
                          currency
                        );
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                              isSelected
                                ? 'border-[#FF6B00] bg-orange-50/40 shadow-xs'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {pkg.duration_days} Days / {pkg.duration_nights} Nights
                                </span>
                                {pkg.is_featured && (
                                  <span className="text-[10px] font-bold text-[#FF6B00]">Curated</span>
                                )}
                              </div>
                              <h3 className="font-bold font-heading text-slate-900 text-sm leading-snug">
                                {pkg.title}
                              </h3>
                              {pkg.description && (
                                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                  {pkg.description}
                                </p>
                              )}
                            </div>
                            <div className="text-xs font-bold text-slate-900 flex items-center justify-between pt-2 border-t border-stone-100">
                              <span>From {priceFmt} / guest</span>
                              {isSelected && <Check className="w-4 h-4 text-[#FF6B00]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: VEHICLE FLEET */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                      Step 3: Executive Vehicle Selection
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600">
                      All vehicles are private, air-conditioned, and operated by licensed tourist chauffeurs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vehiclesList.map((veh) => {
                      const isSelected = selectedVehicle === veh.id;
                      const pricePerDayFmt = formatCurrency(
                        currency === 'USD' ? (veh.price_per_day_usd || 60) : (veh.price_per_day_lkr || 18000),
                        currency
                      );
                      return (
                        <div
                          key={veh.id}
                          onClick={() => setSelectedVehicle(veh.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                            isSelected
                              ? 'border-[#FF6B00] bg-orange-50/40 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                              {veh.category || veh.type || 'Executive Sedan'}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-[#FF6B00]" />}
                          </div>

                          <div>
                            <h3 className="font-bold font-heading text-slate-900 text-sm">
                              {veh.name}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                Up to {veh.capacity_passengers || 3} Guests
                              </span>
                              <span className="flex items-center gap-1">
                                <Car className="w-3.5 h-3.5" />
                                {veh.capacity_luggage || 2} Bags
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold">
                            <span className="text-stone-600">Rate</span>
                            <span className="text-slate-900">{pricePerDayFmt} / day</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: ADD-ON EXPERIENCES */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                      Step 4: Signature Add-on Experiences
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Elevate your tour with private handcrafted excursions. Optional and customizable.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {experiencesList.map((act) => {
                      const isSelected = selectedAddons.includes(act.id);
                      const priceFmt = formatCurrency(
                        currency === 'USD' ? act.price : (act.price_lkr || act.price * (exchangeRate || 310)),
                        currency
                      );
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleToggleAddon(act.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'border-[#FF6B00] bg-orange-50/40 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {act.category && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                                  {act.category}
                                </span>
                              )}
                              {act.location && (
                                <span className="text-xs text-stone-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-orange-400" />
                                  {act.location}
                                </span>
                              )}
                              {act.duration && (
                                <span className="text-xs text-stone-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {act.duration}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold font-heading text-slate-900 text-sm">
                              {act.title}
                            </h3>
                            {act.description && (
                              <p className="text-xs text-stone-600 line-clamp-1">
                                {act.description}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-slate-900 block">{priceFmt}</span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                              isSelected ? 'bg-[#FF6B00] text-white' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {isSelected ? 'Selected' : 'Add'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: TRAVELER DETAILS */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                      Step 5: Primary Traveler &amp; Contact Details
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600">
                      We will use these details to dispatch your official reservation docket and driver contact.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Jonathan Sterling"
                        className="w-full p-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., jonathan@example.com"
                        className="w-full p-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                      WhatsApp Phone Number (with Country Code) *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., +44 7911 123456"
                      className="w-full p-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                      Special Requests, Halal Dining, or Dietary Preferences
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Halal-certified dining recommendations, child safety seat, accessibility assistance..."
                      className="w-full p-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & CURRENCY LOCK */}
              {step === 6 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                      Step 6: Review &amp; Currency Lock
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Verify your reservation details, apply any promotional vouchers, and lock in your rate.
                    </p>
                  </div>

                  {/* Promo Code Box */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                      Promotional Voucher Code
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 p-2.5 rounded-xl border border-stone-300 bg-white text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isValidatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </div>

                    {appliedCoupon && appliedCoupon.isValid && (
                      <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Code &ldquo;{appliedCoupon.couponCode}&rdquo; applied successfully!</span>
                      </div>
                    )}

                    {couponError && (
                      <p className="text-xs text-rose-600 font-medium pt-1">{couponError}</p>
                    )}
                  </div>

                  {/* Review Summary Breakdown */}
                  <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>Primary Destination</span>
                      <strong className="text-slate-900">{selectedDestination}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Travel Dates &amp; Duration</span>
                      <strong className="text-slate-900">{startDate} ({duration})</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Party Size</span>
                      <strong className="text-slate-900">{guests} Guests</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Private Tour Plan</span>
                      <strong className="text-slate-900">{selectedTour ? selectedTour.title : 'Custom Bespoke Route'}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Selected Vehicle</span>
                      <strong className="text-slate-900">{selectedVehObj?.name || 'Executive Chauffeur Vehicle'}</strong>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Activities Added</span>
                        <strong className="text-slate-900">{selectedAddons.length} Experiences</strong>
                      </div>
                    )}
                  </div>

                  {/* Currency Lock Assurance Strip */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Guaranteed Fixed Currency Rate</p>
                      <p className="text-amber-800/90 mt-0.5">
                        Your quoted total is locked in {currency}. Pay only a 20% advance deposit today. The remaining 80% balance is payable upon chauffeur arrival in Sri Lanka.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: CONFIRMATION & VOUCHER */}
              {step === 7 && (
                <div className="space-y-6 animate-in fade-in duration-300 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Reservation Docket Issued
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                      Your Journey Is Reserved!
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
                      Reference Number:{' '}
                      <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                        {createdBooking?.reference_no || 'TVL-PENDING'}
                      </span>
                    </p>
                  </div>

                  {/* Voucher Summary Card */}
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3 text-xs sm:text-sm max-w-md mx-auto">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Lead Traveler:</span>
                      <strong className="text-slate-900">{fullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Destination:</span>
                      <strong className="text-slate-900">{selectedDestination}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Start Date:</span>
                      <strong className="text-slate-900">{startDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Advance Deposit (20%):</span>
                      <strong className="text-[#FF6B00] font-bold">
                        {formatCurrency(advanceDeposit, currency)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Balance on Arrival (80%):</span>
                      <strong className="text-slate-900 font-bold">
                        {formatCurrency(balanceOnArrival, currency)}
                      </strong>
                    </div>
                  </div>

                  {/* WhatsApp Notification Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={whatsappReservationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Connect with Concierge on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full sm:w-auto px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Voucher</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step Action Buttons (Previous & Next) */}
              {step < 7 && (
                <div className="pt-6 border-t border-stone-100 flex items-center justify-between gap-4">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 6 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#FF6B00] hover:bg-[#E55F00] text-white shadow-sm shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmittingBooking}
                      onClick={handleFinalSubmit}
                      className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#FF6B00] hover:bg-[#E55F00] text-white shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingBooking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Locking Rate &amp; Generating Voucher...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm &amp; Lock Rate</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Trip Summary Docket */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
              {/* Docket Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs uppercase tracking-widest font-heading font-bold text-stone-500">
                  Trip Docket Summary
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-[#FF6B00] border border-orange-200/60">
                  Step {step} of 7
                </span>
              </div>

              {/* Trip Configuration Overview */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-500 block">Destination</span>
                    <span className="font-bold text-slate-900">{selectedDestination}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-500 block">Dates &amp; Duration</span>
                    <span className="font-bold text-slate-900">
                      {startDate ? `${startDate} · ${duration}` : `Dates Pending (${duration})`}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-500 block">Guests</span>
                    <span className="font-bold text-slate-900">{guests} Adults / Travelers</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Car className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-500 block">Vehicle Tier</span>
                    <span className="font-bold text-slate-900">
                      {selectedVehObj?.name || 'Private Chauffeur Sedan'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Calculation Docket */}
              <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Base Itinerary ({guests} guests)</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(baseRate * guests, currency)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Vehicle &amp; Chauffeur Fuel</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(vehicleExtra, currency)}
                  </span>
                </div>

                {addonsTotal > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Signature Add-on Activities</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(addonsTotal, currency)}
                    </span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Discount</span>
                    <span>-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-sm font-heading font-bold text-slate-900">Total Quoted</span>
                  <span className="text-xl font-bold font-heading text-slate-900">
                    {formatCurrency(finalTotal, currency)}
                  </span>
                </div>

                {/* Advance vs Balance Breakdown */}
                <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/70 space-y-1.5 mt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-orange-950">20% Advance to Secure Dates:</span>
                    <strong className="text-[#FF6B00] text-sm">
                      {formatCurrency(advanceDeposit, currency)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-stone-600">
                    <span>80% Balance on Chauffeur Arrival:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(balanceOnArrival, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="pt-2 space-y-2 text-[11px] text-stone-500 border-t border-stone-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free cancellation up to 14 days prior</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Licensed Tourist Chauffeur included</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Zero hidden fees or currency arbitrage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
