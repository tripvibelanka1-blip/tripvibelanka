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
    <section className="relative pt-2 sm:pt-6 pb-6 sm:pb-12 max-w-5xl mx-auto text-center px-4 sm:px-6">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[300px] bg-gradient-to-tr from-amber-200/30 via-orange-100/20 to-emerald-100/25 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Hero Stack (Eyebrow, Headline, Subtext, CTAs) */}
      <div className="space-y-4 sm:space-y-5">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold bg-white border border-stone-200/90 text-stone-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
          <span className="font-heading tracking-wide uppercase text-[10px] sm:text-[11px] text-stone-600">
            Handcrafted Ceylon Itineraries
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading leading-tight">
          Signature Private{' '}
          <span className="font-semibold text-slate-950 block sm:inline">
            Tour Packages
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          Every itinerary is 100% private, flexible, and accompanied by certified native chauffeur guides and handpicked boutique stays.
        </p>

        {/* CTAs */}
        <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#FF6B00] hover:bg-[#E55F00] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <span>Plan Custom Itinerary</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 text-slate-800 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Chat with Concierge 24/7</span>
          </a>
        </div>
      </div>

      {/* Trust Credentials Strip (Directly under Hero) */}
      <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-left">
        <a
          href={tripadvisorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-500/60 hover:shadow-xs transition-all group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <TripAdvisorIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                5.0 on Tripadvisor
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 truncate">100% 5-Star Reviews</span>
          </div>
        </a>

        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-50 border border-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
            <Car className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">Private Chauffeur Fleet</span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 truncate">Air-Conditioned &amp; Unhurried</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">Halal-Friendly Hospitality</span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 truncate">Pre-vetted Dining &amp; Privacy</span>
          </div>
        </div>
      </div>
    </section>
  );
}
