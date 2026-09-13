'use client';

import React, { useState, useEffect } from 'react';
import { Currency, TourPackage } from '@/types/tourism';
import { TOUR_PACKAGES, FLEET_VEHICLES, EXPERIENCES, DESTINATIONS } from '@/data/mockData';
import { useCurrency } from '@/context/CurrencyContext';
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
  Percent,
} from 'lucide-react';
import { validateCouponCode, CouponValidationResult } from '@/app/admin/banners/actions';
import { submitBookingWithCurrencyLock } from '@/lib/supabase/booking-actions';
import { Booking } from '@/types/database';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  initialPackageId?: string;
  initialDestination?: string;
  initialCouponCode?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  currency,
  initialPackageId,
  initialDestination,
  initialCouponCode,
}: BookingModalProps) {
  const { exchangeRate } = useCurrency();
  const [step, setStep] = useState(1);
  const [selectedDestination, setSelectedDestination] = useState<string>(initialDestination || 'All Island Tour');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPackageId || TOUR_PACKAGES[0].id);
  const [startDate, setStartDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('7 Days');
  const [guests, setGuests] = useState<number>(2);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('luxury-sedan');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [travelerError, setTravelerError] = useState<string | null>(null);

  // Promo Code State
  const [couponInput, setCouponInput] = useState<string>(initialCouponCode || '');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Booking Confirmation State
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    if (initialPackageId) {
      setSelectedPackageId(initialPackageId);
      setStep(2);
    }
    if (initialDestination) {
      setSelectedDestination(initialDestination);
    }
  }, [initialPackageId, initialDestination]);

  useEffect(() => {
    if (initialCouponCode) {
      setCouponInput(initialCouponCode);
      handleValidateCoupon(initialCouponCode);
    }
  }, [initialCouponCode]);

  if (!isOpen) return null;

  const currentPkg = TOUR_PACKAGES.find((p) => p.id === selectedPackageId) || TOUR_PACKAGES[0];
  const currentVehicle = FLEET_VEHICLES.find((v) => v.id === selectedVehicle) || FLEET_VEHICLES[0];

  const toggleAddon = (expId: string) => {
    if (selectedAddons.includes(expId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== expId));
    } else {
      setSelectedAddons([...selectedAddons, expId]);
    }
  };

  const stepsList = [
    'Destination',
    'Package',
    'Dates',
    'Vehicle',
    'Activities',
    'Traveler',
    'Confirmation',
  ];

  const calculateSubtotalUsd = () => {
    const base = currentPkg.priceUSD * guests;
    const addonsTotal = selectedAddons.reduce((acc, expId) => {
      const exp = EXPERIENCES.find((e) => e.id === expId);
      return acc + (exp ? exp.priceUSD * guests : 0);
    }, 0);
    return base + addonsTotal;
  };

  const handleValidateCoupon = async (codeToTest?: string) => {
    const targetCode = (codeToTest ?? couponInput).trim();
    if (!targetCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const subtotalInUsd = calculateSubtotalUsd();
      const subtotal = currency === 'USD' ? subtotalInUsd : Math.round(subtotalInUsd * exchangeRate);
      const res = await validateCouponCode(targetCode, subtotal, currency, exchangeRate);
      if (!res.isValid) {
        setCouponError(res.error || 'Invalid or expired promotional code.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(res);
        setCouponError(null);
      }
    } catch (err: any) {
      console.error('Coupon validation error:', err);
      setCouponError('Unable to validate coupon code at this time.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  // Real-time financial calculations
  const subtotalInUsd = calculateSubtotalUsd();
  const subtotalInCurrency = currency === 'USD' ? subtotalInUsd : Math.round(subtotalInUsd * exchangeRate);
  const discountAmount = appliedCoupon?.isValid ? (appliedCoupon.discountAmount || 0) : 0;
  const netTotalInCurrency = Math.max(0, subtotalInCurrency - discountAmount);
  const advanceAmountInCurrency = currency === 'USD'
    ? parseFloat((netTotalInCurrency * 0.20).toFixed(2))
    : Math.round(netTotalInCurrency * 0.20);
  const remainingBalanceInCurrency = currency === 'USD'
    ? parseFloat((netTotalInCurrency - advanceAmountInCurrency).toFixed(2))
    : netTotalInCurrency - advanceAmountInCurrency;

  const handleNext = async () => {
    if (step === 6) {
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setTravelerError('Please complete all required fields (Name, Email, Phone).');
        return;
      }
      setTravelerError(null);
      setStep(7);
      return;
    }

    if (step < 7) {
      setStep(step + 1);
    } else {
      // Step 7: Final Booking Submission (Currency Locked in Supabase)
      setIsSubmittingBooking(true);
      try {
        const res = await submitBookingWithCurrencyLock({
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          pickupLocation: selectedDestination,
          specialRequests: notes,
          travelDate: startDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          adults: guests,
          children: 0,
          basePriceUsd: currentPkg.priceUSD,
          currency: currency,
          couponCode: appliedCoupon?.isValid ? appliedCoupon.couponCode : null,
          discountAmount: discountAmount,
          selectedActivities: selectedAddons.map((id) => {
            const exp = EXPERIENCES.find((e) => e.id === id);
            return {
              activity_id: id,
              title: exp?.title || id,
              price_per_person_usd: exp?.priceUSD || 0,
              quantity: guests,
            };
          }),
        });

        if (res.success && res.booking) {
          setCreatedBooking(res.booking);
        }
      } catch (err) {
        console.error('Failed to submit booking row:', err);
      } finally {
        setIsSubmittingBooking(false);
        setBookingConfirmed(true);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const formatPrice = (usd: number) => {
    if (currency === 'USD') return `$${usd.toLocaleString()}`;
    return `Rs. ${Math.round(usd * exchangeRate).toLocaleString()}`;
  };

  const constructWhatsAppMessage = () => {
    let text = `Hello Tripvibe Lanka! I want to confirm my bespoke tour booking:%0A` +
      `*Package:* ${currentPkg.title}%0A` +
      `*Destination Focus:* ${selectedDestination}%0A` +
      `*Date:* ${startDate || 'Flexible'} (${duration})%0A` +
      `*Guests:* ${guests} Travelers%0A` +
      `*Vehicle:* ${currentVehicle.name}%0A` +
      `*Lead Traveler:* ${fullName} (${email}, ${phone})%0A`;

    if (appliedCoupon?.isValid) {
      text += `*Coupon Code Applied:* ${appliedCoupon.couponCode} (-${currency} ${discountAmount.toLocaleString()})%0A`;
    }

    text += `*Net Total:* ${currency} ${netTotalInCurrency.toLocaleString()}%0A` +
      `*20% Online Advance:* ${currency} ${advanceAmountInCurrency.toLocaleString()}%0A` +
      `*80% Balance on Arrival:* ${currency} ${remainingBalanceInCurrency.toLocaleString()}%0A`;

    if (createdBooking?.reference_no) {
      text += `*Booking Reference:* ${createdBooking.reference_no}%0A`;
    }

    text += `*Special Requests:* ${notes || 'None'}`;
    return `https://wa.me/94770000000?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-[#FF6B00]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Tailor Your Sri Lanka Tour
              </h3>
              <p className="text-xs text-slate-500">
                Step {step} of 7: <strong className="text-slate-700">{stepsList[step - 1]}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-[#FF6B00] h-1.5 transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between">
          {!bookingConfirmed ? (
            <>
              {/* Step 1: Destination */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900">
                    Which regions of Sri Lanka do you wish to explore?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['All Island Signature Circuit', ...DESTINATIONS.map((d) => d.name)].map((dest) => (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => setSelectedDestination(dest)}
                        className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                          selectedDestination === dest
                            ? 'border-[#FF6B00] bg-orange-50/50 text-[#FF6B00] shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span>{dest}</span>
                        {selectedDestination === dest && <Check className="w-4 h-4 text-[#FF6B00]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Package */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900">
                    Select your preferred private tour package
                  </h4>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {TOUR_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedPackageId === pkg.id
                            ? 'border-[#FF6B00] bg-orange-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1 pr-3">
                          <span className="text-xs font-bold text-[#007AFF] uppercase">{pkg.duration}</span>
                          <h5 className="text-sm font-bold text-slate-900">{pkg.title}</h5>
                          <p className="text-xs text-slate-500 line-clamp-1">{pkg.tagline}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-slate-900 block font-heading">
                            {formatPrice(pkg.priceUSD)}
                          </span>
                          <span className="text-[10px] text-slate-400">/ person</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Dates & Duration */}
              {step === 3 && (
                <div className="space-y-5">
                  <h4 className="text-lg font-bold text-slate-900">
                    When are you planning to visit?
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Preferred Arrival Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Tour Duration
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:outline-none"
                      >
                        <option value="5 Days">5 Days / 4 Nights</option>
                        <option value="7 Days">7 Days / 6 Nights (Recommended)</option>
                        <option value="10 Days">10 Days / 9 Nights</option>
                        <option value="14 Days">14 Days / 13 Nights (Comprehensive)</option>
                        <option value="Custom">Custom Pace / Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Number of Travelers
                      </label>
                      <div className="flex items-center gap-3">
                        {[1, 2, 3, 4, 5, '6+'].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setGuests(typeof num === 'number' ? num : 6)}
                            className={`w-11 h-11 rounded-xl font-bold text-sm border transition-all ${
                              guests === (typeof num === 'number' ? num : 6)
                                ? 'border-[#FF6B00] bg-[#FF6B00] text-white shadow-sm'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Vehicle */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900">
                    Choose your chauffeur vehicle category
                  </h4>
                  <div className="space-y-3">
                    {FLEET_VEHICLES.map((veh) => (
                      <div
                        key={veh.id}
                        onClick={() => setSelectedVehicle(veh.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedVehicle === veh.id
                            ? 'border-[#FF6B00] bg-orange-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-orange-600 uppercase">{veh.category}</span>
                          <h5 className="text-sm font-bold text-slate-900">{veh.name}</h5>
                          <p className="text-xs text-slate-500">{veh.passengers} • {veh.luggage}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">
                            {formatPrice(veh.pricePerDayUSD)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/ day</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Activities */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900">
                      Add VIP Private Experiences
                    </h4>
                    <span className="text-xs text-slate-500">Optional</span>
                  </div>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {EXPERIENCES.map((exp) => (
                      <div
                        key={exp.id}
                        onClick={() => toggleAddon(exp.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedAddons.includes(exp.id)
                            ? 'border-[#007AFF] bg-sky-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <h5 className="text-sm font-bold text-slate-900">{exp.title}</h5>
                          <p className="text-xs text-slate-500">{exp.location} • {exp.duration}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-800 font-heading">
                            +{formatPrice(exp.priceUSD)}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                              selectedAddons.includes(exp.id)
                                ? 'bg-[#007AFF] border-[#007AFF] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {selectedAddons.includes(exp.id) && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Traveler Details */}
              {step === 6 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900">
                    Lead Traveler Information
                  </h4>

                  {travelerError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{travelerError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (travelerError) setTravelerError(null);
                        }}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (travelerError) setTravelerError(null);
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                          WhatsApp / Mobile <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 555 019 283"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (travelerError) setTravelerError(null);
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Special Wishes or Hotel Preferences
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Dietary requirements, honeymoon setup, child seats, etc."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Confirmation & Summary */}
              {step === 7 && (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                      Trip Summary & Details
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Selected Tour:</span>
                        <strong className="text-slate-900">{currentPkg.title}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Destination Focus:</span>
                        <span className="font-semibold text-slate-800">{selectedDestination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dates & Duration:</span>
                        <span className="font-semibold text-slate-800">{startDate || 'Flexible Dates'} ({duration})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Group Size:</span>
                        <span className="font-semibold text-slate-800">{guests} Adults</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle:</span>
                        <span className="font-semibold text-slate-800">{currentVehicle.name}</span>
                      </div>
                      {selectedAddons.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Add-on Experiences:</span>
                          <span className="font-semibold text-slate-800">{selectedAddons.length} Selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Promo Code Input Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Promotional Coupon Code</span>
                      </label>
                      {appliedCoupon?.isValid && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>
                            {appliedCoupon.discountType === 'percentage'
                              ? `${appliedCoupon.discountValue}% OFF`
                              : `$${appliedCoupon.discountValue} OFF`}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="e.g. VIBELANKA15"
                          value={couponInput}
                          disabled={appliedCoupon?.isValid}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          className="w-full px-3.5 py-2 text-xs font-mono font-bold tracking-wider uppercase bg-white border border-slate-200 rounded-xl focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none disabled:bg-slate-100 disabled:text-slate-600"
                        />
                      </div>

                      {appliedCoupon?.isValid ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isValidatingCoupon || !couponInput.trim()}
                          onClick={() => handleValidateCoupon()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isValidatingCoupon ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Checking...</span>
                            </>
                          ) : (
                            <span>Apply</span>
                          )}
                        </button>
                      )}
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{couponError}</span>
                      </p>
                    )}

                    {appliedCoupon?.isValid && appliedCoupon.bannerTitle && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Offer applied: &quot;{appliedCoupon.bannerTitle}&quot;</span>
                      </p>
                    )}
                  </div>

                  {/* Financial Breakdown & Totals */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Financial Calculation & Breakdown
                    </span>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Base Tour Subtotal:</span>
                        <span className="font-semibold text-slate-900">
                          {currency} {subtotalInCurrency.toLocaleString()}
                        </span>
                      </div>

                      {appliedCoupon?.isValid && (
                        <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-emerald-600" />
                            <span>Promotion Discount ({appliedCoupon.couponCode}):</span>
                          </span>
                          <span>
                            -{currency} {discountAmount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between pt-1.5 border-t border-slate-100 font-bold text-slate-800">
                        <span>Estimated Net Total:</span>
                        <span className="text-sm font-black text-slate-900 font-heading">
                          {currency} {netTotalInCurrency.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-sky-700 text-[11px] font-semibold">
                        <span>20% Online Advance Deposit (Payable Now):</span>
                        <span>
                          {currency} {advanceAmountInCurrency.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-amber-800 text-[11px] font-semibold">
                        <span>80% Balance (Payable Upon Arrival):</span>
                        <span>
                          {currency} {remainingBalanceInCurrency.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Locked currency guarantee. Anti-arbitrage rate snapshot applied.</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="py-8 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 font-heading">
                Booking Inquiry Received!
              </h4>

              {createdBooking?.reference_no && (
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                  Booking Ref: {createdBooking.reference_no}
                </div>
              )}

              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you <strong>{fullName || 'Traveler'}</strong>. Your bespoke tour reservation has been received and locked in our database with your selected payment preferences.
              </p>

              {appliedCoupon?.isValid && (
                <div className="max-w-xs mx-auto p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  🎉 Promo discount of <strong>{currency} {discountAmount.toLocaleString()}</strong> applied with code <strong>{appliedCoupon.couponCode}</strong>.
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={constructWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Open WhatsApp Directly</span>
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          {!bookingConfirmed && (
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  disabled={isSubmittingBooking}
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                disabled={isSubmittingBooking}
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#FF6B00] hover:bg-[#E55F00] active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <span>{step === 7 ? 'Confirm & Send Inquiry' : 'Continue'}</span>
                    {step === 7 ? <Send className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
