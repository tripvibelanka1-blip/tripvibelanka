'use client';

import React, { useState } from 'react';
import { Tag, Copy, Check, ArrowRight, Clock, Sparkles } from 'lucide-react';

export interface BannerCardPreviewProps {
  badge_text?: string;
  title?: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  coupon_code?: string;
  button_text?: string;
  button_link?: string;
  validity_text?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export default function BannerCardPreview({
  badge_text = 'Limited Seasonal Offer',
  title = 'Exclusive Summer Tour Escape',
  description = 'Enjoy up to 15% off bespoke private chauffeured tours across Sri Lanka.',
  discount_type = 'percentage',
  discount_value = 15,
  coupon_code = 'VIBELANKA15',
  button_text = 'Claim Seasonal Offer',
  button_link = '#tours',
  validity_text = 'Valid for bookings made this month',
  start_date,
  end_date,
  is_active = true,
}: BannerCardPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!coupon_code) return;
    navigator.clipboard.writeText(coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format date range note if validity_text is empty
  const scheduleNote = validity_text?.trim()
    ? validity_text
    : start_date && end_date
    ? `Active: ${start_date} to ${end_date}`
    : start_date
    ? `Starts: ${start_date}`
    : 'Limited time promotion';

  return (
    <div className="space-y-2">
      {/* Live Label */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#FF6B00]" />
          <span>Real-Time Visitor View</span>
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {is_active ? '● Live on Public Site' : '○ Paused / Inactive'}
        </span>
      </div>

      {/* Main Promotional Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFDF9] via-white to-[#FFF8F1] border border-orange-200/80 p-6 sm:p-7 shadow-sm transition-all text-left">
        {/* Soft Ambient Glow Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-orange-100/60 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Left Text Content */}
          <div className="space-y-2.5 max-w-xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF6B00] text-xs font-bold tracking-wide shadow-2xs">
              <Tag className="w-3.5 h-3.5" />
              <span>{badge_text?.trim() || 'Limited Seasonal Offer'}</span>
            </div>

            {/* Headline */}
            <h3 className="text-xl sm:text-2xl font-light text-slate-900 tracking-tight font-heading leading-tight">
              {title?.trim() || 'Your Promotional Title Goes Here'}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                {description}
              </p>
            )}

            {/* Validity Note */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 pt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{scheduleNote}</span>
            </div>
          </div>

          {/* Right Action & Coupon Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            {/* Dedicated Coupon Code Box (only rendered if coupon_code is provided) */}
            {coupon_code?.trim() && (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 text-slate-800 shadow-xs">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      Coupon
                    </span>
                    {discount_value ? (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        {discount_type === 'percentage' ? `${discount_value}% OFF` : `$${discount_value} OFF`}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs font-mono font-black tracking-wider text-slate-900 mt-0.5">
                    {coupon_code.trim().toUpperCase()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Copy Coupon Code"
                  aria-label="Copy Coupon Code"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* CTA Button */}
            <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all select-none">
              <span>{button_text?.trim() || 'Claim Seasonal Offer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
