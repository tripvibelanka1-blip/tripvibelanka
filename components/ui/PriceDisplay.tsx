'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface PriceDisplayProps {
  priceUsd: number;
  priceLkr?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFootnote?: boolean;
  footnoteClassName?: string;
  perUnit?: string;
  theme?: 'dark' | 'light' | 'auto';
}

export default function PriceDisplay({
  priceUsd,
  priceLkr,
  className = '',
  size = 'md',
  showFootnote = true,
  footnoteClassName = '',
  perUnit,
  theme = 'auto',
}: PriceDisplayProps) {
  const { currency, exchangeRate, getPriceDetails, isLoading } = useCurrency();

  const details = getPriceDetails(priceUsd, priceLkr);

  // Size definitions matching TripVibe Lanka luxury typography scale
  const sizeStyles = {
    sm: {
      amount: 'text-sm font-bold',
      currency: 'text-[10px] font-bold tracking-wider',
      perUnit: 'text-[11px]',
      footnote: 'text-[9px]',
    },
    md: {
      amount: 'text-base sm:text-lg font-black tracking-tight',
      currency: 'text-[11px] font-bold tracking-wider',
      perUnit: 'text-xs',
      footnote: 'text-[10px]',
    },
    lg: {
      amount: 'text-xl sm:text-2xl font-black tracking-tight',
      currency: 'text-xs font-bold tracking-wider',
      perUnit: 'text-sm',
      footnote: 'text-[11px]',
    },
    xl: {
      amount: 'text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight',
      currency: 'text-sm font-bold tracking-wider',
      perUnit: 'text-sm sm:text-base',
      footnote: 'text-xs',
    },
  }[size];

  // Theme colors
  const colorStyles =
    theme === 'dark'
      ? {
          amount: 'text-amber-400',
          currencyBadge: 'text-amber-300/80 bg-amber-500/10 border-amber-500/20',
          perUnit: 'text-slate-400',
          footnote: 'text-slate-400',
        }
      : theme === 'light'
      ? {
          amount: 'text-slate-900',
          currencyBadge: 'text-orange-950 bg-orange-50 border-orange-200/80',
          perUnit: 'text-slate-500',
          footnote: 'text-slate-500',
        }
      : {
          // auto / brand default
          amount: 'text-slate-900 dark:text-amber-400',
          currencyBadge: 'text-[#FF6B00] bg-orange-50 dark:bg-amber-500/10 border-orange-200/80 dark:border-amber-500/20',
          perUnit: 'text-slate-500 dark:text-slate-400',
          footnote: 'text-slate-400 dark:text-slate-500',
        };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        {/* Main Formatted Amount */}
        <span className={`${sizeStyles.amount} ${colorStyles.amount}`}>
          {details.formatted}
        </span>

        {/* Currency Pill */}
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-md border uppercase ${sizeStyles.currency} ${colorStyles.currencyBadge}`}
        >
          {currency}
        </span>

        {/* Per-Unit Suffix (e.g., / person, / day) */}
        {perUnit && (
          <span className={`font-normal ${sizeStyles.perUnit} ${colorStyles.perUnit}`}>
            {perUnit}
          </span>
        )}
      </div>

      {/* Trust-building Footnote for Dynamic LKR */}
      {showFootnote && currency === 'LKR' && (
        <div
          className={`flex items-center gap-1 mt-0.5 ${sizeStyles.footnote} ${colorStyles.footnote} ${footnoteClassName}`}
        >
          {details.isCustomLkr ? (
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified local operator rate</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 font-normal opacity-85">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span>
                Converted at live market rate: 1 USD ≈ {exchangeRate.toFixed(2)} LKR
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
