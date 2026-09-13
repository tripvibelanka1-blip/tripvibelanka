'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Copy, Check, ArrowRight, Clock } from 'lucide-react';
import { Banner } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import { PROMO_BANNER } from '@/data/mockData';

interface PromoBannerProps {
  onOpenBooking: (packageId?: string, couponCode?: string) => void;
  banner?: Banner | null;
}

export default function PromoBanner({ onOpenBooking, banner: initialBanner }: PromoBannerProps) {
  const [copied, setCopied] = useState(false);
  const [activeBanner, setActiveBanner] = useState<Banner | null>(initialBanner ?? null);

  // Load active banner from Supabase client-side if not explicitly passed as prop
  useEffect(() => {
    if (initialBanner !== undefined) return;

    let isMounted = true;
    async function loadActiveBanner() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .or(`start_date.is.null,start_date.lte.${today}`)
          .or(`end_date.is.null,end_date.gte.${today}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (isMounted && data && !error) {
          setActiveBanner(data as Banner);
        }
      } catch (err) {
        console.warn('[PromoBanner] Using fallback banner:', err);
      }
    }

    loadActiveBanner();

    return () => {
      isMounted = false;
    };
  }, [initialBanner]);

  // Display data mapping (active database banner takes precedence over static mock fallback)
  const badge = activeBanner?.badge_text || PROMO_BANNER.badge;
  const title = activeBanner?.title || `${PROMO_BANNER.title}: ${PROMO_BANNER.discount}`;
  const subtitle = activeBanner?.description || PROMO_BANNER.subtitle;
  const validity = activeBanner?.validity_text || PROMO_BANNER.validUntil;
  const code = activeBanner ? activeBanner.coupon_code : PROMO_BANNER.code;
  const ctaText = activeBanner?.button_text || PROMO_BANNER.ctaText;
  const ctaLink = activeBanner?.button_link || '#tours';

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    if (ctaLink.startsWith('#booking') || ctaLink === '/booking') {
      e.preventDefault();
      onOpenBooking(undefined, code || undefined);
    }
  };

  return (
    <section className="relative z-20 mt-8 sm:mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFDF9] via-white to-[#FFF8F1] border border-orange-200/80 p-6 sm:p-8 lg:p-9 shadow-sm hover:shadow-md transition-shadow">
        {/* Subtle warm ambient glow accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Headline & Description */}
          <div className="space-y-3 max-w-2xl">
            {/* Elegant restrained badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B00] text-xs font-semibold tracking-wide">
              <Tag className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight font-heading">
              {title}
            </h2>

            {/* Description */}
            {subtitle && (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* Validity Footnote */}
            {validity && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{validity}</span>
              </div>
            )}
          </div>

          {/* Action Buttons & Promo Code Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5 w-full lg:w-auto shrink-0">
            {/* Promo Code Box (Rendered only when coupon_code exists) */}
            {code && (
              <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 shadow-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Coupon Code
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900">
                    {code}
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
            )}

            {/* Claim Offer Button */}
            {ctaLink.startsWith('#booking') || ctaLink === '/booking' ? (
              <button
                type="button"
                onClick={handleCtaClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 cursor-pointer w-full sm:w-auto"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 cursor-pointer w-full sm:w-auto"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
