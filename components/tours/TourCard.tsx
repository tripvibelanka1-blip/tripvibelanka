'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  Eye,
  Car,
} from 'lucide-react';
import { Currency } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';
import { TourDetailItem } from './TourDetailDrawer';

interface TourCardProps {
  tour: TourDetailItem;
  currency: Currency;
  onOpenDrawer: (tour: TourDetailItem) => void;
  onBookTour: (tourId: string) => void;
}

export default function TourCard({
  tour,
  currency,
  onOpenDrawer,
  onBookTour,
}: TourCardProps) {
  const { exchangeRate } = useCurrency();

  const formatPrice = (usd: number, lkr: number) => {
    if (currency === 'USD') {
      return `$${usd.toLocaleString()}`;
    }
    const finalLkr = lkr > 0 ? lkr : Math.round(usd * (exchangeRate || 310));
    return `Rs. ${finalLkr.toLocaleString()}`;
  };

  return (
    <article className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Media Preview */}
        <div
          className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 cursor-pointer"
          onClick={() => onOpenDrawer(tour)}
        >
          <Image
            src={tour.image}
            alt={tour.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-950/75 backdrop-blur-md text-white border border-white/20 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{tour.duration}</span>
            </span>
          </div>

          <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 border border-white/50 shadow-xs">
              {tour.category}
            </span>
          </div>

          {/* Quick Hover Preview Pill */}
          <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-950 shadow-md">
              <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Inspect Itinerary</span>
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Route Locations */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
            <span className="font-medium text-slate-700 truncate">
              {tour.locations && tour.locations.length > 0
                ? tour.locations.join(' · ')
                : 'All Island Circuit'}
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-1 sm:space-y-1.5">
            <h3
              onClick={() => onOpenDrawer(tour)}
              className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors leading-snug font-heading cursor-pointer"
            >
              {tour.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
              {tour.tagline}
            </p>
          </div>

          {/* Key Highlights Checklist (Top 3) */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2">
              <ul className="space-y-1 sm:space-y-1.5">
                {tour.highlights.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chauffeur Fleet Assurance Pill */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <Car className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">Private Executive Chauffeur &amp; AC Vehicle</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Starting Price & Dual Actions */}
      <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Starting From
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                {formatPrice(tour.priceUSD, tour.priceLKR)}
              </span>
              <span className="text-xs text-slate-500">/ person</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            100% Private
          </span>
        </div>

        {/* Dual Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenDrawer(tour)}
            className="w-full py-3 sm:py-2.5 px-3 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <span>Itinerary</span>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <Link
            href={`/booking?package=${tour.id}`}
            className="w-full py-3 sm:py-2.5 px-3 rounded-full text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] shadow-sm shadow-orange-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
          >
            <span>Reserve</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
