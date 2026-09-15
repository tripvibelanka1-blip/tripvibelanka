'use client';

import React from 'react';
import { Search, X, Sparkles, Compass, ShieldCheck, Clock } from 'lucide-react';

interface ExperiencesHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
  totalExperiences: number;
}

const CATEGORIES = [
  'All Categories',
  'Adventure & Trekking',
  'Wildlife & Nature',
  'Cultural Heritage',
  'Ocean & Coastal',
];

export default function ExperiencesHero({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  totalExperiences,
}: ExperiencesHeroProps) {
  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-10 sm:pb-14 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[540px] max-w-[90vw] h-[340px] bg-gradient-to-tr from-amber-200/30 via-orange-100/25 to-emerald-100/30 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="text-center space-y-6 max-w-4xl mx-auto">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-stone-200/90 text-stone-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
          <span className="font-heading tracking-wide uppercase text-[11px] text-stone-600">
            Curated Island Excursions · {totalExperiences} Handcrafted Activities
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-slate-900 tracking-tight leading-[1.15]">
          Signature Sri Lankan <span className="text-[#FF6B00]">Experiences</span>
        </h1>

        {/* Subtitle (NO em-dash) */}
        <p className="text-stone-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-body leading-relaxed">
          Immersive activities designed to elevate your private journey. From sunrise hot air balloon flights above ancient citadels to private tea plantation tastings and coastal wildlife encounters.
        </p>

        {/* Search & Category Filter Bar */}
        <div className="pt-2 max-w-2xl mx-auto space-y-4">
          {/* Search Input Box */}
          <div className="relative flex items-center bg-white rounded-full border border-stone-300 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all px-4 py-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search experiences by name, location, or vibe (e.g., Sigiriya, Balloon, Safari)..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust Credential Strip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-stone-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Private &amp; Handpicked Guides</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Flexible Unhurried Timing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Fully Licensed &amp; Insured</span>
          </div>
        </div>
      </div>
    </section>
  );
}
