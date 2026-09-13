'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Currency, FleetVehicle } from '@/types/tourism';
import { FLEET_VEHICLES } from '@/data/mockData';
import { Users, Briefcase, Sparkles, CheckCircle2, ArrowUpRight, Shield } from 'lucide-react';

interface FleetShowcaseProps {
  currency: Currency;
  onSelectVehicle: (vehicleId: string) => void;
}

export default function FleetShowcase({ currency, onSelectVehicle }: FleetShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Sedans' | 'Vans' | 'Mini Buses'>('All');

  const filteredVehicles = selectedCategory === 'All'
    ? FLEET_VEHICLES
    : FLEET_VEHICLES.filter((v) => v.category === selectedCategory);

  const formatPrice = (v: FleetVehicle) => {
    if (currency === 'USD') {
      return `$${v.pricePerDayUSD}`;
    }
    return `Rs. ${v.pricePerDayLKR.toLocaleString()}`;
  };

  return (
    <section id="fleet" className="py-24 bg-slate-50/70 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
              Executive <span className="font-semibold text-slate-950">Private Fleet</span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              All vehicles are late-model, fully air-conditioned, commercially insured, and operated by government-certified English-speaking chauffeurs.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm self-start md:self-auto">
            {(['All', 'Sedans', 'Vans', 'Mini Buses'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles Grid */}
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
      </div>
    </section>
  );
}
