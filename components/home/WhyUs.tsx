'use client';

import React from 'react';
import { WHY_US_PILLARS } from '@/data/mockData';
import { Compass, Sliders, ShieldCheck, Headphones, CheckCircle } from 'lucide-react';

export default function WhyUs() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-6 h-6 text-[#FF6B00]" />;
      case 'Sliders':
        return <Sliders className="w-6 h-6 text-[#FF6B00]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#FF6B00]" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-[#FF6B00]" />;
      default:
        return <CheckCircle className="w-6 h-6 text-[#FF6B00]" />;
    }
  };

  return (
    <section id="why-us" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
            Why Discerning Travelers Choose <span className="font-semibold text-slate-950">Tripvibe Lanka</span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            We don&apos;t do cookie-cutter mass tourism. We orchestrate private, deeply immersive journeys backed by verified local chauffeurs and 24/7 island concierges.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_US_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl p-8 bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-white hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {getIcon(pillar.iconName)}
                </div>

                <h3 className="text-lg font-semibold text-slate-900 font-heading leading-snug">
                  {pillar.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              {/* Stat Badge */}
              <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 font-heading tracking-tight">
                  {pillar.stat}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {pillar.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
