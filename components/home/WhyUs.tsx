'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Sliders,
  ShieldCheck,
  Headphones,
  Users,
  UtensilsCrossed,
  Star,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  MessageCircle,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

interface WhyUsProps {
  onOpenBooking?: () => void;
}

// Official TripAdvisor SVG Icon
function TripAdvisorIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Tripadvisor">
      <path d="M19.34 7.15c-1.22 0-2.31.5-3.1 1.3a7.48 7.48 0 0 0-8.48 0c-.79-.8-1.88-1.3-3.1-1.3C2.08 7.15.5 8.73.5 10.69c0 1.96 1.58 3.54 3.54 3.54.34 0 .66-.05.97-.14a7.46 7.46 0 0 0 13.98 0c.31.09.63.14.97.14 1.96 0 3.54-1.58 3.54-3.54 0-1.96-1.58-3.54-3.54-3.54zM4.04 12.83c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14zm7.96 3.86a5.97 5.97 0 0 1-5.69-4.14c.54-.38 1.16-.65 1.83-.78a4.13 4.13 0 0 1 7.72 0c.67.13 1.29.4 1.83.78a5.97 5.97 0 0 1-5.69 4.14zm7.96-3.86c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14z" />
      <circle cx="4.04" cy="10.69" r="1.1" />
      <circle cx="19.96" cy="10.69" r="1.1" />
      <circle cx="12" cy="7.2" r="1" />
    </svg>
  );
}

const TRIPADVISOR_URL =
  'https://www.tripadvisor.com/Attraction_Review-g293962-d33287122-Reviews-Trip_Vibe_Lanka-Colombo_Western_Province.html';

const WHY_US_PILLARS = [
  {
    icon: Sliders,
    title: '100% Tailored Private Routes',
    description:
      'Zero rigid packages. Every itinerary is customized to your preferred pace, stops, interests, and dietary wishes.',
    stat: 'Bespoke',
    statLabel: 'Private Design',
  },
  {
    icon: Compass,
    title: 'Native Island Insights',
    description:
      'Chauffeur guides who grew up on the island, uncovering hidden viewpoints, secluded waterfalls, and authentic local life.',
    stat: '100%',
    statLabel: 'Local Experts',
  },
  {
    icon: ShieldCheck,
    title: 'Executive Fleet Comfort',
    description:
      'Modern air-conditioned Toyota and luxury vehicles with chilled bottled water, pristine cleanliness, and comprehensive insurance.',
    stat: '5-Star',
    statLabel: 'Vehicle Comfort',
  },
  {
    icon: Headphones,
    title: '24/7 Island Concierge',
    description:
      'Dedicated travel manager on WhatsApp from your arrival touchdown in Colombo to your departure gate farewell.',
    stat: '24/7',
    statLabel: 'Always Available',
  },
];

export default function WhyUs({ onOpenBooking }: WhyUsProps) {
  return (
    <section id="why-us" className="py-24 bg-slate-50/60 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF6B00] border border-orange-200/60">
            <TripAdvisorIcon className="w-3.5 h-3.5 fill-[#FF6B00]" />
            <span>Why Tripvibe Lanka</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
            Why Discerning Travelers Choose <span className="font-semibold text-slate-950">Tripvibe Lanka</span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            The best trips are not planned around landmarks, they are built around people. We orchestrate private,
            unhurried journeys backed by native chauffeurs and around the clock support.
          </p>
        </div>

        {/* Story & Team Feature Card (Merged About Narrative) */}
        <div className="mb-12 rounded-3xl p-8 sm:p-10 bg-white border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Story & Team */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                <Users className="w-4 h-4" />
                <span>Our Story and The Team</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading tracking-tight leading-snug">
                We Do Not Just Show You Sri Lanka. We Let You Feel It.
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Tripvibe Lanka was born from a frustration with cookie-cutter tours and overcrowded bus routes that rush
                you past the things that actually matter. We are a small, dedicated collective of guides, chauffeurs, and
                travel planners who grew up here.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Luca, Mishal, Abdul</strong>, and the wider Tripvibe
                family are the people you will actually meet. Not an anonymous call center. When you travel with us, you
                travel with trusted local companions who genuinely care whether you are having the time of your life.
                As our guests say: <span className="italic text-slate-800 font-medium">&quot;Started as drivers, ended as friends.&quot;</span>
              </p>

              {/* Halal-Friendly Differentiator Badge */}
              <div className="pt-2 flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-950">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-900 block">Halal-Friendly Hospitality Available</span>
                  <span className="text-emerald-800/80">
                    Certified halal dining stops and prayer-friendly schedules seamlessly arranged upon request.
                  </span>
                </div>
              </div>

              {/* Read More button to full About Us page */}
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#FF6B00] text-white font-semibold text-xs transition-all duration-200 shadow-xs hover:shadow group"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* TripAdvisor 5.0 Proof & Quick Action */}
            <div className="lg:col-span-5 flex flex-col gap-4 p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <TripAdvisorIcon className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-slate-900 font-heading">Tripadvisor</span>
                      <div className="flex text-emerald-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-emerald-500" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">5.0 Rating · 7 Verified Reviews</span>
                  </div>
                </div>

                <a
                  href={TRIPADVISOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group/link"
                >
                  <span>Verify</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </a>
              </div>

              <div className="space-y-2 py-1">
                <div className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;A real journey out of time. Away from mass tourism, total immersion in the real Sri Lanka. Luca and Micha were extraordinary.&rdquo;
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Reviewed on Tripadvisor by Esmablb (Couples Tour)
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://wa.me/94775368357?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20plan%20a%20private%20tour."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Chat: 077 536 8357</span>
                </a>

                {onOpenBooking && (
                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#FF6B00] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Custom Itinerary</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_US_PILLARS.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl p-8 bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B00] group-hover:scale-110 transition-transform duration-300">
                    <IconComp className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 font-heading leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Stat Badge */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900 font-heading tracking-tight">
                    {pillar.stat}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {pillar.statLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Read More under Why Us section */}
        <div className="mt-12 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-xs sm:text-sm font-semibold tracking-wide shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-[0.98]"
          >
            <Users className="w-4 h-4 text-[#FF6B00] group-hover:text-white transition-colors shrink-0" />
            <span>Read More About Our Story &amp; The Team</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
