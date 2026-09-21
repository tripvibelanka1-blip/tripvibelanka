'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Car,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  HelpCircle,
  X,
  Compass,
  Check,
} from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { useCurrency } from '@/context/CurrencyContext';
import VehicleDetailDrawer, { FleetVehicleDetail } from './VehicleDetailDrawer';

interface FleetClientProps {
  initialVehicles: FleetVehicleDetail[];
}

export default function FleetClient({ initialVehicles }: FleetClientProps) {
  const router = useRouter();
  const { currency, setCurrency, exchangeRate } = useCurrency();
  const [vehicles] = useState<FleetVehicleDetail[]>(initialVehicles);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('All');

  // Drawer State
  const [selectedVehicleForDrawer, setSelectedVehicleForDrawer] = useState<FleetVehicleDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Categories extracted dynamically from database
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    vehicles.forEach((v) => {
      if (v.category) {
        cats.add(v.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Category match
      if (selectedCategory !== 'All') {
        const cat = (vehicle.category || '').toLowerCase();
        if (selectedCategory.toLowerCase() === 'vans' && !cat.includes('van')) return false;
        if (selectedCategory.toLowerCase() === 'sedans' && !cat.includes('sedan') && !cat.includes('luxury')) return false;
        if (selectedCategory.toLowerCase() === 'mini buses' && !cat.includes('bus') && !cat.includes('coach')) return false;
      }

      // Capacity match
      if (selectedCapacity !== 'All') {
        const pass = vehicle.passenger_capacity || 3;
        if (selectedCapacity === '1-3' && pass > 3) return false;
        if (selectedCapacity === '4-6' && (pass < 4 || pass > 6)) return false;
        if (selectedCapacity === '7+' && pass < 7) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = vehicle.name.toLowerCase().includes(q);
        const descMatch = vehicle.description?.toLowerCase().includes(q) || false;
        const recMatch = vehicle.recommended_for?.toLowerCase().includes(q) || false;
        const featMatch = Array.isArray(vehicle.features)
          ? vehicle.features.some((f) => f.toLowerCase().includes(q))
          : false;

        return nameMatch || descMatch || recMatch || featMatch;
      }

      return true;
    });
  }, [vehicles, selectedCategory, selectedCapacity, searchQuery]);

  const handleOpenDrawer = (vehicle: FleetVehicleDetail) => {
    setSelectedVehicleForDrawer(vehicle);
    setIsDrawerOpen(true);
  };

  const handleQuickReserve = (vehicleId?: string) => {
    if (vehicleId) {
      router.push(`/booking?vehicle=${encodeURIComponent(vehicleId)}`);
    } else {
      router.push('/booking');
    }
  };

  const formatPrice = (v: FleetVehicleDetail) => {
    const priceUsd = Number(v.price_per_day_usd) || 0;
    if (currency === 'USD') return `$${priceUsd}`;
    const priceLkr =
      Number(v.price_per_day_lkr) || Math.round(priceUsd * (exchangeRate || 310));
    return `Rs. ${priceLkr.toLocaleString()}`;
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedCapacity('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white overflow-x-clip w-full">
      {/* Universal Sticky Navbar */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => handleQuickReserve()}
        forceSolid={true}
      />

      <main className="flex-1 pt-24 pb-20">
        {/* Editorial Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-12">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-stone-200 text-stone-700 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Executive Private Fleet and Licensed Chauffeur Guides</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 font-heading leading-tight">
              Tour Sri Lanka in <span className="text-[#FF6B00]">Unhurried Luxury</span>
            </h1>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Every private journey includes a late-model, fully air-conditioned vehicle, comprehensive passenger insurance, onboard Wi-Fi, and a courteous government-certified English-speaking chauffeur guide.
            </p>
          </div>

          {/* Trust Credentials Strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">Certified Guides</span>
                <span className="text-[11px] text-stone-500 block">English-fluent professionals</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">Fully Insured</span>
                <span className="text-[11px] text-stone-500 block">Comprehensive passenger cover</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">Onboard Wi-Fi</span>
                <span className="text-[11px] text-stone-500 block">4G connectivity and chargers</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">Total Flexibility</span>
                <span className="text-[11px] text-stone-500 block">Spontaneous stops and routes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
              {/* Search Box */}
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vehicles by name, features, or comfort..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Results Counter */}
              <div className="text-xs font-medium text-stone-500 self-start md:self-auto">
                Showing{' '}
                <span className="font-bold text-stone-900">{filteredVehicles.length}</span> of{' '}
                <span className="font-bold text-stone-900">{vehicles.length}</span> active vehicles
              </div>
            </div>

            {/* Category & Capacity Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-stone-400 mr-1 hidden sm:inline">
                  Category:
                </span>
                {(['All', 'Vans', 'Sedans', 'Mini Buses'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#FF6B00] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Capacity Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-stone-400 mr-1 hidden sm:inline">
                  Party Size:
                </span>
                {[
                  { label: 'All', value: 'All' },
                  { label: '1 to 3', value: '1-3' },
                  { label: '4 to 6', value: '4-6' },
                  { label: '7+', value: '7+' },
                ].map((cap) => (
                  <button
                    key={cap.value}
                    onClick={() => setSelectedCapacity(cap.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedCapacity === cap.value
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                    }`}
                  >
                    {cap.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vehicles Grid */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {filteredVehicles.length === 0 ? (
            <div className="p-12 sm:p-16 rounded-3xl bg-white border border-dashed border-stone-300 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500 mx-auto">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-heading">
                No Vehicles Match Your Search
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Try adjusting your category or party size filters. Our transport desk can also source custom luxury vehicles on request.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2 rounded-full text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredVehicles.map((vehicle) => {
                const passCount = vehicle.passenger_capacity || 3;
                const bagCount = vehicle.luggage_capacity || 2;
                const passText =
                  vehicle.passengers_text?.trim() ||
                  (passCount <= 3 ? `1 to ${passCount} Passengers` : `${passCount} Passengers`);
                const lugText = vehicle.luggage_text?.trim() || `${bagCount} Luggage Bags`;

                const featList =
                  Array.isArray(vehicle.features) && vehicle.features.length > 0
                    ? vehicle.features
                    : [
                        'Dual-Zone Climate A/C',
                        'Complimentary 4G Wi-Fi',
                        'Licensed English Speaking Chauffeur',
                      ];

                return (
                  <div
                    key={vehicle.id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="relative h-60 w-full overflow-hidden bg-stone-100">
                        {vehicle.cover_image ? (
                          <Image
                            src={vehicle.cover_image}
                            alt={vehicle.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            Vehicle Photo
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                        {/* Top Category Badge */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
                            {vehicle.category ? vehicle.category.toUpperCase() : 'FLEET'}
                          </span>
                        </div>

                        {/* Bottom Floating Overlay */}
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <span className="text-[11px] text-stone-200 block font-medium">
                            Private Chauffeur Tour
                          </span>
                          <h3 className="text-xl font-bold font-heading drop-shadow-xs">
                            {vehicle.name}
                          </h3>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 space-y-4">
                        {vehicle.recommended_for && (
                          <p className="text-xs text-stone-500 italic">
                            {vehicle.recommended_for}
                          </p>
                        )}

                        {/* Capacity Grid */}
                        <div className="grid grid-cols-2 gap-2 py-3 border-y border-stone-100 text-xs text-stone-700">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#FF6B00] shrink-0" />
                            <span className="font-medium">{passText}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-stone-500 shrink-0" />
                            <span className="font-medium">{lugText}</span>
                          </div>
                        </div>

                        {/* Feature Highlights */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                            Included In Vehicle
                          </span>
                          <ul className="space-y-1">
                            {featList.slice(0, 4).map((feat, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-xs text-stone-600"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action Bar */}
                    <div className="p-6 pt-4 border-t border-stone-100 bg-[#FAF9F6] flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 font-medium block">
                            Daily Chauffeur Rate
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-stone-900 font-heading">
                              {formatPrice(vehicle)}
                            </span>
                            <span className="text-xs text-stone-500">/ day</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenDrawer(vehicle)}
                          className="text-xs font-bold text-stone-600 hover:text-[#FF6B00] transition-colors cursor-pointer"
                        >
                          Specs Dossier →
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenDrawer(vehicle)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer text-center"
                        >
                          View Details
                        </button>

                        <Link
                          href={`/booking?vehicle=${vehicle.id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-xs transition-all cursor-pointer text-center"
                        >
                          <span>Book Vehicle</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Why Choose Our Private Fleet Bento Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              The TripVibe Lanka Fleet Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-stone-900">
              Why Private Chauffeur Travel Outshines Buses and Trains
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Explore the teardrop isle at your own unhurried cadence with certified professionals who care about your comfort and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">
                Comprehensive Passenger Insurance
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every vehicle holds commercial tourist vehicle licensing and full passenger liability insurance verified under Sri Lanka Tourism regulations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">
                Tourism-Certified Chauffeurs
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fluent in English, courteous, and knowledgeable in local customs, wildlife habitats, scenic photography viewpoints, and secret routes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">
                Unhurried Itinerary Freedom
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Want to stop for King Coconuts, pause at a tea plantation, or watch the sunset over a lagoon? Your chauffeur moves at your family pace.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">
                Transparent All-Inclusive Pricing
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                No surprise highway toll fees, no hidden parking charges, and no sudden driver food surcharges. Everything is locked in upfront.
              </p>
            </div>
          </div>
        </section>

        {/* Custom Luxury Vehicle Inquiry Banner */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-16">
          <div className="rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF8F1] border border-orange-200/80 p-8 sm:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Copy and CTAs */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF6B00] border border-orange-200/70">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Specialized Fleet & VIP Requests</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-stone-900 leading-tight">
                  Looking for a Mercedes, Land Cruiser, or 28-Seat Coach?
                </h2>

                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
                  Beyond our signature fleet, our concierge maintains direct access to luxury VIP SUVs, executive Mercedes-Benz sedans, vintage wedding convertibles, and large tour coaches across Sri Lanka.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="https://wa.me/94775368357?text=Hello%20TripVibe%20Lanka!%20I%20am%20looking%20for%20a%20specialized%20vehicle%20class%20for%20my%20tour."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Inquire on WhatsApp 24/7</span>
                  </a>

                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-white hover:bg-stone-50 text-stone-900 border border-stone-300/80 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    <span>Build Custom Journey</span>
                    <ArrowUpRight className="w-4 h-4 text-[#FF6B00]" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Balanced Micro-Feature Cards */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">VIP Mercedes & SUVs</span>
                    <span className="text-[11px] text-stone-500 block">E-Class, Prado, and Land Cruiser V8</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Group Tour Coaches</span>
                    <span className="text-[11px] text-stone-500 block">14 to 33 seat luxury air-conditioned coaches</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Instant Quote Guarantee</span>
                    <span className="text-[11px] text-stone-500 block">Clear fixed pricing with driver and fuel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Slide-over Vehicle Detail Drawer */}
      <VehicleDetailDrawer
        vehicle={selectedVehicleForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currency={currency}
        onReserve={(vId) => {
          setIsDrawerOpen(false);
          handleQuickReserve(vId);
        }}
      />

      {/* Universal Footer */}
      <Footer onOpenBooking={() => handleQuickReserve()} />
    </div>
  );
}
