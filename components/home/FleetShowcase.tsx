'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Currency, FleetVehicle } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/utils/supabase/client';
import { Users, Briefcase, CheckCircle2, ArrowUpRight, Loader2, Car } from 'lucide-react';

interface FleetShowcaseProps {
  currency: Currency;
  onSelectVehicle: (vehicleId: string) => void;
}

export default function FleetShowcase({ currency, onSelectVehicle }: FleetShowcaseProps) {
  const { exchangeRate } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Sedans' | 'Vans' | 'Mini Buses'>('All');
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          // Vehicles Grid
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        )}
      </div>
    </section>
  );
}
