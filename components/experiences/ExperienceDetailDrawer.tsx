'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  Compass,
  ArrowUpRight,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { Currency } from '@/types/tourism';

export interface ExperienceItem {
  id: string;
  title: string;
  destination_id?: string | null;
  location?: string | null;
  duration?: string | null;
  category?: string | null;
  price: number;
  price_lkr?: number;
  description?: string | null;
  cover_image?: string | null;
  gallery_images?: string[];
  is_active: boolean;
  destination?: {
    id: string;
    name: string;
    district?: string | null;
  } | null;
}

export interface LinkedTourMini {
  id: string;
  title: string;
  duration_days: number;
  duration_nights: number;
  price_usd: number;
  price_lkr: number;
}

interface ExperienceDetailDrawerProps {
  experience: ExperienceItem | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  exchangeRate?: number;
  linkedTours: LinkedTourMini[];
  onOpenBooking: (addonId: string, location?: string) => void;
  whatsappUrl: string;
}

function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${Math.round(amount).toLocaleString()}`;
  }
  return `Rs. ${Math.round(amount).toLocaleString()}`;
}

export default function ExperienceDetailDrawer({
  experience,
  isOpen,
  onClose,
  currency,
  exchangeRate = 300,
  linkedTours,
  onOpenBooking,
  whatsappUrl,
}: ExperienceDetailDrawerProps) {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (experience?.cover_image) {
      setActiveImage(experience.cover_image);
    }
  }, [experience]);

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

  if (!isOpen || !experience) return null;

  const allImages = [
    ...(experience.cover_image ? [experience.cover_image] : []),
    ...(Array.isArray(experience.gallery_images) ? experience.gallery_images : []),
  ];

  const currentDisplayImage = activeImage || experience.cover_image || '/placeholder-travel.webp';

  const priceNum = currency === 'USD' ? experience.price : (experience.price_lkr || experience.price * exchangeRate);
  const formattedPrice = formatCurrency(priceNum, currency);

  const expWhatsappInquiry = `${whatsappUrl}&text=${encodeURIComponent(
    `Hello Tripvibe Lanka! I am interested in booking the "${experience.title}" experience in ${experience.location || 'Sri Lanka'}. Could you provide availability and details?`
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
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-heading font-semibold text-[#FF6B00]">
                    Experience Dossier
                  </span>
                  {experience.category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      {experience.category}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                  {experience.title}
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
            {/* Visual Header & Gallery */}
            <div className="space-y-3">
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-stone-200 shadow-md group">
                <Image
                  src={currentDisplayImage}
                  alt={experience.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Overlay Badges */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="text-white space-y-1">
                    <p className="text-xs uppercase tracking-wider text-white/80 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {experience.location || experience.destination?.name || 'Sri Lanka'}
                    </p>
                    <p className="text-lg sm:text-xl font-heading font-bold text-white leading-snug">
                      {experience.title}
                    </p>
                  </div>
                  {experience.duration && (
                    <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white border border-white/20">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{experience.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Thumbnails */}
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
                        alt={`${experience.title} photo ${i + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Duration Quick Summary Card */}
            <div className="pt-6">
              <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
                    Starting Investment
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-heading text-slate-900">
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-stone-600">/ person</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
                    Estimated Duration
                  </span>
                  <span className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    {experience.duration || 'Flexible Excursion'}
                  </span>
                </div>
              </div>
            </div>

            {/* In-depth Editorial Description */}
            {experience.description && (
              <div className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-stone-600">
                    About This Experience
                  </h3>
                </div>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-body">
                  {experience.description}
                </p>
              </div>
            )}

            {/* Included Guarantees Strip */}
            <div className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-stone-600">
                  Included With Every Private Experience
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700">
                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Certified Local Specialist Guide</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Private Air-Conditioned Vehicle Transfer</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>100% Unhurried & Flexible Timing</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Safety Briefing & Equipment Provided</span>
                </div>
              </div>
            </div>

            {/* Linked Destination Cross-Reference */}
            {experience.destination && (
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-stone-600">
                      Host Destination
                    </h3>
                  </div>
                  <Link
                    href="/destinations"
                    className="text-xs font-semibold text-[#FF6B00] hover:underline flex items-center gap-1"
                  >
                    <span>View Destination Guide</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs text-stone-600 font-medium">
                      {experience.destination.district || 'Sri Lanka'}
                    </span>
                    <h4 className="text-base font-heading font-bold text-slate-900">
                      {experience.destination.name}
                    </h4>
                  </div>
                  <Link
                    href="/destinations"
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-stone-300 text-stone-800 hover:bg-stone-50 transition-colors"
                  >
                    Explore Region
                  </Link>
                </div>
              </div>
            )}

            {/* Cross-Connected Private Tour Packages */}
            {linkedTours.length > 0 && (
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#FF6B00]" />
                    <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-stone-600">
                      Tours Visiting This Region
                    </h3>
                  </div>
                  <Link
                    href="/tours"
                    className="text-xs font-semibold text-[#FF6B00] hover:underline flex items-center gap-1"
                  >
                    <span>All Tours</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {linkedTours.map((tour) => {
                    const priceFormatted = formatCurrency(
                      currency === 'USD' ? tour.price_usd : tour.price_lkr,
                      currency
                    );
                    return (
                      <div
                        key={tour.id}
                        className="p-3.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-heading font-bold text-slate-900 text-sm">
                            {tour.title}
                          </p>
                          <p className="text-stone-600 text-[11px] mt-0.5">
                            {tour.duration_days} Days / {tour.duration_nights} Nights · From {priceFormatted}
                          </p>
                        </div>
                        <Link
                          href="/tours"
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                        >
                          View Tour
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Drawer Footer CTAs */}
          <div className="p-5 bg-white border-t border-stone-200/90 shrink-0 shadow-lg space-y-2.5">
            <Link
              href={`/booking?addon=${experience.id}${
                experience.location || experience.destination?.name
                  ? `&destination=${encodeURIComponent(experience.location || experience.destination?.name || '')}`
                  : ''
              }`}
              onClick={onClose}
              className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] active:scale-[0.99] transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Add This Experience to Custom Itinerary</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <a
              href={expWhatsappInquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors flex items-center justify-center gap-2 text-center"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inquire on WhatsApp (24/7 Availability)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
