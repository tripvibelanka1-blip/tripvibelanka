'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Users, Info, X, Calculator } from 'lucide-react';

interface PerPersonTooltipProps {
  title?: string;
  message?: string;
  badgeText?: string;
  variant?: 'badge' | 'icon';
  priceUsd?: number;
}

export default function PerPersonTooltip({
  title = 'Per One Person Pricing',
  message = 'This price is strictly per 1 guest. When customers make a reservation, the total base tour price is automatically multiplied by the guest count selected.',
  badgeText = 'Per Person',
  variant = 'badge',
  priceUsd,
}: PerPersonTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on click outside
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

  const pUsd = Number(priceUsd) || 0;

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
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-900 border border-orange-200/90 hover:bg-orange-100 hover:border-orange-300 transition-all cursor-pointer shadow-2xs select-none"
          title="Click to learn how per-person pricing works"
        >
          <User className="w-2.5 h-2.5 text-[#FF6B00]" />
          <span>{badgeText}</span>
          <Info className="w-2.5 h-2.5 text-orange-400" />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="p-1 text-slate-400 hover:text-orange-600 rounded-md hover:bg-orange-50 transition-colors cursor-pointer"
          title="Per one person price information"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Tooltip Popover */}
      {isOpen && (
        <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 bg-white rounded-2xl border border-orange-200 shadow-xl shadow-slate-900/10 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-orange-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <div className="w-5 h-5 rounded-md bg-orange-100 text-[#FF6B00] flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
              <span>{title}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              aria-label="Close tooltip"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
            {message}
          </p>

          {/* Live Dynamic Headcount Breakdown */}
          <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-950">
              <Calculator className="w-3 h-3 text-[#FF6B00]" />
              <span>Customer Booking Calculation:</span>
            </div>
            {pUsd > 0 ? (
              <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center pt-0.5">
                <div className="bg-white/90 p-1 rounded-lg border border-orange-200/60">
                  <div className="text-[9px] text-slate-400 font-medium">1 Guest (Solo)</div>
                  <div className="font-bold text-slate-900 font-mono">${pUsd}</div>
                </div>
                <div className="bg-white/90 p-1 rounded-lg border border-orange-200/60">
                  <div className="text-[9px] text-slate-400 font-medium">2 Guests (Couple)</div>
                  <div className="font-bold text-[#FF6B00] font-mono">${pUsd * 2}</div>
                </div>
                <div className="bg-white/90 p-1 rounded-lg border border-orange-200/60">
                  <div className="text-[9px] text-slate-400 font-medium">4 Guests (Family)</div>
                  <div className="font-bold text-emerald-700 font-mono">${pUsd * 4}</div>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-orange-900 font-medium">
                Formula: <strong className="text-slate-900 font-mono">Rate × Guests Count</strong> (e.g. $500 × 2 guests = $1,000).
              </p>
            )}
          </div>

          {/* Triangle Arrow */}
          <div className="absolute left-6 sm:left-1/2 sm:-translate-x-1/2 top-full w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white" />
        </div>
      )}
    </div>
  );
}
