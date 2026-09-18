'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  MessageCircle,
  Car,
} from 'lucide-react';
import { Currency } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';

export interface TourDetailItem {
  id: string;
  title: string;
  category: string;
  tagline: string;
  duration: string;
  duration_days: number;
  duration_nights: number;
  image: string;
  gallery_images: string[];
  locations: string[];
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: { day: number; title: string; details: string }[];
  priceUSD: number;
  priceLKR: number;
  featured?: boolean;
}

interface TourDetailDrawerProps {
  tour: TourDetailItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTour: (tourId: string) => void;
  currency: Currency;
}

export default function TourDetailDrawer({
  tour,
  isOpen,
  onClose,
  onBookTour,
  currency,
}: TourDetailDrawerProps) {
  const { exchangeRate } = useCurrency();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tour) return null;

  const formatPrice = (usd: number, lkr: number) => {
    if (currency === 'USD') {
      return `$${usd.toLocaleString()}`;
    }
    const finalLkr = lkr > 0 ? lkr : Math.round(usd * (exchangeRate || 310));
    return `Rs. ${finalLkr.toLocaleString()}`;
  };

  const cleanWhatsappNumber = '94761560046';
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    `Hello Tripvibe Lanka! I am interested in customizing the "${tour.title}" tour package (${tour.duration}). Could you share more details?`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF6B00] border border-orange-200/80">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tour.category} Private Circuit</span>
              </span>
              {tour.featured && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Curated
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close itinerary preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Cover Hero Photo */}
            <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/80">
              <Image
                src={tour.image}
                alt={tour.title}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md border border-white/20">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{tour.duration}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md border border-white/20">
                  <Car className="w-3.5 h-3.5 text-orange-400" />
                  <span>Private AC Vehicle &amp; Guide</span>
                </span>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span className="text-slate-700 font-semibold">{tour.locations.join(' → ')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading leading-snug">
                {tour.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {tour.tagline}
              </p>
            </div>

            {/* Pricing Card Strip */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 font-medium block">All-Inclusive Starting Rate</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading">
                    {formatPrice(tour.priceUSD, tour.priceLKR)}
                  </span>
                  <span className="text-xs text-slate-500">/ traveler</span>
                </div>
              </div>

              <div className="space-y-1 sm:text-right text-xs text-slate-600">
                <div className="flex items-center sm:justify-end gap-1.5 font-semibold text-emerald-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>20% Advance · 80% on Arrival</span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  100% Customizable Private Departure
                </span>
              </div>
            </div>

            {/* Highlights Section */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="space-y-3.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading">
                  Tour Highlights
                </h3>
                <ul className="grid grid-cols-1 gap-2.5">
                  {tour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Day-by-Day Itinerary Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading">
                  Day-by-Day Detailed Itinerary
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {tour.itinerary?.length || tour.duration_days} Days Planned
                </span>
              </div>

              {tour.itinerary && tour.itinerary.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-orange-200">
                  {tour.itinerary.map((item, index) => (
                    <div key={index} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-[#FF6B00] flex items-center justify-center shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs group-hover:border-orange-300 transition-colors space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-[#FF6B00]">
                            Day {item.day || index + 1}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">
                    Day-by-day stops are flexibly customized to your flight arrival time and preferences.
                  </p>
                </div>
              )}
            </div>

            {/* Inclusions & Exclusions Grid */}
            {((tour.included && tour.included.length > 0) || (tour.excluded && tour.excluded.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Inclusions */}
                {tour.included && tour.included.length > 0 && (
                  <div className="p-4.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-heading flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      What’s Included
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {tour.included.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exclusions */}
                {tour.excluded && tour.excluded.length > 0 && (
                  <div className="p-4.5 rounded-2xl bg-rose-50/30 border border-rose-200/70 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800 font-heading flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      What’s Excluded
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {tour.excluded.map((exc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-5 sm:p-6 border-t border-slate-100 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask Concierge on WhatsApp</span>
            </a>

            <Link
              href={`/booking?package=${tour.id}`}
              onClick={onClose}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Reserve This Tour</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
