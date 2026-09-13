'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Currency, TourPackage } from '@/types/tourism';
import { TOUR_PACKAGES } from '@/data/mockData';
import { useCurrency } from '@/context/CurrencyContext';
import { Clock, Star, MapPin, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';

interface TourPackagesProps {
  currency: Currency;
  onSelectPackage: (packageId: string) => void;
}

export default function TourPackages({ currency, onSelectPackage }: TourPackagesProps) {
  const { exchangeRate } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Cultural', 'Wildlife', 'Coastal', 'Hill Country'];

  const filteredPackages = selectedCategory === 'All'
    ? TOUR_PACKAGES
    : TOUR_PACKAGES.filter((p) => p.category === selectedCategory || (selectedCategory === 'Cultural' && p.category === 'Signature'));

  const formatPrice = (pkg: TourPackage) => {
    if (currency === 'USD') {
      return `$${pkg.priceUSD.toLocaleString()}`;
    }
    const lkr = Math.round(pkg.priceUSD * exchangeRate);
    return `Rs. ${lkr.toLocaleString()}`;
  };

  return (
    <section id="tours" className="py-24 bg-slate-50/60 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
              Signature <span className="font-semibold text-slate-950">Private Tour Packages</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Every package is 100% private and customizable. Enjoy executive vehicle transport, certified chauffeur guides, and handpicked luxury stays.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B00] text-white shadow-sm shadow-orange-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tour Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Container - Clean photography without noisy text overlays */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Single Discreet Top Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-950/70 backdrop-blur-md text-white border border-white/20 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {pkg.duration}
                    </span>
                  </div>

                  {pkg.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B00] text-white shadow-sm">
                        Curated
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  {/* Locations Row */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{pkg.locations.join(' · ')}</span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[#FF6B00] transition-colors leading-snug">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Highlights Bullets */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <ul className="space-y-1.5">
                      {pkg.highlights.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer: Price & CTA */}
              <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Starting From
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                      {formatPrice(pkg)}
                    </span>
                    <span className="text-xs text-slate-500">/ person</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPackage(pkg.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <span>Reserve Tour</span>
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
