'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Lock, Unlock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import TrustTooltip from '@/components/admin/TrustTooltip';
import PerPersonTooltip from '@/components/admin/PerPersonTooltip';

import { useCurrency } from '@/context/CurrencyContext';

interface DualPriceInputProps {
  priceUsd: number;
  priceLkr: number;
  onChangeUsd: (value: number) => void;
  onChangeLkr: (value: number) => void;
  disabled?: boolean;
  usdLabel?: string;
  lkrLabel?: string;
  usdRequired?: boolean;
  isPerPerson?: boolean;
  className?: string;
}

export default function DualPriceInput({
  priceUsd,
  priceLkr,
  onChangeUsd,
  onChangeLkr,
  disabled = false,
  usdLabel = 'Package Price (USD)',
  lkrLabel = 'Domestic Price (LKR)',
  usdRequired = true,
  isPerPerson = true,
  className = '',
}: DualPriceInputProps) {
  const { exchangeRate, isLoading: isFetchingRate, isFallback } = useCurrency();
  const [isLocked, setIsLocked] = useState<boolean>(true); // By default, locked to live auto-conversion

  // Auto-sync LKR if locked and LKR is not yet populated
  useEffect(() => {
    if (isLocked && priceUsd > 0 && (!priceLkr || priceLkr === 0) && exchangeRate > 0) {
      onChangeLkr(Math.round(priceUsd * exchangeRate));
    }
  }, [exchangeRate, isLocked, priceUsd, priceLkr, onChangeLkr]);

  // Handle USD input change
  const handleUsdChange = (val: number) => {
    onChangeUsd(val);
    if (isLocked) {
      const autoCalculated = Math.round(val * exchangeRate);
      onChangeLkr(autoCalculated);
    }
  };

  // Handle manual LKR input change
  const handleLkrChange = (val: number) => {
    onChangeLkr(val);
  };

  // Toggle Sync / Unlock
  const toggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    if (nextLocked) {
      // Re-sync LKR from current USD
      const autoCalculated = Math.round(priceUsd * exchangeRate);
      onChangeLkr(autoCalculated);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Bar with Live Market Rate Indicator & Unlock Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/80 text-[11px] font-bold text-orange-950">
            <Sparkles className="w-3 h-3 text-[#FF6B00]" />
            <span>Market Benchmark: 1 USD ≈ {exchangeRate.toFixed(2)} LKR</span>
          </div>

          {isFallback && (
            <span
              className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
              title="Using safe fallback rate due to temporary external rate provider downtime"
            >
              <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
              <span>Safe Baseline</span>
            </span>
          )}
        </div>

        {/* Sync / Unlock Toggle Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={toggleLock}
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer shadow-2xs select-none ${
            isLocked
              ? 'bg-white border-orange-200 text-[#FF6B00] hover:bg-orange-50'
              : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
          }`}
          title={
            isLocked
              ? 'Click to unlock and enter custom LKR override'
              : 'Click to re-lock and auto-sync LKR to live USD exchange rate'
          }
        >
          {isLocked ? (
            <>
              <Lock className="w-3 h-3 text-[#FF6B00]" />
              <span>Synced with USD</span>
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 text-amber-600" />
              <span>Manual Override Active</span>
            </>
          )}
        </button>
      </div>

      {/* Side-by-Side Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* USD Input (Master Anchor) */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {usdLabel} {usdRequired && <span className="text-rose-500">*</span>}
              </label>
              {isPerPerson && (
                <PerPersonTooltip priceUsd={priceUsd} />
              )}
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Master Anchor
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              required={usdRequired}
              disabled={disabled}
              value={priceUsd || ''}
              onChange={(e) => handleUsdChange(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 450.00"
              className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 disabled:opacity-60"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {isPerPerson
              ? 'Price is per 1 person. Total = Rate × Number of Guests.'
              : 'Always stored as the master price to eliminate currency arbitrage risks.'}
          </p>
        </div>

        {/* LKR Input (Calculated / Override) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>{lkrLabel}</span>
              <span className="text-[10px] font-normal lowercase text-slate-400">
                ({isLocked ? 'auto' : 'custom'})
              </span>
            </label>
            <TrustTooltip
              title="Why Local LKR Pricing Builds Trust"
              message="Quoting rates in Sri Lankan Rupees (LKR) enhances transparency for local travelers, drivers, and on-arrival payments."
              conversionHint={`Current live sync: 1 USD = ${exchangeRate.toFixed(2)} LKR`}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rs.
            </span>
            <input
              type="number"
              min="0"
              step="1"
              disabled={disabled || isLocked}
              value={priceLkr || ''}
              onChange={(e) => handleLkrChange(parseFloat(e.target.value) || 0)}
              placeholder={isLocked ? 'Auto-calculated from USD' : 'Enter custom LKR'}
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl font-bold transition-all ${
                isLocked
                  ? 'bg-slate-100/90 text-slate-600 border border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-900 border border-amber-300 ring-2 ring-amber-500/15 focus:outline-none focus:border-[#FF6B00]'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>
              {isLocked
                ? `Auto-synced @ 1 USD = ${exchangeRate.toFixed(2)} LKR${isPerPerson ? ' · Per 1 person' : ''}`
                : `Custom fixed rate entered${isPerPerson ? ' (per 1 person)' : ''}`}
            </span>
            {!isLocked && (
              <button
                type="button"
                onClick={() => {
                  const autoCalculated = Math.round(priceUsd * exchangeRate);
                  onChangeLkr(autoCalculated);
                }}
                className="text-[#FF6B00] font-bold hover:underline cursor-pointer"
              >
                Reset to Live Rate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
