'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { Currency } from '@/types/tourism';
import { ExperienceItem } from './ExperienceDetailDrawer';

interface ExperienceCardProps {
  experience: ExperienceItem;
  currency: Currency;
  exchangeRate?: number;
  onOpenDrawer: (experience: ExperienceItem) => void;
  onOpenBooking: (addonId: string, location?: string) => void;
}

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80';

function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${Math.round(amount).toLocaleString()}`;
  }
  return `Rs. ${Math.round(amount).toLocaleString()}`;
}

export default function ExperienceCard({
  experience,
  currency,
  exchangeRate = 300,
  onOpenDrawer,
  onOpenBooking,
}: ExperienceCardProps) {
  const coverUrl = experience.cover_image?.trim() || DEFAULT_COVER;
  const priceNum =
    currency === 'USD'
      ? experience.price
      : experience.price_lkr || experience.price * exchangeRate;
  const formattedPrice = formatCurrency(priceNum, currency);
  const locationText = experience.location || experience.destination?.name || 'Sri Lanka';

  return (
    <article className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-orange-200/80 transition-all duration-300">
      {/* Visual Cover Header */}
      <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-stone-100">
        <Image
          src={coverUrl}
          alt={experience.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2">
          {experience.category ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-stone-800 shadow-xs border border-white/40">
              <Sparkles className="w-3 h-3 text-[#FF6B00]" />
              <span>{experience.category}</span>
            </span>
          ) : (
            <span />
          )}

          {experience.duration && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>{experience.duration}</span>
            </span>
          )}
        </div>

        {/* Bottom Image Overlay Text */}
        <div className="absolute bottom-4 inset-x-4 space-y-1 text-white">
          <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </p>
          <h3 className="text-xl sm:text-2xl font-bold font-heading leading-snug drop-shadow-xs">
            {experience.title}
          </h3>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          {/* Editorial Excerpt */}
          {experience.description && (
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
              {experience.description}
            </p>
          )}

          {/* Pricing & Duration Row */}
          <div className="pt-2 flex items-baseline justify-between border-t border-stone-100">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-600 block">
                Starting From
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-heading text-slate-900">
                  {formattedPrice}
                </span>
                <span className="text-xs text-stone-600">/ person</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200/70 inline-block">
                Private Activity
              </span>
            </div>
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="pt-4 border-t border-stone-100 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenDrawer(experience)}
            className="flex-1 py-2.5 px-3 rounded-full text-xs font-semibold border border-stone-300 hover:border-stone-400 text-stone-800 bg-white hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <span>Details</span>
          </button>

          <Link
            href={`/booking?addon=${experience.id}${locationText ? `&destination=${encodeURIComponent(locationText)}` : ''}`}
            className="flex-1 py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] shadow-sm shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>Add to Journey</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
