'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  Compass,
  ArrowUpRight,
  PhoneCall,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Tag,
  Maximize2,
} from 'lucide-react';
import { Currency } from '@/types/tourism';

function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${Math.round(amount).toLocaleString()}`;
  }
  return `Rs. ${Math.round(amount).toLocaleString()}`;
}

export interface DestinationItem {
  id: string;
  name: string;
  district?: string | null;
  tag?: string | null;
  best_time_to_visit?: string | null;
  description?: string | null;
  cover_image?: string | null;
  gallery_images?: string[];
  popular_attractions?: string[];
  display_order?: number | null;
}

export interface LinkedTourSummary {
  id: string;
  title: string;
  duration_days: number;
  duration_nights: number;
  price_usd: number;
  price_lkr: number;
  cover_image?: string | null;
  category?: string | null;
}

export interface LinkedActivitySummary {
  id: string;
  title: string;
  location?: string | null;
  duration?: string | null;
  price: number;
  price_lkr?: number;
}

interface DestinationDetailDrawerProps {
  destination: DestinationItem | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  exchangeRate?: number;
  linkedTours: LinkedTourSummary[];
  linkedActivities: LinkedActivitySummary[];
  onOpenBooking: (destName: string, packageId?: string) => void;
  whatsappUrl: string;
}

// Helper to parse attraction strings like "Name - Description" or "Name: Description"
function parseAttraction(raw: string): { title: string; desc?: string } {
  if (!raw) return { title: '' };
  const match = raw.split(/\s*[-:–—]\s*/);
  if (match.length > 1 && match[0].trim() && match[1].trim()) {
    return {
      title: match[0].trim(),
      desc: match.slice(1).join(' - ').trim(),
    };
  }
  return { title: raw.trim() };
}

export default function DestinationDetailDrawer({
  destination,
  isOpen,
  onClose,
  currency,
  exchangeRate = 300,
  linkedTours,
  linkedActivities,
  onOpenBooking,
  whatsappUrl,
}: DestinationDetailDrawerProps) {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (destination?.cover_image) {
      setActiveImage(destination.cover_image);
    }
  }, [destination]);

  // Lock body scroll when drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !destination) return null;

  const allImages = [
    ...(destination.cover_image ? [destination.cover_image] : []),
    ...(Array.isArray(destination.gallery_images) ? destination.gallery_images : []),
  ];

  const currentDisplayImage = activeImage || destination.cover_image || '/placeholder-travel.webp';

  const attractions = Array.isArray(destination.popular_attractions)
    ? destination.popular_attractions.filter((a) => typeof a === 'string' && a.trim().length > 0)
    : [];

  const destWhatsappInquiry = `${whatsappUrl}&text=${encodeURIComponent(
    `Hello Tripvibe Lanka! I am interested in visiting ${destination.name}. Could you advise on a customized private tour?`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Dimmed backdrop blur */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-2xl bg-[#FAF9F6] text-slate-900 shadow-2xl flex flex-col h-full border-l border-stone-200 animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="relative px-6 py-5 bg-white border-b border-stone-200/90 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF6B00]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-heading font-semibold text-[#FF6B00]">
                    Destination Dossier
                  </span>
                  {destination.tag && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      {destination.tag}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                  {destination.name}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close Dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 divide-y divide-stone-200/70">
            {/* Main Visual & Image Gallery */}
            <div className="space-y-3">
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-stone-200 shadow-md group">
                <Image
                  src={currentDisplayImage}
                  alt={destination.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* District badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="text-white space-y-1">
                    <p className="text-xs uppercase tracking-wider text-white/80 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {destination.district || 'Sri Lanka'}
                    </p>
                    <p className="text-lg sm:text-xl font-heading font-bold text-white leading-snug">
                      {destination.name}
                    </p>
                  </div>
                  {destination.best_time_to_visit && (
                    <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white border border-white/20">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{destination.best_time_to_visit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Thumbnails (if multiple images exist) */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        currentDisplayImage === imgUrl
                          ? 'border-[#FF6B00] ring-2 ring-orange-500/20 scale-95'
                          : 'border-stone-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${destination.name} photo ${i + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* In-depth Editorial Description */}
            {destination.description && (
              <div className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-stone-500">
                    About This Sanctuary
                  </h3>
                </div>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-body">
                  {destination.description}
                </p>
              </div>
            )}

            {/* Popular Attractions & Landmarks Breakdown */}
            {attractions.length > 0 && (
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#FF6B00]" />
                    <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-stone-500">
                      Iconic Attractions & Experiences
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100/70 text-[#FF6B00]">
                    {attractions.length} Highlights
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {attractions.map((rawAttraction, idx) => {
                    const { title, desc } = parseAttraction(rawAttraction);
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-xs flex items-start gap-3 hover:border-orange-300 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-orange-50 text-[#FF6B00] border border-orange-200/70 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-heading font-bold text-slate-900">
                            {title}
                          </h4>
                          {desc && (
                            <p className="text-xs text-stone-600 leading-relaxed">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cross-Connected Private Tour Packages */}
            {linkedTours.length > 0 && (
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                    <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-stone-500">
                      Private Tours Visiting {destination.name}
                    </h3>
                  </div>
                  <Link
                    href="/tours"
                    className="text-xs font-semibold text-[#FF6B00] hover:underline flex items-center gap-1"
                  >
                    <span>View all packages</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {linkedTours.map((tour) => {
                    const priceFormatted = formatCurrency(
                      currency === 'USD' ? tour.price_usd : tour.price_lkr,
                      currency
                    );
                    return (
                      <div
                        key={tour.id}
                        className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-orange-300 transition-all"
                      >
                        <div className="space-y-1.5 max-w-sm">
                          <div className="flex items-center gap-2">
                            {tour.category && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {tour.category}
                              </span>
                            )}
                            <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {tour.duration_days} Days / {tour.duration_nights} Nights
                            </span>
                          </div>
                          <h4 className="text-sm font-heading font-bold text-slate-900 leading-snug">
                            {tour.title}
                          </h4>
                          <p className="text-xs text-stone-600 font-medium">
                            Starting from <span className="font-bold text-slate-900">{priceFormatted}</span> / person
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Link
                            href={`/tours`}
                            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-full text-xs font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors text-center"
                          >
                            Explore Itinerary
                          </Link>
                          <button
                            type="button"
                            onClick={() => onOpenBooking(destination.name, tour.id)}
                            className="flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-semibold bg-[#FF6B00] text-white hover:bg-[#E55F00] shadow-sm transition-all text-center cursor-pointer"
                          >
                            Reserve Tour
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cross-Connected Signature Activities */}
            {linkedActivities.length > 0 && (
              <div className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-stone-500">
                    Signature Experiences in {destination.name}
                  </h3>
                </div>

                <div className="space-y-2">
                  {linkedActivities.map((act) => {
                    const priceFormatted = formatCurrency(
                      currency === 'USD' ? act.price : act.price_lkr || act.price * exchangeRate,
                      currency
                    );
                    return (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-heading font-semibold text-slate-900 text-sm">
                            {act.title}
                          </p>
                          {act.duration && (
                            <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {act.duration}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{priceFormatted}</p>
                          <span className="text-[10px] text-stone-400">per person</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Drawer Footer CTAs */}
          <div className="p-5 bg-white border-t border-stone-200/90 shrink-0 shadow-lg space-y-2.5">
            <button
              onClick={() => onOpenBooking(destination.name)}
              className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] active:scale-[0.99] transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Plan a Private Tour to {destination.name}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <a
              href={destWhatsappInquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors flex items-center justify-center gap-2 text-center"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ask Chauffeur Concierge About {destination.name} (WhatsApp 24/7)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
