'use client';

import React from 'react';
import {
  Sparkles,
  ArrowUpRight,
  MessageCircle,
  ShieldCheck,
  Star,
  Car,
  UtensilsCrossed,
} from 'lucide-react';

interface ToursHeroProps {
  onOpenBooking: () => void;
  whatsappUrl: string;
  tripadvisorUrl: string;
}

// Official TripAdvisor SVG Icon
function TripAdvisorIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Tripadvisor">
      <path d="M19.34 7.15c-1.22 0-2.31.5-3.1 1.3a7.48 7.48 0 0 0-8.48 0c-.79-.8-1.88-1.3-3.1-1.3C2.08 7.15.5 8.73.5 10.69c0 1.96 1.58 3.54 3.54 3.54.34 0 .66-.05.97-.14a7.46 7.46 0 0 0 13.98 0c.31.09.63.14.97.14 1.96 0 3.54-1.58 3.54-3.54 0-1.96-1.58-3.54-3.54-3.54zM4.04 12.83c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14zm7.96 3.86a5.97 5.97 0 0 1-5.69-4.14c.54-.38 1.16-.65 1.83-.78a4.13 4.13 0 0 1 7.72 0c.67.13 1.29.4 1.83.78a5.97 5.97 0 0 1-5.69 4.14zm7.96-3.86c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14z" />
      <circle cx="4.04" cy="10.69" r="1.1" />
      <circle cx="19.96" cy="10.69" r="1.1" />
      <circle cx="12" cy="7.2" r="1" />
    </svg>
  );
}

export default function ToursHero({
  onOpenBooking,
  whatsappUrl,
  tripadvisorUrl,
}: ToursHeroProps) {
  return (
    <section className="relative pt-2 sm:pt-6 pb-4 sm:pb-8 max-w-4xl mx-auto text-center px-4 sm:px-6 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] max-w-[90vw] h-[260px] bg-gradient-to-tr from-amber-200/30 via-orange-100/20 to-emerald-100/25 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Hero Stack (Eyebrow, Headline, Subtext, CTAs) */}
      <div className="space-y-4 sm:space-y-5">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-stone-200/90 text-stone-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
          <span className="font-heading tracking-wide uppercase text-[10px] sm:text-[11px] text-stone-600">
            Handcrafted Ceylon Itineraries
          </span>
        </div>

        {/* Majestic Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 font-heading leading-[1.15]">
          Signature Private <span className="text-[#FF6B00]">Tour Packages</span>
        </h1>

        {/* Subhead */}
        <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
          Every itinerary is 100% private, flexible, and accompanied by certified native chauffeur guides and handpicked boutique stays.
        </p>

        {/* Proportional CTAs */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          <button
            type="button"
            onClick={onOpenBooking}
            className="px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-[#FF6B00] hover:bg-[#E55F00] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5 group"
          >
            <span>Plan Custom Itinerary</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 text-slate-700 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-2xs active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat with Concierge</span>
          </a>
        </div>

        {/* Refined Trust Credentials Micro-Strip */}
        <div className="pt-2 sm:pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
          <a
            href={tripadvisorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs hover:border-emerald-500/60 transition-all text-slate-800 hover:text-emerald-700 font-semibold text-[11px] sm:text-xs"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <TripAdvisorIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
            </div>
            <span>5.0 on TripAdvisor (100% 5-Star)</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </a>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs text-slate-700 font-medium text-[11px] sm:text-xs">
            <Car className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Private Chauffeur Fleet</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs text-slate-700 font-medium text-[11px] sm:text-xs">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Halal-Friendly Options</span>
          </div>
        </div>
      </div>
    </section>
  );
}
