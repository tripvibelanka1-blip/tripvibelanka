'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Eye,
  ArrowUpRight,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Heart,
} from 'lucide-react';
import { Currency } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';
import { validateCouponCode, CouponValidationResult } from '@/app/admin/banners/actions';
import { submitBookingWithCurrencyLock } from '@/lib/supabase/booking-actions';
import { Booking, SiteSettings } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import TourDetailDrawer, { TourDetailItem } from '@/components/tours/TourDetailDrawer';
import VehicleDetailDrawer, { FleetVehicleDetail } from '@/components/fleet/VehicleDetailDrawer';
import ExperienceDetailDrawer, { ExperienceItem, LinkedTourMini } from '@/components/experiences/ExperienceDetailDrawer';
import DestinationDetailDrawer, { DestinationItem, LinkedTourSummary, LinkedActivitySummary } from '@/components/destinations/DestinationDetailDrawer';

const DURATION_OPTIONS = ['1-3 Days', '4-6 Days', '7 Days', '8-10 Days', '11-14 Days', '15+ Days'];

const DURATION_METADATA: Record<string, { label: string; tag: string; badge?: string; desc: string }> = {
  '1-3 Days': {
    label: '1–3 Days',
    tag: 'Short Break',
    badge: 'Express',
    desc: 'Airport transit, Colombo city & quick coastal getaway',
  },
  '4-6 Days': {
    label: '4–6 Days',
    tag: 'Highlights',
    badge: 'Popular',
    desc: 'Cultural Triangle (Sigiriya/Kandy) & Tea Country',
  },
  '7 Days': {
    label: '7 Days',
    tag: 'Signature Circuit',
    badge: 'Most Popular',
    desc: 'The complete 1-week classic Ceylon adventure',
  },
  '8-10 Days': {
    label: '8–10 Days',
    tag: 'Grand Tour',
    badge: 'Recommended',
    desc: 'Heritage, Highlands, Yala wildlife & South Riviera',
  },
  '11-14 Days': {
    label: '11–14 Days',
    tag: 'In-Depth Odyssey',
    badge: 'Comprehensive',
    desc: 'Coast-to-coast circuit with northern & southern shores',
  },
  '15+ Days': {
    label: '15+ Days',
    tag: 'Complete Ceylon',
    badge: 'Ultimate',
    desc: 'Total immersion, unhurried pacing & offbeat sanctuaries',
  },
};

const STEP_CONFIG = [
  { num: 1, label: 'Dates', title: 'Dates & Destination' },
  { num: 2, label: 'Package', title: 'Tour Package Selection' },
  { num: 3, label: 'Vehicle', title: 'Executive Fleet Vehicle' },
  { num: 4, label: 'Add-ons', title: 'Signature Experiences' },
  { num: 5, label: 'Traveler', title: 'Traveler Contact Details' },
  { num: 6, label: 'Review', title: 'Review & Rate Lock' },
  { num: 7, label: 'Confirm', title: 'Reservation Confirmed' },
];

interface CustomDestinationSelectProps {
  value: string;
  onChange: (dest: string) => void;
  destinationsList: string[];
  destinationsData: DestinationItem[];
}

function CustomDestinationSelect({
  value,
  onChange,
  destinationsList,
  destinationsData,
}: CustomDestinationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return destinationsList;
    const q = searchQuery.toLowerCase().trim();
    return destinationsList.filter((dest) => {
      if (dest.toLowerCase().includes(q)) return true;
      const data = destinationsData.find((d) => d.name.toLowerCase() === dest.toLowerCase());
      if (data?.district && data.district.toLowerCase().includes(q)) return true;
      if (data?.popular_attractions?.some((a) => a.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [destinationsList, destinationsData, searchQuery]);

  const selectedObj = destinationsData.find(
    (d) => d.name.toLowerCase() === value.toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-h-[56px] p-3 sm:p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-[#FF6B00] bg-white ring-2 ring-orange-500/20'
            : 'border-stone-300 bg-stone-50/70 hover:bg-stone-100/80 hover:border-stone-400'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {value === 'All Island Signature Circuit' ? (
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-200">
              <Compass className="w-5 h-5" />
            </div>
          ) : selectedObj?.cover_image ? (
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-stone-200">
              <Image
                src={selectedObj.cover_image}
                alt={selectedObj.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm sm:text-base font-heading truncate">
                {value}
              </span>
              {value === 'All Island Signature Circuit' ? (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/80">
                  Full Island
                </span>
              ) : selectedObj?.district ? (
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {selectedObj.district}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5">
              {value === 'All Island Signature Circuit'
                ? 'Comprehensive route visiting multiple Sri Lankan provinces'
                : selectedObj?.best_time_to_visit
                ? `Best time to visit: ${selectedObj.best_time_to_visit}`
                : 'Curated regional luxury sanctuary'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-stone-400 hidden sm:inline-block">
            {isOpen ? 'Close' : 'Change'}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-stone-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#FF6B00]' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-80 sm:max-h-96 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-3 bg-stone-50 border-b border-stone-200/80 flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 20+ destinations (e.g. Sigiriya, Ella, Galle)..."
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-stone-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 divide-y divide-stone-100 overscroll-contain">
            {filteredDestinations.length === 0 ? (
              <div className="p-6 text-center space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  No destinations found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-[11px] text-stone-400">
                  Try searching for a city, district, or attraction name
                </p>
              </div>
            ) : (
              filteredDestinations.map((dest) => {
                const isSelected = dest.toLowerCase() === value.toLowerCase();
                const dObj = destinationsData.find((d) => d.name.toLowerCase() === dest.toLowerCase());
                const isSignature = dest === 'All Island Signature Circuit';

                return (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => {
                      onChange(dest);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full p-3 sm:p-3.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/80 text-slate-900'
                        : 'hover:bg-stone-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isSignature ? (
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-200">
                          <Compass className="w-4 h-4" />
                        </div>
                      ) : dObj?.cover_image ? (
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                          <Image
                            src={dObj.cover_image}
                            alt={dObj.name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 font-heading truncate">
                            {dest}
                          </span>
                          {isSignature ? (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-100 px-1.5 py-0.5 rounded">
                              Island-Wide
                            </span>
                          ) : dObj?.district ? (
                            <span className="text-[9px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                              {dObj.district}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {isSignature
                            ? 'Custom flexible itinerary covering all major regions'
                            : dObj?.popular_attractions && dObj.popular_attractions.length > 0
                            ? `Highlights: ${dObj.popular_attractions.slice(0, 2).join(', ')}`
                            : dObj?.description || 'Private chauffeured journey'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CustomDurationSelectProps {
  value: string;
  onChange: (duration: string) => void;
}

function CustomDurationSelect({ value, onChange }: CustomDurationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentMeta = DURATION_METADATA[value] || {
    label: value,
    tag: 'Custom',
    desc: 'Bespoke journey length',
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-h-[56px] p-3 sm:p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-[#FF6B00] bg-white ring-2 ring-orange-500/20'
            : 'border-stone-300 bg-stone-50/70 hover:bg-stone-100/80 hover:border-stone-400'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-200">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base font-heading">
                {currentMeta.label}
              </span>
              {currentMeta.badge && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/80">
                  {currentMeta.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5">
              {currentMeta.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-stone-400 hidden sm:inline-block">
            {isOpen ? 'Close' : 'Change'}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-stone-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#FF6B00]' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-1.5 space-y-1 max-h-80 sm:max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = opt === value;
            const meta = DURATION_METADATA[opt] || { label: opt, tag: 'Custom', desc: '' };

            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full p-3 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-orange-50/90 text-slate-900'
                    : 'hover:bg-stone-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#FF6B00] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 font-heading">
                        {meta.label}
                      </span>
                      {meta.badge && (
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            meta.badge === 'Most Popular'
                              ? 'bg-orange-100 text-[#FF6B00]'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {meta.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      {meta.desc}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface BookingTourItem {
  id: string;
  title: string;
  tagline?: string | null;
  duration_days: number;
  duration_nights: number;
  price_usd: number;
  price_lkr: number;
  cover_image?: string | null;
  gallery_images?: string[];
  description?: string | null;
  category?: string | null;
  is_featured?: boolean;
  locations?: string[];
  highlights?: string[];
  included?: string[];
  excluded?: string[];
  itinerary?: { day: number; title: string; details: string }[];
  min_guests?: number;
  max_guests?: number | null;
  guest_policy?: string | null;
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
  gallery_images?: string[];
  features?: string[];
  description?: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  license_plate?: string | null;
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
  gallery_images?: string[];
  description?: string | null;
  destination_id?: string | null;
  destination?: {
    id?: string;
    name: string;
    district?: string | null;
  } | null;
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

  // Mobile drawer summary toggle
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

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
  const [destinationsData, setDestinationsData] = useState<DestinationItem[]>([]);
  const [tourPackages, setTourPackages] = useState<BookingTourItem[]>([]);
  const [experiencesList, setExperiencesList] = useState<BookingActivityItem[]>([]);
  const [vehiclesList, setVehiclesList] = useState<BookingVehicleItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Drawer Dossier States for in-depth clarity
  const [drawerTour, setDrawerTour] = useState<TourDetailItem | null>(null);
  const [drawerVehicle, setDrawerVehicle] = useState<FleetVehicleDetail | null>(null);
  const [drawerExperience, setDrawerExperience] = useState<ExperienceItem | null>(null);
  const [drawerDestination, setDrawerDestination] = useState<DestinationItem | null>(null);

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
            .select('*')
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
            .select('*, destination:destinations(name, district)')
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
            const rawData: DestinationItem[] = destRes.value.data.map((d: any) => ({
              id: d.id,
              name: d.name,
              district: d.district,
              tag: d.tag,
              best_time_to_visit: d.best_time_to_visit,
              description: d.description,
              cover_image: d.cover_image,
              gallery_images: Array.isArray(d.gallery_images) ? d.gallery_images : [],
              popular_attractions: Array.isArray(d.popular_attractions) ? d.popular_attractions : [],
              display_order: d.display_order,
            }));
            setDestinationsData(rawData);
            const rawNames = rawData.map((d) => d.name);
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
              gallery_images: Array.isArray(t.gallery_images) ? t.gallery_images : [],
              description: t.description,
              category: t.category,
              is_featured: t.is_featured,
              locations: Array.isArray(t.locations) ? t.locations : [],
              highlights: Array.isArray(t.highlights) ? t.highlights : [],
              included: Array.isArray(t.included) ? t.included : [],
              excluded: Array.isArray(t.excluded) ? t.excluded : [],
              itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
              min_guests: t.min_guests ?? 1,
              max_guests: t.max_guests ?? null,
              guest_policy: t.guest_policy || null,
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
              gallery_images: Array.isArray(a.gallery_images) ? a.gallery_images : [],
              description: a.description,
              destination_id: a.destination_id,
              destination: a.destination,
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
              gallery_images: Array.isArray(v.gallery_images) ? v.gallery_images : [],
              features: Array.isArray(v.features) ? v.features : [],
              description: v.description,
              transmission: v.transmission,
              fuel_type: v.fuel_type,
              license_plate: v.license_plate,
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

  // Set vehicle from URL param or default to first when list loads
  useEffect(() => {
    if (vehiclesList.length > 0) {
      if (initialVehicleParam) {
        const found = vehiclesList.find(
          (v) =>
            v.id === initialVehicleParam ||
            v.name.toLowerCase() === initialVehicleParam.toLowerCase() ||
            v.name.toLowerCase().includes(initialVehicleParam.toLowerCase())
        );
        if (found) {
          setSelectedVehicle(found.id);
          return;
        }
      }
      if (!selectedVehicle) {
        setSelectedVehicle(vehiclesList[0].id);
      }
    }
  }, [vehiclesList, initialVehicleParam, selectedVehicle]);

  // Sync package param if changed in URL
  useEffect(() => {
    if (initialPkgParam && tourPackages.length > 0) {
      const found = tourPackages.find(
        (p) =>
          p.id === initialPkgParam ||
          p.title.toLowerCase() === initialPkgParam.toLowerCase() ||
          p.title.toLowerCase().includes(initialPkgParam.toLowerCase())
      );
      if (found) {
        setSelectedPackageId(found.id);
      } else {
        setSelectedPackageId(initialPkgParam);
      }
    } else if (initialPkgParam) {
      setSelectedPackageId(initialPkgParam);
    }
  }, [initialPkgParam, tourPackages]);

  // Sync destination param from URL
  useEffect(() => {
    if (initialDestParam && destinationsList.length > 1) {
      const found = destinationsList.find(
        (d) =>
          d.toLowerCase() === initialDestParam.toLowerCase() ||
          d.toLowerCase().includes(initialDestParam.toLowerCase()) ||
          initialDestParam.toLowerCase().includes(d.toLowerCase())
      );
      if (found) {
        setSelectedDestination(found);
      }
    }
  }, [initialDestParam, destinationsList]);

  // Pricing Calculations
  const selectedTour = tourPackages.find(
    (p) =>
      p.id === selectedPackageId ||
      (initialPkgParam && (p.id === initialPkgParam || p.title.toLowerCase() === initialPkgParam.toLowerCase()))
  );
  const selectedVehObj = vehiclesList.find(
    (v) =>
      v.id === selectedVehicle ||
      (initialVehicleParam && (v.id === initialVehicleParam || v.name.toLowerCase() === initialVehicleParam.toLowerCase()))
  );

  // Sync addon param from URL
  useEffect(() => {
    if (initialAddonParam) {
      setSelectedAddons((prev) => (prev.includes(initialAddonParam) ? prev : [...prev, initialAddonParam]));
    }
  }, [initialAddonParam]);

  // If addon is selected and has a location, sync destination if not custom set
  useEffect(() => {
    if (initialAddonParam && experiencesList.length > 0 && (!initialDestParam || initialDestParam === 'All Island Signature Circuit')) {
      const exp = experiencesList.find((e) => e.id === initialAddonParam);
      if (exp?.location) {
        setSelectedDestination((prev) => (prev === 'All Island Signature Circuit' ? exp.location! : prev));
      }
    }
  }, [initialAddonParam, experiencesList, initialDestParam]);

  // Automatically sync duration when a specific tour package is selected
  useEffect(() => {
    if (selectedTour) {
      if (selectedPackageId !== selectedTour.id) {
        setSelectedPackageId(selectedTour.id);
      }
      const days = selectedTour.duration_days;
      if (days) {
        if (days <= 3) setDuration('1-3 Days');
        else if (days <= 6) setDuration('4-6 Days');
        else if (days === 7) setDuration('7 Days');
        else if (days <= 10) setDuration('8-10 Days');
        else if (days <= 14) setDuration('11-14 Days');
        else setDuration('15+ Days');
      }

      // Guest Count Synchronization based on selected package policy
      const minG = selectedTour.min_guests || 1;
      const maxG = selectedTour.max_guests ?? null;
      if (selectedTour.guest_policy === 'solo' || (minG === 1 && maxG === 1)) {
        setGuests(1);
      } else if (selectedTour.guest_policy === 'couple' || (minG === 2 && maxG === 2)) {
        setGuests(2);
      } else {
        setGuests((prev) => {
          if (prev < minG) return minG;
          if (maxG && prev > maxG) return maxG;
          return prev;
        });
      }
    }
  }, [selectedTour, selectedPackageId]);

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

  // Find active destination record from database
  const selectedDestObj = destinationsData.find(
    (d) => d.name.toLowerCase() === selectedDestination.toLowerCase()
  );

  // Conversion helpers for drawers
  const convertToTourDetail = (t: BookingTourItem): TourDetailItem => ({
    id: t.id,
    title: t.title,
    category: t.category || 'Cultural',
    tagline: t.tagline || '',
    duration: `${t.duration_days} Days / ${t.duration_nights} Nights`,
    duration_days: t.duration_days,
    duration_nights: t.duration_nights,
    image: t.cover_image || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&q=80&w=1200',
    gallery_images: t.gallery_images && t.gallery_images.length > 0 ? t.gallery_images : [t.cover_image || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&q=80&w=1200'],
    locations: t.locations || [],
    highlights: t.highlights && t.highlights.length > 0 ? t.highlights : [
      'Scenic private chauffeured transfer',
      'Curated heritage & cultural monuments',
      'Authentic local cuisine & dining stops',
      'Flexible pacing tailored to your preferences'
    ],
    included: t.included && t.included.length > 0 ? t.included : [
      'Air-conditioned private executive vehicle',
      'Licensed English-speaking tourist chauffeur guide',
      'All expressway tolls, parking fees, and chauffeur fuel',
      'Complimentary chilled mineral water & 4G onboard Wi-Fi'
    ],
    excluded: t.excluded && t.excluded.length > 0 ? t.excluded : [
      'International flights',
      'Personal travel insurance',
      'Monument entry fees (unless explicitly specified)'
    ],
    itinerary: t.itinerary && t.itinerary.length > 0 ? t.itinerary : [
      { day: 1, title: 'Arrival & Welcome Circuit', details: `Warm welcome by chauffeur at Colombo International Airport (CMB) or pickup in ${selectedDestination}. Scenic transfer and private orientation tour.` },
      { day: 2, title: 'Private Exploration & Highlights', details: 'Full day chauffeured excursion visiting cultural landmarks, panoramic viewpoints, and boutique lunch stops.' },
      { day: 3, title: 'Scenic Countryside & Leisure', details: 'Leisurely morning followed by scenic drive, tea garden walk or lagoon cruise tailored to your itinerary.' },
    ],
    priceUSD: t.price_usd,
    priceLKR: t.price_lkr,
    featured: t.is_featured,
    min_guests: t.min_guests,
    max_guests: t.max_guests,
    guest_policy: t.guest_policy,
  });

  const convertToVehicleDetail = (v: BookingVehicleItem): FleetVehicleDetail => ({
    id: v.id,
    name: v.name,
    category: v.category || v.type || 'Executive Sedan',
    passenger_capacity: v.capacity_passengers || 3,
    luggage_capacity: v.capacity_luggage || 2,
    passengers_text: `Up to ${v.capacity_passengers || 3} Passengers`,
    luggage_text: `${v.capacity_luggage || 2} Large Suitcases`,
    transmission: v.transmission || 'Automatic',
    fuel_type: v.fuel_type || 'Diesel',
    features: v.features && v.features.length > 0 ? v.features : [
      'Dual Zone Automatic Climate Control',
      'Onboard High-Speed 4G Wi-Fi',
      'USB Multi-Device Charging',
      'Ergonomic Reclining Leather Seats',
      'Licensed English-Speaking Chauffeur Guide'
    ],
    description: v.description || 'Premium private air-conditioned vehicle meticulously maintained with dedicated English-speaking tourist chauffeur guide.',
    cover_image: v.cover_image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200',
    gallery_images: v.gallery_images && v.gallery_images.length > 0 ? v.gallery_images : [],
    price_per_day_usd: v.price_per_day_usd || 60,
    price_per_day_lkr: v.price_per_day_lkr || 18000,
    license_plate: v.license_plate || undefined,
  });

  const convertToExperienceDetail = (a: BookingActivityItem): ExperienceItem => ({
    id: a.id,
    title: a.title,
    destination_id: a.destination_id,
    location: a.location,
    duration: a.duration || '2-3 Hours',
    category: a.category || 'Exclusive Island Experience',
    price: a.price,
    price_lkr: a.price_lkr,
    description: a.description || 'Handcrafted authentic Sri Lankan private excursion with licensed guides and bespoke logistics.',
    cover_image: a.cover_image || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&q=80&w=1200',
    gallery_images: a.gallery_images && a.gallery_images.length > 0 ? a.gallery_images : [],
    is_active: true,
    destination: a.destination ? { id: a.destination.id || '', name: a.destination.name, district: a.destination.district } : null,
  });

  const getLinkedToursForDestination = (dest: DestinationItem): LinkedTourSummary[] => {
    if (!dest) return [];
    const destNameLower = dest.name.toLowerCase();
    return tourPackages
      .filter((t) => {
        if (t.locations && Array.isArray(t.locations)) {
          return t.locations.some((l) => l.toLowerCase().includes(destNameLower) || destNameLower.includes(l.toLowerCase()));
        }
        return false;
      })
      .map((t) => ({
        id: t.id,
        title: t.title,
        duration_days: t.duration_days,
        duration_nights: t.duration_nights,
        price_usd: t.price_usd,
        price_lkr: t.price_lkr,
        cover_image: t.cover_image,
        category: t.category,
      }));
  };

  const getLinkedActivitiesForDestination = (dest: DestinationItem): LinkedActivitySummary[] => {
    if (!dest) return [];
    const destNameLower = dest.name.toLowerCase();
    return experiencesList
      .filter((a) => {
        const loc = (a.location || a.destination?.name || '').toLowerCase();
        return loc.includes(destNameLower) || destNameLower.includes(loc);
      })
      .map((a) => ({
        id: a.id,
        title: a.title,
        location: a.location,
        duration: a.duration,
        price: a.price,
        price_lkr: a.price_lkr,
      }));
  };

  const getLinkedToursForExperience = (exp: ExperienceItem): LinkedTourMini[] => {
    if (!exp) return [];
    const locLower = (exp.location || exp.destination?.name || '').toLowerCase();
    if (!locLower) return [];
    return tourPackages
      .filter((t) => {
        if (t.locations && Array.isArray(t.locations)) {
          return t.locations.some((l) => {
            const lLower = l.toLowerCase();
            return locLower.includes(lLower) || lLower.includes(locLower);
          });
        }
        return false;
      })
      .map((t) => ({
        id: t.id,
        title: t.title,
        duration_days: t.duration_days,
        duration_nights: t.duration_nights,
        price_usd: t.price_usd,
        price_lkr: t.price_lkr,
      }));
  };

  const whatsappUrl = siteSettings?.whatsapp_number
    ? `https://wa.me/${siteSettings.whatsapp_number.replace(/[^0-9]/g, '')}`
    : 'https://wa.me/94775368357';

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

  const defaultWhatsapp = siteSettings?.whatsapp_number || '94775368357';
  const cleanWhatsapp = defaultWhatsapp.replace(/\D/g, '');
  const whatsappReservationUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hello Tripvibe Lanka! I have submitted a reservation for ${guests} guests to ${selectedDestination} (Ref: ${createdBooking?.reference_no || 'Custom Circuit'}). Please advise on final confirmation.`
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-orange-500/20 selection:text-orange-950 font-body overflow-x-clip w-full">
      {/* Zero-jank Scroll Sentinel */}
      <div id="scroll-sentinel" className="absolute top-0 left-0 w-full h-10 pointer-events-none -z-10" />

      {/* Universal Pill Navigation */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => window.scrollTo({ top: 180, behavior: 'smooth' })}
        forceSolid
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-36 lg:pb-24">
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pb-6 sm:pb-12 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white border border-stone-200/90 text-stone-800 shadow-2xs max-w-full">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00] shrink-0" />
            <span className="font-heading tracking-wide uppercase text-[10px] sm:text-[11px] text-stone-600 text-center leading-tight">
              Bespoke Journey Reservation · 100% Private Chauffeured Tours
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
            Reserve Your Sri Lankan <span className="text-[#FF6B00]">Journey</span>
          </h1>

          <p className="text-stone-600 text-xs sm:text-base font-body leading-relaxed max-w-2xl mx-auto">
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
              {/* Mobile App-Style Stepper View (<sm) */}
              <div className="sm:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6B00] text-white shadow-xs shrink-0">
                      Step {step} of 7
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-heading truncate">
                      {STEP_CONFIG[step - 1]?.title || ''}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-500 shrink-0">
                    {Math.round((step / 7) * 100)}%
                  </span>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(step / 7) * 100}%` }}
                  />
                </div>

                {/* Quick Step Tap Buttons */}
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {STEP_CONFIG.map((s) => {
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
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#FF6B00] text-white shadow-xs'
                            : isDone
                            ? 'bg-orange-50 text-[#FF6B00] border border-orange-200/80 cursor-pointer hover:bg-orange-100'
                            : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        }`}
                        title={s.title}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : s.num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Stepper View (>=sm) */}
              <div className="hidden sm:flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:pb-0">
                {STEP_CONFIG.map((s) => {
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
                      <span>{s.label}</span>
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

              {/* Success Notification: Added from catalog */}
              {(initialPkgParam || initialDestParam || initialVehicleParam || initialAddonParam) && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex items-center justify-between gap-3 text-emerald-950 shadow-2xs animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-xs sm:text-sm">
                      <span className="font-bold text-emerald-900 block sm:inline mr-1">
                        Item Added to Your Journey!
                      </span>
                      <span className="text-emerald-700">
                        We&apos;ve pre-loaded your selected{' '}
                        {[
                          initialPkgParam && 'tour package',
                          initialDestParam && 'destination',
                          initialVehicleParam && 'private vehicle',
                          initialAddonParam && 'experience',
                        ]
                          .filter(Boolean)
                          .join(' and ')}{' '}
                        into your booking plan below.
                      </span>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300/60 shrink-0">
                    Pre-Selected
                  </span>
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

                  {/* 1. SELECTED TOUR PACKAGE CARD */}
                  {selectedTour && (
                    <div className="w-full max-w-full overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/40 border border-orange-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                          <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-100/90 px-2 py-0.5 rounded-full">
                              Selected Tour Package
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {selectedTour.duration_days} Days / {selectedTour.duration_nights} Nights
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 truncate mt-1">
                            {selectedTour.title}
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed break-words">
                            Starting from {formatCurrency(currency === 'USD' ? selectedTour.price_usd : selectedTour.price_lkr, currency)} / person · 100% Private Chauffeured Tour
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setDrawerTour(convertToTourDetail(selectedTour))}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Itinerary</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-xs font-bold text-stone-600 hover:text-slate-900 hover:underline cursor-pointer px-2 py-1"
                        >
                          Change Tour →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. SELECTED DESTINATION FOCUS CARD */}
                  {selectedDestObj && selectedDestination !== 'All Island Signature Circuit' && (
                    <div className="w-full max-w-full overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/40 border border-orange-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                        {selectedDestObj.cover_image ? (
                          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 border border-orange-200 shadow-sm mt-0.5 sm:mt-0">
                            <Image
                              src={selectedDestObj.cover_image}
                              alt={selectedDestObj.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-100/90 px-2 py-0.5 rounded-full">
                              Selected Destination Focus
                            </span>
                            {selectedDestObj.district && (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {selectedDestObj.district}
                              </span>
                            )}
                            {selectedDestObj.best_time_to_visit && (
                              <span className="text-[11px] font-medium text-stone-600">
                                Best: {selectedDestObj.best_time_to_visit}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 truncate mt-1">
                            {selectedDestObj.name}
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed break-words">
                            {selectedDestObj.popular_attractions && selectedDestObj.popular_attractions.length > 0
                              ? `Highlights: ${selectedDestObj.popular_attractions.slice(0, 3).join(' · ')}`
                              : selectedDestObj.description || 'Authentic Sri Lankan regional sanctuary included in your itinerary.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setDrawerDestination(selectedDestObj)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Dossier</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('destination-select-field');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="text-xs font-bold text-stone-600 hover:text-slate-900 hover:underline cursor-pointer px-2 py-1"
                        >
                          Change Destination →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. SELECTED PRIVATE VEHICLE CARD */}
                  {selectedVehObj && (initialVehicleParam || (selectedVehicle && selectedVehicle !== vehiclesList[0]?.id)) && (
                    <div className="w-full max-w-full overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/40 border border-orange-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                        {selectedVehObj.cover_image ? (
                          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 border border-orange-200 shadow-sm mt-0.5 sm:mt-0">
                            <Image
                              src={selectedVehObj.cover_image}
                              alt={selectedVehObj.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                            <Car className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-100/90 px-2 py-0.5 rounded-full">
                              Selected Private Vehicle
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Up to {selectedVehObj.capacity_passengers || 3} Guests · {selectedVehObj.capacity_luggage || 2} Bags
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 truncate mt-1">
                            {selectedVehObj.name}
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed break-words">
                            Chauffeured Daily Rate: {formatCurrency(currency === 'USD' ? selectedVehObj.price_per_day_usd || 60 : (selectedVehObj.price_per_day_lkr || (selectedVehObj.price_per_day_usd || 60) * (exchangeRate || 310)), currency)} / day · Private AC &amp; Dedicated Driver Included
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setDrawerVehicle(convertToVehicleDetail(selectedVehObj))}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Specs</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="text-xs font-bold text-stone-600 hover:text-slate-900 hover:underline cursor-pointer px-2 py-1"
                        >
                          Change Vehicle →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. SELECTED EXPERIENCES ADDED TO TRIP */}
                  {selectedAddons.length > 0 && (
                    <div className="space-y-3">
                      {selectedAddons.map((addonId) => {
                        const exp = experiencesList.find((e) => e.id === addonId);
                        if (!exp) return null;
                        const priceFmt = formatCurrency(
                          currency === 'USD' ? exp.price : (exp.price_lkr || exp.price * (exchangeRate || 310)),
                          currency
                        );
                        return (
                          <div
                            key={addonId}
                            className="w-full max-w-full overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/40 border border-orange-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs"
                          >
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                              {exp.cover_image ? (
                                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 border border-orange-200 shadow-sm mt-0.5 sm:mt-0">
                                  <Image
                                    src={exp.cover_image}
                                    alt={exp.title}
                                    fill
                                    className="object-cover"
                                    sizes="44px"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                                  <Sparkles className="w-6 h-6" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-100/90 px-2 py-0.5 rounded-full">
                                    Experience Added to Trip
                                  </span>
                                  {exp.duration && (
                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                      {exp.duration}
                                    </span>
                                  )}
                                  {exp.location && (
                                    <span className="text-[11px] font-medium text-stone-600">
                                      {exp.location}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 truncate mt-1">
                                  {exp.title}
                                </h3>
                                <p className="text-xs text-stone-600 leading-relaxed break-words">
                                  {priceFmt} / person · Handcrafted Private Excursion
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => setDrawerExperience(convertToExperienceDetail(exp))}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setStep(4)}
                                className="text-xs font-bold text-stone-600 hover:text-slate-900 hover:underline cursor-pointer px-2 py-1"
                              >
                                Add More →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Destination Dropdown & Rich Clarity Dossier */}
                  <div id="destination-select-field" className="space-y-2 scroll-mt-24">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                      Primary Destination Focus
                    </label>
                    <CustomDestinationSelect
                      value={selectedDestination}
                      onChange={setSelectedDestination}
                      destinationsList={destinationsList}
                      destinationsData={destinationsData}
                    />

                    {/* Selected Destination Clarity Card */}
                    {selectedDestObj && (
                      <div className="w-full max-w-full overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-stone-50 via-white to-stone-50/80 border border-stone-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-2.5 shadow-2xs">
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                          {selectedDestObj.cover_image ? (
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200 shadow-2xs mt-0.5 sm:mt-0">
                              <Image
                                src={selectedDestObj.cover_image}
                                alt={selectedDestObj.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                              <MapPin className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 font-heading truncate">
                                {selectedDestObj.name}
                              </h4>
                              {selectedDestObj.district && (
                                <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                                  {selectedDestObj.district}
                                </span>
                              )}
                              {selectedDestObj.best_time_to_visit && (
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Best: {selectedDestObj.best_time_to_visit}
                                </span>
                              )}
                            </div>
                            {selectedDestObj.popular_attractions && selectedDestObj.popular_attractions.length > 0 && (
                              <p className="text-xs text-stone-500 leading-relaxed break-words mt-1">
                                <span className="font-semibold text-stone-700">Top Highlights:</span>{' '}
                                {selectedDestObj.popular_attractions.slice(0, 4).join(' · ')}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDrawerDestination(selectedDestObj)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#FF6B00] bg-orange-50 hover:bg-[#FF6B00] hover:text-white transition-all cursor-pointer border border-orange-200/80 shrink-0 self-end sm:self-center shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Destination Dossier</span>
                        </button>
                      </div>
                    )}
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
                        className="w-full min-h-[56px] p-3.5 rounded-2xl border border-stone-300 bg-stone-50/70 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                        Estimated Trip Duration
                      </label>
                      <CustomDurationSelect
                        value={duration}
                        onChange={setDuration}
                      />
                    </div>
                  </div>

                  {/* Guests Counter */}
                  {(() => {
                    const effectiveMinGuests = selectedTour ? (selectedTour.min_guests || 1) : 1;
                    const effectiveMaxGuests = selectedTour ? (selectedTour.max_guests || 20) : 20;
                    const isLockedGuests = Boolean(
                      selectedTour && (
                        selectedTour.guest_policy === 'solo' ||
                        selectedTour.guest_policy === 'couple' ||
                        (selectedTour.min_guests && selectedTour.max_guests && selectedTour.min_guests === selectedTour.max_guests)
                      )
                    );

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 font-heading">
                            Number of Guests (Adults &amp; Children)
                          </label>
                          {selectedTour && (
                            <span className="text-[11px] font-semibold text-[#FF6B00]">
                              {selectedTour.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 bg-stone-50 p-2.5 sm:p-3 rounded-2xl border border-stone-200 w-fit">
                          <button
                            type="button"
                            disabled={isLockedGuests || guests <= effectiveMinGuests}
                            onClick={() => setGuests((prev) => Math.max(effectiveMinGuests, prev - 1))}
                            className="w-11 h-11 rounded-full bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer text-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Decrease guests"
                          >
                            -
                          </button>
                          <div className="flex items-center gap-1.5 min-w-[3ch] justify-center">
                            {isLockedGuests && <Lock className="w-3.5 h-3.5 text-stone-400" />}
                            <span className="text-base sm:text-lg font-bold font-heading text-slate-900 text-center">
                              {guests}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={isLockedGuests || guests >= effectiveMaxGuests}
                            onClick={() => setGuests((prev) => Math.min(effectiveMaxGuests, prev + 1))}
                            className="w-11 h-11 rounded-full bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer text-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Increase guests"
                          >
                            +
                          </button>
                        </div>

                        {/* Capacity Note */}
                        {selectedTour ? (
                          <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                            {selectedTour.guest_policy === 'solo' || (selectedTour.min_guests === 1 && selectedTour.max_guests === 1) ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                                <User className="w-3 h-3 text-sky-600" />
                                Solo Package · Strictly 1 guest
                              </span>
                            ) : selectedTour.guest_policy === 'couple' || (selectedTour.min_guests === 2 && selectedTour.max_guests === 2) ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                <Heart className="w-3 h-3 text-rose-600" />
                                Couple Package · Strictly 2 guests
                              </span>
                            ) : selectedTour.guest_policy === 'family' || (selectedTour.min_guests && selectedTour.min_guests >= 3) ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <Users className="w-3 h-3 text-emerald-600" />
                                Family Package · Allowed range {selectedTour.min_guests} to {selectedTour.max_guests || '20'} guests
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-500">
                                Min {effectiveMinGuests} guest(s) required for this package.
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-stone-400 mt-1">
                            Solo, Couple, and Family packages can also be chosen in the next step.
                          </p>
                        )}
                      </div>
                    );
                  })()}
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

                  {/* Currently Selected Tour Banner */}
                  {selectedTour && (
                    <div className="w-full max-w-full overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/40 border border-orange-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs mb-2">
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                          <Compass className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-100/90 px-2 py-0.5 rounded-full">
                              Currently Selected
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {selectedTour.duration_days} Days / {selectedTour.duration_nights} Nights
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 truncate mt-1">
                            {selectedTour.title}
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed break-words">
                            Starting from {formatCurrency(currency === 'USD' ? selectedTour.price_usd : selectedTour.price_lkr, currency)} / person · 100% Private Chauffeured Tour
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDrawerTour(convertToTourDetail(selectedTour))}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer shadow-2xs shrink-0 self-end sm:self-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Itinerary</span>
                      </button>
                    </div>
                  )}

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
                        className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          selectedPackageId === ''
                            ? 'border-[#FF6B00] bg-orange-50/40 shadow-xs ring-1 ring-[#FF6B00]/30'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 inline-block">
                            Tailor-Made
                          </span>
                          <h3 className="font-bold font-heading text-slate-900 text-sm sm:text-base">
                            Custom Bespoke Circuit
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Craft a 100% custom itinerary with your dedicated private chauffeur guide. Tailored pacing, flexible stops, and handpicked boutique accommodations.
                          </p>
                        </div>

                        {selectedPackageId === '' && (
                          <div className="p-3 rounded-xl bg-white/90 border border-orange-200 space-y-1.5 text-xs shadow-2xs">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] block">
                              Bespoke Inclusions:
                            </span>
                            <div className="space-y-1 text-[11px] text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>100% tailored route across your chosen destinations</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Dedicated English-speaking tourist chauffeur guide</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>All fuel, highway tolls, and parking included</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-xs font-semibold text-emerald-700 flex items-center justify-between pt-2 border-t border-stone-100">
                          <span>Flexible pricing on consultation</span>
                          {selectedPackageId === '' && <Check className="w-4 h-4 text-[#FF6B00]" />}
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
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              const minG = pkg.min_guests || 1;
                              const maxG = pkg.max_guests ?? null;
                              if (pkg.guest_policy === 'solo' || (minG === 1 && maxG === 1)) {
                                setGuests(1);
                              } else if (pkg.guest_policy === 'couple' || (minG === 2 && maxG === 2)) {
                                setGuests(2);
                              } else {
                                setGuests((prev) => {
                                  if (prev < minG) return minG;
                                  if (maxG && prev > maxG) return maxG;
                                  return prev;
                                });
                              }
                            }}
                            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3.5 ${
                              isSelected
                                ? 'border-[#FF6B00] bg-orange-50/40 shadow-xs ring-1 ring-[#FF6B00]/30'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Header & Itinerary Trigger */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {pkg.duration_days} Days / {pkg.duration_nights} Nights
                                  </span>
                                  {/* Guest Policy Badge on Card */}
                                  {pkg.guest_policy === 'solo' || (pkg.min_guests === 1 && pkg.max_guests === 1) ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                      <User className="w-2.5 h-2.5 text-sky-600" />
                                      Solo (1)
                                    </span>
                                  ) : pkg.guest_policy === 'couple' || (pkg.min_guests === 2 && pkg.max_guests === 2) ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                      <Heart className="w-2.5 h-2.5 text-rose-600" />
                                      Couple (2)
                                    </span>
                                  ) : pkg.guest_policy === 'family' || (pkg.min_guests && pkg.min_guests >= 3) ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      <Users className="w-2.5 h-2.5 text-emerald-600" />
                                      Family ({pkg.min_guests}{pkg.max_guests ? `–${pkg.max_guests}` : '+'})
                                    </span>
                                  ) : null}
                                  {pkg.is_featured && (
                                    <span className="text-[10px] font-bold text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                                      Curated
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDrawerTour(convertToTourDetail(pkg));
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-[#FF6B00] bg-white hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-colors border border-stone-200 cursor-pointer shrink-0 shadow-2xs"
                                >
                                  <Eye className="w-3 h-3 text-[#FF6B00]" />
                                  <span>View Itinerary</span>
                                </button>
                              </div>

                              {/* Title & Description */}
                              <h3 className="font-bold font-heading text-slate-900 text-sm sm:text-base leading-snug">
                                {pkg.title}
                              </h3>
                              {pkg.description && (
                                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                  {pkg.description}
                                </p>
                              )}
                            </div>

                            {/* Inline Clarity Box When Selected */}
                            {isSelected && (
                              <div className="p-3.5 rounded-xl bg-white/95 border border-orange-200/90 space-y-2.5 text-xs shadow-2xs animate-in fade-in duration-200">
                                {/* Route Locations */}
                                {pkg.locations && pkg.locations.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] block">
                                      Tour Route:
                                    </span>
                                    <div className="flex flex-wrap items-center gap-1">
                                      {pkg.locations.map((loc, idx) => (
                                        <span
                                          key={loc}
                                          className="inline-flex items-center text-[11px] font-medium text-slate-700 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md"
                                        >
                                          {loc}
                                          {idx < pkg.locations!.length - 1 && (
                                            <span className="text-orange-400 ml-1 font-bold">→</span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Highlights Checklist */}
                                {pkg.highlights && pkg.highlights.length > 0 && (
                                  <div className="space-y-1 pt-2 border-t border-stone-100">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                                      Curated Highlights:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700">
                                      {pkg.highlights.slice(0, 4).map((h) => (
                                        <div key={h} className="flex items-center gap-1.5 truncate">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <span className="truncate">{h}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Included Badge & Full Itinerary Drawer Action */}
                                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    ✓ Chauffeur &amp; AC Vehicle Included
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDrawerTour(convertToTourDetail(pkg));
                                    }}
                                    className="text-[11px] font-bold text-[#FF6B00] hover:text-[#E55F00] hover:underline flex items-center gap-1 shrink-0 cursor-pointer ml-auto"
                                  >
                                    <span>Full Day-by-Day Itinerary</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Price & Selection Checkmark */}
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

                  {/* Currently Selected Vehicle Banner */}
                  {selectedVehObj && (
                    <div className="w-full max-w-full overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/40 border border-orange-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs mb-2">
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                        {selectedVehObj.cover_image ? (
                          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 border border-orange-200 shadow-sm mt-0.5 sm:mt-0">
                            <Image
                              src={selectedVehObj.cover_image}
                              alt={selectedVehObj.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                            <Car className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-100/90 px-2 py-0.5 rounded-full">
                              Currently Selected Vehicle
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Up to {selectedVehObj.capacity_passengers || 3} Guests · {selectedVehObj.capacity_luggage || 2} Bags
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 truncate mt-1">
                            {selectedVehObj.name}
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed break-words">
                            Chauffeured Daily Rate: {formatCurrency(currency === 'USD' ? selectedVehObj.price_per_day_usd || 60 : (selectedVehObj.price_per_day_lkr || (selectedVehObj.price_per_day_usd || 60) * (exchangeRate || 310)), currency)} / day · Private AC &amp; Dedicated Driver Included
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDrawerVehicle(convertToVehicleDetail(selectedVehObj))}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-bold text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer shadow-2xs shrink-0 self-end sm:self-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Specs</span>
                      </button>
                    </div>
                  )}

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
                          className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3.5 ${
                            isSelected
                              ? 'border-[#FF6B00] bg-orange-50/40 shadow-xs ring-1 ring-[#FF6B00]/30'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                              {veh.category || veh.type || 'Executive Sedan'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDrawerVehicle(convertToVehicleDetail(veh));
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-[#FF6B00] bg-white hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-colors border border-stone-200 cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3 h-3 text-[#FF6B00]" />
                              <span>Vehicle Specs</span>
                            </button>
                          </div>

                          <div>
                            <h3 className="font-bold font-heading text-slate-900 text-sm sm:text-base">
                              {veh.name}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                Up to {veh.capacity_passengers || 3} Guests
                              </span>
                              <span className="flex items-center gap-1">
                                <Car className="w-3.5 h-3.5" />
                                {veh.capacity_luggage || 2} Large Suitcases
                              </span>
                            </div>
                          </div>

                          {/* Inline Vehicle Clarity Box When Selected */}
                          {isSelected && (
                            <div className="p-3.5 rounded-xl bg-white/95 border border-orange-200/90 space-y-2.5 text-xs shadow-2xs animate-in fade-in duration-200">
                              {veh.cover_image && (
                                <div className="relative h-32 w-full rounded-xl overflow-hidden border border-stone-200 shadow-2xs">
                                  <Image
                                    src={veh.cover_image}
                                    alt={veh.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                  />
                                </div>
                              )}

                              {/* Amenities / Features */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] block">
                                  Included Amenities:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(veh.features && veh.features.length > 0
                                    ? veh.features
                                    : ['Dual Zone AC', 'Wi-Fi Onboard', 'USB Charging', 'Reclining Seats', 'English Speaking Chauffeur']
                                  ).slice(0, 5).map((f) => (
                                    <span
                                      key={f}
                                      className="text-[10px] font-semibold text-slate-700 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md flex items-center gap-1"
                                    >
                                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Transmission & Fuel */}
                              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                                <span>
                                  {veh.transmission || 'Automatic'} · {veh.fuel_type || 'Diesel'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDrawerVehicle(convertToVehicleDetail(veh));
                                  }}
                                  className="font-bold text-[#FF6B00] hover:text-[#E55F00] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Full Vehicle Dossier</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold">
                            <span className="text-stone-600">Chauffeur &amp; Vehicle Rate</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 font-bold">{pricePerDayFmt} / day</span>
                              {isSelected && <Check className="w-4 h-4 text-[#FF6B00]" />}
                            </div>
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

                  {/* Currently Selected Experiences Banner */}
                  {selectedAddons.length > 0 && (
                    <div className="w-full max-w-full overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-orange-50/40 border border-orange-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs mb-2">
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B00] bg-orange-100/90 px-2 py-0.5 rounded-full">
                              Activities In Itinerary
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {selectedAddons.length} {selectedAddons.length === 1 ? 'Activity' : 'Activities'} Selected
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 leading-snug break-words mt-1">
                            {selectedAddons.map((id) => experiencesList.find((e) => e.id === id)?.title).filter(Boolean).join(', ')}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

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
                          className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                            isSelected
                              ? 'border-[#FF6B00] bg-orange-50/40 shadow-xs ring-1 ring-[#FF6B00]/30'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {act.category && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
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
                              <h3 className="font-bold font-heading text-slate-900 text-sm sm:text-base">
                                {act.title}
                              </h3>
                              {act.description && (
                                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                  {act.description}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 block font-heading">{priceFmt}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDrawerExperience(convertToExperienceDetail(act));
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px] font-bold text-stone-600 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors shadow-2xs cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-[#FF6B00]" />
                                  <span>Details</span>
                                </button>
                                <span className={`text-[11px] font-bold px-3 py-1 rounded-lg inline-block transition-colors ${
                                  isSelected ? 'bg-[#FF6B00] text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}>
                                  {isSelected ? '✓ Added' : '+ Add'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Inline Experience Clarity Box When Selected */}
                          {isSelected && (
                            <div className="p-3 rounded-xl bg-white/95 border border-orange-200/90 text-xs shadow-2xs flex items-center justify-between gap-3 flex-wrap animate-in fade-in duration-200">
                              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Added to itinerary · Private logistical scheduling included</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrawerExperience(convertToExperienceDetail(act));
                                }}
                                className="text-[11px] font-bold text-[#FF6B00] hover:text-[#E55F00] hover:underline flex items-center gap-1 cursor-pointer ml-auto"
                              >
                                <span>View Experience Gallery &amp; Inclusions</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
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
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Primary Destination</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{selectedDestination}</strong>
                        {selectedDestObj && (
                          <button
                            type="button"
                            onClick={() => setDrawerDestination(selectedDestObj)}
                            className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                          >
                            View Guide
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Travel Dates &amp; Duration</span>
                      <strong className="text-slate-900">{startDate} ({duration})</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Party Size</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-900">{guests} {guests === 1 ? 'Guest' : 'Guests'}</strong>
                        {selectedTour && (
                          selectedTour.guest_policy === 'solo' || (selectedTour.min_guests === 1 && selectedTour.max_guests === 1) ? (
                            <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">Solo</span>
                          ) : selectedTour.guest_policy === 'couple' || (selectedTour.min_guests === 2 && selectedTour.max_guests === 2) ? (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">Couple</span>
                          ) : selectedTour.guest_policy === 'family' || (selectedTour.min_guests && selectedTour.min_guests >= 3) ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Family</span>
                          ) : null
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Private Tour Plan</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{selectedTour ? selectedTour.title : 'Custom Bespoke Route'}</strong>
                        {selectedTour && (
                          <button
                            type="button"
                            onClick={() => setDrawerTour(convertToTourDetail(selectedTour))}
                            className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                          >
                            View Itinerary
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Selected Vehicle</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{selectedVehObj?.name || 'Executive Chauffeur Vehicle'}</strong>
                        {selectedVehObj && (
                          <button
                            type="button"
                            onClick={() => setDrawerVehicle(convertToVehicleDetail(selectedVehObj))}
                            className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                          >
                            View Specs
                          </button>
                        )}
                      </div>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-stone-200">
                        <div className="flex justify-between text-stone-600">
                          <span>Activities Added ({selectedAddons.length})</span>
                          <span className="text-xs font-semibold text-emerald-700">Included in Reservation</span>
                        </div>
                        <div className="space-y-1 pl-2">
                          {selectedAddons.map((addonId) => {
                            const exp = experiencesList.find((e) => e.id === addonId);
                            if (!exp) return null;
                            return (
                              <div key={addonId} className="flex items-center justify-between text-xs">
                                <span className="text-slate-800 truncate">• {exp.title}</span>
                                <button
                                  type="button"
                                  onClick={() => setDrawerExperience(convertToExperienceDetail(exp))}
                                  className="text-[11px] font-bold text-[#FF6B00] hover:underline shrink-0 ml-2 cursor-pointer"
                                >
                                  Details
                                </button>
                              </div>
                            );
                          })}
                        </div>
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
                {selectedTour && (
                  <div className="flex items-start justify-between gap-2 p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Compass className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-orange-800 block">
                          Selected Tour Package
                        </span>
                        <span className="font-bold text-slate-900 block leading-tight text-xs truncate">
                          {selectedTour.title}
                        </span>
                        <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                          {selectedTour.duration_days} Days / {selectedTour.duration_nights} Nights
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDrawerTour(convertToTourDetail(selectedTour))}
                      className="text-[10px] font-bold text-[#FF6B00] hover:text-[#E55F00] hover:underline cursor-pointer shrink-0 mt-0.5"
                    >
                      Itinerary
                    </button>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-stone-500 block">Destination</span>
                      <span className="font-bold text-slate-900 truncate block">{selectedDestination}</span>
                    </div>
                  </div>
                  {selectedDestObj && (
                    <button
                      type="button"
                      onClick={() => setDrawerDestination(selectedDestObj)}
                      className="text-[10px] font-bold text-[#FF6B00] hover:text-[#E55F00] hover:underline cursor-pointer shrink-0 mt-0.5"
                    >
                      Guide
                    </button>
                  )}
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

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Car className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-stone-500 block">Vehicle Tier</span>
                      <span className="font-bold text-slate-900 truncate block">
                        {selectedVehObj?.name || 'Private Chauffeur Sedan'}
                      </span>
                    </div>
                  </div>
                  {selectedVehObj && (
                    <button
                      type="button"
                      onClick={() => setDrawerVehicle(convertToVehicleDetail(selectedVehObj))}
                      className="text-[10px] font-bold text-[#FF6B00] hover:text-[#E55F00] hover:underline cursor-pointer shrink-0 mt-0.5"
                    >
                      Specs
                    </button>
                  )}
                </div>

                {selectedAddons.length > 0 && (
                  <div className="pt-2.5 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-orange-800">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Added Experiences ({selectedAddons.length})</span>
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedAddons.map((addonId) => {
                        const exp = experiencesList.find((e) => e.id === addonId);
                        if (!exp) return null;
                        const priceFmt = formatCurrency(
                          currency === 'USD' ? exp.price : (exp.price_lkr || exp.price * (exchangeRate || 310)),
                          currency
                        );
                        return (
                          <div
                            key={addonId}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-orange-50/60 border border-orange-200/60 text-[11px]"
                          >
                            <span className="font-semibold text-slate-800 truncate">
                              {exp.title}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-bold text-[#FF6B00]">
                                {priceFmt}
                              </span>
                              <button
                                type="button"
                                onClick={() => setDrawerExperience(convertToExperienceDetail(exp))}
                                className="text-[10px] font-bold text-stone-500 hover:text-[#FF6B00] hover:underline cursor-pointer ml-1"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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

      {/* Mobile Sticky Bottom Summary Dock (<lg viewports, hidden on confirmation step) */}
      {step < 7 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold font-heading text-slate-900 leading-none">
                  {formatCurrency(finalTotal, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileSummaryOpen(true)}
                  className="text-[11px] font-bold text-[#FF6B00] underline underline-offset-2 ml-1 cursor-pointer flex items-center gap-0.5"
                >
                  <span>Docket</span>
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                20% Deposit: <strong className="text-orange-700 font-bold">{formatCurrency(advanceDeposit, currency)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-10 h-10 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer active:scale-95"
                  aria-label="Previous Step"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#FF6B00] hover:bg-[#E55F00] text-white shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmittingBooking}
                  onClick={handleFinalSubmit}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#FF6B00] hover:bg-[#E55F00] text-white shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmittingBooking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Locking...</span>
                    </>
                  ) : (
                    <>
                      <span>Lock Rate</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Trip Docket Drawer Modal */}
      {isMobileSummaryOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileSummaryOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-heading font-bold uppercase tracking-wider text-slate-900">
                  Trip Docket Summary
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#FF6B00]">
                  Step {step} of 7
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
                aria-label="Close summary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Content */}
            <div className="space-y-3 text-xs">
              {selectedTour && (
                <div className="flex items-start justify-between gap-2 p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Compass className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-orange-800 block">
                        Selected Tour Package
                      </span>
                      <span className="font-bold text-slate-900 block leading-tight text-xs truncate">
                        {selectedTour.title}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                        {selectedTour.duration_days} Days / {selectedTour.duration_nights} Nights
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileSummaryOpen(false);
                      setDrawerTour(convertToTourDetail(selectedTour));
                    }}
                    className="text-[10px] font-bold text-[#FF6B00] underline shrink-0 mt-0.5 cursor-pointer"
                  >
                    Itinerary
                  </button>
                </div>
              )}

              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-stone-500 block text-[11px]">Destination Focus</span>
                    <span className="font-bold text-slate-900 truncate block">{selectedDestination}</span>
                  </div>
                </div>
                {selectedDestObj && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileSummaryOpen(false);
                      setDrawerDestination(selectedDestObj);
                    }}
                    className="text-[10px] font-bold text-[#FF6B00] underline shrink-0 mt-0.5 cursor-pointer"
                  >
                    Guide
                  </button>
                )}
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <Calendar className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-500 block text-[11px]">Dates &amp; Duration</span>
                  <span className="font-bold text-slate-900">
                    {startDate ? `${startDate} · ${duration}` : `Dates Pending (${duration})`}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <Users className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-500 block text-[11px]">Guests</span>
                  <span className="font-bold text-slate-900">{guests} Adults / Travelers</span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Car className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-stone-500 block text-[11px]">Vehicle Tier</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {selectedVehObj?.name || 'Private Chauffeur Sedan'}
                    </span>
                  </div>
                </div>
                {selectedVehObj && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileSummaryOpen(false);
                      setDrawerVehicle(convertToVehicleDetail(selectedVehObj));
                    }}
                    className="text-[10px] font-bold text-[#FF6B00] underline shrink-0 mt-0.5 cursor-pointer"
                  >
                    Specs
                  </button>
                )}
              </div>

              {selectedAddons.length > 0 && (
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Added Experiences ({selectedAddons.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {selectedAddons.map((addonId) => {
                      const exp = experiencesList.find((e) => e.id === addonId);
                      if (!exp) return null;
                      const priceFmt = formatCurrency(
                        currency === 'USD' ? exp.price : (exp.price_lkr || exp.price * (exchangeRate || 310)),
                        currency
                      );
                      return (
                        <div
                          key={addonId}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-orange-50/60 border border-orange-200/60 text-[11px]"
                        >
                          <span className="font-semibold text-slate-800 truncate">{exp.title}</span>
                          <span className="font-bold text-[#FF6B00] shrink-0">{priceFmt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Base Itinerary ({guests} guests)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(baseRate * guests, currency)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Vehicle &amp; Chauffeur Fuel</span>
                <span className="font-semibold text-slate-900">{formatCurrency(vehicleExtra, currency)}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Signature Add-on Activities</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(addonsTotal, currency)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount</span>
                  <span>-{formatCurrency(discountAmount, currency)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-heading font-bold text-slate-900">Total Quoted</span>
                <span className="text-lg font-bold font-heading text-slate-900">{formatCurrency(finalTotal, currency)}</span>
              </div>

              {/* Deposit Breakdown */}
              <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-orange-950">20% Advance to Secure Dates:</span>
                  <strong className="text-[#FF6B00] text-sm">{formatCurrency(advanceDeposit, currency)}</strong>
                </div>
                <div className="flex justify-between items-center text-[11px] text-stone-600">
                  <span>80% Balance on Chauffeur Arrival:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(balanceOnArrival, currency)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSummaryOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

      {/* Universal Footer */}
      <Footer />

      {/* Interactive Slide-over Drawers for In-depth Clarity */}
      <TourDetailDrawer
        tour={drawerTour}
        isOpen={!!drawerTour}
        onClose={() => setDrawerTour(null)}
        onBookTour={(tourId) => {
          setSelectedPackageId(tourId);
          setDrawerTour(null);
        }}
        currency={currency}
      />

      <VehicleDetailDrawer
        vehicle={drawerVehicle}
        isOpen={!!drawerVehicle}
        onClose={() => setDrawerVehicle(null)}
        currency={currency}
        onReserve={(vehId) => {
          setSelectedVehicle(vehId);
          setDrawerVehicle(null);
        }}
      />

      <ExperienceDetailDrawer
        experience={drawerExperience}
        isOpen={!!drawerExperience}
        onClose={() => setDrawerExperience(null)}
        currency={currency}
        exchangeRate={exchangeRate}
        linkedTours={drawerExperience ? getLinkedToursForExperience(drawerExperience) : []}
        onOpenBooking={(addonId) => {
          if (!selectedAddons.includes(addonId)) {
            setSelectedAddons((prev) => [...prev, addonId]);
          }
          setDrawerExperience(null);
        }}
        whatsappUrl={whatsappUrl}
      />

      <DestinationDetailDrawer
        destination={drawerDestination}
        isOpen={!!drawerDestination}
        onClose={() => setDrawerDestination(null)}
        currency={currency}
        exchangeRate={exchangeRate}
        linkedTours={drawerDestination ? getLinkedToursForDestination(drawerDestination) : []}
        linkedActivities={drawerDestination ? getLinkedActivitiesForDestination(drawerDestination) : []}
        onOpenBooking={(destName, packageId) => {
          setSelectedDestination(destName);
          if (packageId) {
            setSelectedPackageId(packageId);
          }
          setDrawerDestination(null);
        }}
        whatsappUrl={whatsappUrl}
      />
    </div>
  );
}
