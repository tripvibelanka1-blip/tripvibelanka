'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface HeroProps {
  onOpenBooking: (packageId?: string) => void;
}

const HERO_EXPERIENCES = [
  {
    id: 'sigiriya-climb',
    title: 'Sigiriya Citadel',
    subtitle: 'Dawn climb over the ancient rock fortress',
    image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'yala-safari',
    title: 'Yala Leopard Safari',
    subtitle: 'Wild game tracking in open-top 4x4s',
    image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ella-ridge',
    title: 'Ella Cloud Ridge',
    subtitle: 'Misty tea peaks & Nine Arch Bridge',
    image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mirissa-sunrise',
    title: 'Mirissa Sunrise',
    subtitle: 'Coconut Tree Hill & ocean whale waters',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
  },
];

export default function Hero({ onOpenBooking }: HeroProps) {
  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col justify-between pt-28 sm:pt-32 pb-8 sm:pb-10 overflow-hidden bg-slate-950 rounded-b-2xl sm:rounded-b-3xl md:rounded-b-[32px]">
      {/* Background Image: Mirissa Sunset / Ceylon Landscape */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.jpg"
          alt="Sri Lanka Sunrise & Luxury Private Tours"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
        {/* Subtle Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/20 to-slate-950/75" />
      </div>

      {/* 3. Background Gradient & Fog Effect: Soft bottom fog overlay behind the cards */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none z-0" />

      {/* 1. Hero Centered Header & Typography */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Small frosted glass pill badge above the main title */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wide mb-6 shadow-sm">
          <span>Sri Lanka&apos;s Natural Wonder</span>
        </div>

        {/* Main Title H1: Centered, Light Weight, Generous Tracking */}
        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-4 leading-tight font-heading drop-shadow-md">
          Unforgettable Sri Lankan <br className="hidden sm:inline" />
          Sunrise &amp; Private Tours
        </h1>
      </div>

      {/* 2. Bottom Floating Experience Cards (Centered & Responsive) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-start sm:justify-center overflow-x-auto pb-6 sm:pb-8 pt-4 px-4 sm:px-6 hide-scrollbar gap-4 mt-auto snap-x snap-mandatory">
        {HERO_EXPERIENCES.map((exp) => (
          <div
            key={exp.id}
            onClick={() => onOpenBooking(exp.id)}
            className="w-[210px] h-[290px] sm:w-[230px] sm:h-[320px] md:w-[250px] md:h-[340px] rounded-3xl shrink-0 snap-center overflow-hidden relative group cursor-pointer border border-white/20 shadow-2xl transition-all duration-300 hover:scale-[1.03] flex flex-col justify-end"
          >
            {/* Full Cover Background Image */}
            <Image
              src={exp.image}
              alt={exp.title}
              fill
              sizes="(max-width: 640px) 210px, (max-width: 768px) 230px, 250px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Bottom Dark Gradient Overlay for text protection */}
            <div className="bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent absolute inset-0" />

            {/* Card Content (Safely padded from bottom edge) */}
            <div className="relative z-10 p-4 sm:p-5 space-y-1">
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                {exp.title}
              </h3>
              <p className="text-xs text-slate-200/90 leading-relaxed line-clamp-2">
                {exp.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
