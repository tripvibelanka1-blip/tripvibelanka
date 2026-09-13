'use client';

import React, { useState } from 'react';
import { PROMO_BANNER } from '@/data/mockData';
import { Tag, Copy, Check, ArrowRight, Clock } from 'lucide-react';

interface PromoBannerProps {
  onOpenBooking: () => void;
}

export default function PromoBanner({ onOpenBooking }: PromoBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PROMO_BANNER.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative z-20 mt-8 sm:mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFDF9] via-white to-[#FFF8F1] border border-orange-200/60 p-6 sm:p-8 lg:p-9 shadow-sm hover:shadow-md transition-shadow">
        {/* Subtle warm ambient glow accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Elegant restrained badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B00] text-xs font-semibold tracking-wide">
              <Tag className="w-3.5 h-3.5" />
              <span>{PROMO_BANNER.badge}</span>
            </div>

            {/* Clean editorial headline (no tacky AI gradient text) */}
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight font-heading">
              {PROMO_BANNER.title}:{' '}
              <span className="font-semibold text-[#FF6B00]">
                {PROMO_BANNER.discount}
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {PROMO_BANNER.subtitle}
            </p>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{PROMO_BANNER.validUntil}</span>
            </div>
          </div>

          {/* Action Buttons & Promo Code Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5 w-full lg:w-auto shrink-0">
            {/* Promo Code Box */}
            <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 shadow-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Coupon Code
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900">
                  {PROMO_BANNER.code}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="ml-2 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Copy Promo Code"
                aria-label="Copy Promo Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Claim Offer Button */}
            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 cursor-pointer w-full sm:w-auto"
            >
              <span>{PROMO_BANNER.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
