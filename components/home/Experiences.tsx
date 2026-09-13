'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Currency, Experience } from '@/types/tourism';
import { EXPERIENCES } from '@/data/mockData';
import { useCurrency } from '@/context/CurrencyContext';
import { ChevronLeft, ChevronRight, Clock, MapPin, Sparkles, Plus } from 'lucide-react';

interface ExperiencesProps {
  currency: Currency;
  onSelectExperience: (exp: Experience) => void;
}

export default function Experiences({ currency, onSelectExperience }: ExperiencesProps) {
  const { exchangeRate } = useCurrency();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatPrice = (exp: Experience) => {
    if (currency === 'USD') {
      return `$${exp.priceUSD}`;
    }
    const lkr = Math.round(exp.priceUSD * exchangeRate);
    return `Rs. ${lkr.toLocaleString()}`;
  };

  return (
    <section id="experiences" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
            Bespoke <span className="font-semibold text-slate-950">Island Experiences</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Add private excursions to any tour package: from midnight leopard game drives to sunrise whale watching charters.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'border-slate-300 text-slate-800 hover:bg-slate-100 active:scale-95 cursor-pointer'
                : 'border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
            aria-label="Previous Experiences"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
              canScrollRight
                ? 'border-slate-300 text-slate-800 hover:bg-slate-100 active:scale-95 cursor-pointer'
                : 'border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
            aria-label="Next Experiences"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Slider (snap-x mandatory) */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 pt-2 snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6"
      >
        {EXPERIENCES.map((exp) => (
          <div
            key={exp.id}
            className="snap-start shrink-0 w-[85vw] sm:w-[340px] lg:w-[360px] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 640px) 85vw, 360px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-950/70 backdrop-blur-md text-white border border-white/20 shadow-sm">
                    {exp.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-white/90 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{exp.location}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>{exp.duration}</span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                  {exp.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {exp.description}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Per Traveler
                </span>
                <span className="text-lg font-bold text-slate-900 font-heading">
                  {formatPrice(exp)}
                </span>
              </div>

              <button
                onClick={() => onSelectExperience(exp)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-[#FF6B00] hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Journey</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
