'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Currency, FleetVehicle } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/utils/supabase/client';
import {
  Users,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  Car,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

interface FleetShowcaseProps {
  currency: Currency;
  onSelectVehicle: (vehicleId: string) => void;
}

export default function FleetShowcase({ currency, onSelectVehicle }: FleetShowcaseProps) {
  const { exchangeRate } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Sedans' | 'Vans' | 'Mini Buses'>('All');
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Reset active vehicle when category changes
  useEffect(() => {
    setActiveVehicleIndex(0);
  }, [selectedCategory]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const currentList =
      selectedCategory === 'All'
        ? vehicles
        : vehicles.filter((v) => v.category === selectedCategory);

    if (Math.abs(diff) > 40 && currentList.length > 1) {
      if (diff > 0) {
        // Swiped left -> next
        setActiveVehicleIndex((prev) => (prev + 1) % currentList.length);
      } else {
        // Swiped right -> prev
        setActiveVehicleIndex((prev) => (prev - 1 + currentList.length) % currentList.length);
      }
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadLiveVehicles() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[FleetShowcase] Supabase notice:', error.message);
          if (isMounted) setVehicles([]);
          return;
        }

        if (isMounted) {
          if (data && data.length > 0) {
            const mapped: FleetVehicle[] = data.map((v) => {
              const rawCat = (v.category || '').toLowerCase();
              let cat: 'Sedans' | 'Vans' | 'Mini Buses' = 'Sedans';
              if (rawCat === 'van' || rawCat === 'vans') {
                cat = 'Vans';
              } else if (rawCat === 'mini_bus' || rawCat === 'bus' || rawCat === 'mini buses') {
                cat = 'Mini Buses';
              } else if (rawCat === 'sedan' || rawCat === 'sedans' || rawCat === 'luxury') {
                cat = 'Sedans';
              }

              const priceUsd = Number(v.price_per_day_usd) || 0;
              const priceLkr =
                Number(v.price_per_day_lkr) ||
                Math.round(priceUsd * (exchangeRate || 310));

              const passCount = Number(v.passenger_capacity) || 3;
              const bagCount = Number(v.luggage_capacity) || 2;

              const passText =
                v.passengers_text?.trim() ||
                (passCount <= 3 ? `1 - ${passCount} Passengers` : `${passCount} Passengers`);

              const lugText =
                v.luggage_text?.trim() || `${bagCount} Luggage Bags`;

              const defRecommended =
                cat === 'Sedans'
                  ? 'Couples, solo travelers & executive business trips'
                  : cat === 'Vans'
                  ? 'Families, small groups & travelers with bulky luggage'
                  : 'Extended families, tour groups & retreat parties';

              const featList =
                Array.isArray(v.features) && v.features.length > 0
                  ? (v.features as string[])
                  : [
                      'Dual-Zone Climate A/C',
                      'Complimentary 4G Wi-Fi',
                      'Leather Ergonomic Seats',
                      'Bottled Mineral Water',
                    ];

              const coverImg =
                v.cover_image ||
                (Array.isArray(v.gallery_images) && v.gallery_images.length > 0
                  ? v.gallery_images[0]
                  : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80');

              return {
                id: v.id,
                name: v.name,
                category: cat,
                passengers: passText,
                luggage: lugText,
                features: featList,
                image: coverImg,
                pricePerDayUSD: priceUsd,
                pricePerDayLKR: priceLkr,
                recommendedFor: v.recommended_for?.trim() || defRecommended,
              };
            });

            setVehicles(mapped);
          } else {
            setVehicles([]);
          }
        }
      } catch (err) {
        console.warn('[FleetShowcase] Error loading vehicles:', err);
        if (isMounted) setVehicles([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLiveVehicles();

    return () => {
      isMounted = false;
    };
  }, [exchangeRate]);

  const filteredVehicles =
    selectedCategory === 'All'
      ? vehicles
      : vehicles.filter((v) => v.category === selectedCategory);

  const formatPrice = (v: FleetVehicle) => {
    if (currency === 'USD') {
      return `$${v.pricePerDayUSD}`;
    }
    const lkr = v.pricePerDayLKR || Math.round(v.pricePerDayUSD * exchangeRate);
    return `Rs. ${lkr.toLocaleString()}`;
  };

  return (
    <section id="fleet" className="py-24 bg-slate-50/70 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Tabs */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
              Executive <span className="font-semibold text-slate-950">Private Fleet</span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              All vehicles are late-model, fully air-conditioned, commercially insured, and operated by government-certified English-speaking chauffeurs.
            </p>
          </div>

          {/* Category Filter */}
          <div className="w-full xl:w-auto overflow-x-auto hide-scrollbar pb-1 self-start xl:self-auto">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white border border-slate-200 shadow-xs whitespace-nowrap min-w-max">
              {(['All', 'Sedans', 'Vans', 'Mini Buses'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 select-none ${
                    selectedCategory === cat
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-16 rounded-3xl bg-white border border-slate-200/80 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
            <span className="text-xs font-semibold text-slate-500 tracking-wide">
              Loading executive fleet vehicles...
            </span>
          </div>
        ) : vehicles.length === 0 ? (
          // Coming Soon Empty State
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Executive Fleet Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
              Our executive sedans, passenger vans, and luxury coaches are being prepped for dispatch. Contact our transport desk for private chauffeur bookings.
            </p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/70 p-8">
            <p className="text-sm font-medium text-slate-600">
              No vehicles available in &ldquo;{selectedCategory}&rdquo;.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-3 text-xs font-bold text-[#FF6B00] hover:underline"
            >
              View all fleet vehicles
            </button>
          </div>
        ) : (
          <div>
            {/* ================= MOBILE VIEW: Interactive Luxury Showroom Stage (< lg) ================= */}
            <div className="block lg:hidden space-y-4">
              {/* 1. Horizontal Tactile Vehicle Switcher Bar */}
              <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 pb-1">
                <div className="inline-flex gap-2 min-w-max">
                  {filteredVehicles.map((v, idx) => {
                    const isSelected = (filteredVehicles[activeVehicleIndex] ? activeVehicleIndex : 0) === idx;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveVehicleIndex(idx)}
                        className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-md ring-2 ring-[#FF6B00]/40'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#FF6B00]' : 'bg-slate-300'}`} />
                        <span>{v.name.split(' ')[0]}</span>
                        <span className={`text-[11px] font-medium ${isSelected ? 'text-orange-300' : 'text-slate-400'}`}>
                          {formatPrice(v)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Central Automotive Stage Card */}
              {(() => {
                const activeVehicle = filteredVehicles[activeVehicleIndex] || filteredVehicles[0];
                if (!activeVehicle) return null;

                return (
                  <div
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md transition-all duration-300 flex flex-col"
                  >
                    {/* Vehicle Hero Media Display with Quick Navigation Overlay */}
                    <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-950 select-none">
                      <Image
                        src={activeVehicle.image}
                        alt={activeVehicle.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30 pointer-events-none" />

                      {/* Top Floating Badges & Arrows */}
                      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-white border border-white/20 shadow-sm">
                          {activeVehicle.category}
                        </span>

                        <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md border border-white/20 rounded-full p-1 text-white shadow-sm">
                          <button
                            type="button"
                            aria-label="Previous vehicle"
                            onClick={() =>
                              setActiveVehicleIndex(
                                (prev) => (prev - 1 + filteredVehicles.length) % filteredVehicles.length
                              )
                            }
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="font-mono text-[11px] font-bold px-1.5 text-slate-200">
                            {((activeVehicleIndex % filteredVehicles.length) + 1)} / {filteredVehicles.length}
                          </span>
                          <button
                            type="button"
                            aria-label="Next vehicle"
                            onClick={() =>
                              setActiveVehicleIndex((prev) => (prev + 1) % filteredVehicles.length)
                            }
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Banner on Image: Verified Chauffeur Included */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Certified Chauffeur Included</span>
                        </span>
                        <span className="text-[11px] text-slate-300/80 font-medium">Swipe to switch</span>
                      </div>
                    </div>

                    {/* Stage Details & Specifications HUD */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Title & Tagline */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                          {activeVehicle.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 italic">
                          {activeVehicle.recommendedFor}
                        </p>
                      </div>

                      {/* 4-Tile Quick Specs Matrix */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-7 h-7 rounded-xl bg-orange-100/70 text-[#FF6B00] flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 block font-medium">Capacity</span>
                            <span className="font-semibold text-slate-800 truncate block">{activeVehicle.passengers}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-7 h-7 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 block font-medium">Luggage</span>
                            <span className="font-semibold text-slate-800 truncate block">{activeVehicle.luggage}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-7 h-7 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 block font-medium">Climate</span>
                            <span className="font-semibold text-slate-800 truncate block">Dual-Zone A/C</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-7 h-7 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                            <Wifi className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 block font-medium">Connectivity</span>
                            <span className="font-semibold text-slate-800 truncate block">Free 4G Wi-Fi</span>
                          </div>
                        </div>
                      </div>

                      {/* Feature Highlights Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeVehicle.features.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100/80 text-slate-600 border border-slate-200/60"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#FF6B00]" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stage Booking Footer */}
                    <div className="p-5 pt-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Daily Rate (With Chauffeur)
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                            {formatPrice(activeVehicle)}
                          </span>
                          <span className="text-xs text-slate-500">/ day</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectVehicle(activeVehicle.id)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer shadow-md"
                      >
                        <span>Select Vehicle</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Mobile Indicator Dots */}
              {filteredVehicles.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {filteredVehicles.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Show vehicle ${idx + 1}`}
                      onClick={() => setActiveVehicleIndex(idx)}
                      className={`transition-all duration-300 rounded-full h-1.5 ${
                        (filteredVehicles[activeVehicleIndex] ? activeVehicleIndex : 0) === idx
                          ? 'w-7 bg-[#FF6B00]'
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ================= DESKTOP VIEW: 3-Column Grid (lg:) ================= */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Vehicle Image */}
                    <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={vehicle.image}
                        alt={vehicle.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-950/70 backdrop-blur-md text-white border border-white/20 shadow-sm">
                          {vehicle.category}
                        </span>
                      </div>
                    </div>

                    {/* Body Details */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[#FF6B00] transition-colors font-heading leading-snug">
                          {vehicle.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 italic">
                          {vehicle.recommendedFor}
                        </p>
                      </div>

                      {/* Capacity Specs */}
                      <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#FF6B00] shrink-0" />
                          <span>{vehicle.passengers}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-600 shrink-0" />
                          <span>{vehicle.luggage}</span>
                        </div>
                      </div>

                      {/* Included Amenities */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs text-slate-400 font-medium block">
                          Vehicle Amenities
                        </span>
                        <ul className="space-y-1">
                          {vehicle.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        With Chauffeur Guide
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900 font-heading">
                          {formatPrice(vehicle)}
                        </span>
                        <span className="text-xs text-slate-500">/ day</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectVehicle(vehicle.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                    >
                      <span>Select Vehicle</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Fleet Page Gateway */}
        <div className="mt-12 text-center">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-xs sm:text-sm font-semibold tracking-wide shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-[0.98]"
          >
            <Car className="w-4 h-4 text-[#FF6B00] group-hover:text-white transition-colors shrink-0" />
            <span>Explore Full Executive Fleet and Chauffeur Services</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
