'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Info, Sparkles, X } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface TrustTooltipProps {
  title?: string;
  message?: string;
  badgeText?: string;
  conversionHint?: string;
  variant?: 'badge' | 'icon';
}

export default function TrustTooltip({
  title = 'Local Currency Transparency',
  message = 'Quoting rates in Sri Lankan Rupees (LKR) enhances transparency and builds credibility with domestic guests, airport chauffeurs, and travelers settling cash on arrival.',
  badgeText = 'Local Trust',
  conversionHint,
  variant = 'badge',
}: TrustTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Retrieve cached live exchange rate from context
  let exchangeRate = 328.0;
  let isFallback = false;
  try {
    const currency = useCurrency();
    if (currency?.exchangeRate) {
      exchangeRate = currency.exchangeRate;
      isFallback = currency.isFallback;
    }
  } catch {
    // Fallback if rendered outside CurrencyProvider
  }

  const effectiveHint =
    conversionHint ||
    `Market benchmark: 1 USD ≈ ${exchangeRate.toFixed(2)} LKR${isFallback ? ' (cached fallback)' : ''}`;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center align-middle"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger */}
      {variant === 'badge' ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/90 hover:bg-amber-100 hover:border-amber-300 transition-all cursor-pointer shadow-2xs select-none"
        >
          <ShieldCheck className="w-3 h-3 text-amber-600" />
          <span>{badgeText}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="p-1 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Tooltip Balloon */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 bg-white rounded-2xl border border-amber-200/90 shadow-xl shadow-slate-900/10 space-y-2 animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{title}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
            {message}
          </p>

          {/* Conversion Footnote */}
          {effectiveHint && (
            <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-semibold text-amber-800/90">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{effectiveHint}</span>
            </div>
          )}

          {/* Triangle Arrow pointer */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white" />
        </div>
      )}
    </div>
  );
}
