'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

export type Currency = 'USD' | 'LKR';

export interface PriceDetails {
  amount: number;
  formatted: string;
  currency: Currency;
  isCustomLkr: boolean;
  rateUsed: number;
}

export interface CurrencyContextType {
  currency: Currency;
  exchangeRate: number;
  isLoading: boolean;
  isFallback: boolean;
  lastUpdated: number | null;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceUsd: number, priceLkr?: number) => string;
  getPriceDetails: (priceUsd: number, priceLkr?: number) => PriceDetails;
  refreshRate: () => Promise<void>;
}

const STORAGE_KEY = 'tripvibe_currency_preference';
const DEFAULT_FALLBACK_RATE = 328.0;

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_FALLBACK_RATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Initialize currency from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'USD' || saved === 'LKR') {
        setCurrencyState(saved);
      }
    } catch {
      // Ignore localStorage access restrictions in private browsing
    }
  }, []);

  // Fetch exchange rate from server proxy
  const fetchRate = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await fetch('/api/currency');
      if (!res.ok) throw new Error(`Currency API status ${res.status}`);
      const data = await res.json();

      if (data && typeof data.rate === 'number' && data.rate > 0) {
        setExchangeRate(data.rate);
        setIsFallback(Boolean(data.isFallback));
        setLastUpdated(data.timestamp || Date.now());
      }
    } catch (err) {
      console.warn('[CurrencyContext] Falling back to default baseline rate:', err);
      setIsFallback(true);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  // Fetch on mount, and schedule periodic 30-min background updates & tab focus listener
  useEffect(() => {
    fetchRate();

    // 30-minute periodic background revalidation for long-lived tabs
    const interval = setInterval(() => {
      fetchRate(true);
    }, 30 * 60 * 1000);

    // Refresh when user returns to tab if more than 30 mins elapsed
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = lastUpdated ? Date.now() - lastUpdated : Infinity;
        if (elapsed > 30 * 60 * 1000) {
          fetchRate(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchRate, lastUpdated]);

  // Update currency and persist to localStorage without database writes
  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(STORAGE_KEY, newCurrency);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === 'USD' ? 'LKR' : 'USD');
  }, [currency, setCurrency]);

  /**
   * Get comprehensive price calculation breakdown
   */
  const getPriceDetails = useCallback(
    (priceUsd: number, priceLkr?: number): PriceDetails => {
      const safeUsd = Number(priceUsd) || 0;
      const safeCustomLkr = Number(priceLkr);
      const hasCustomLkr = !isNaN(safeCustomLkr) && safeCustomLkr > 0;

      if (currency === 'LKR') {
        if (hasCustomLkr) {
          return {
            amount: safeCustomLkr,
            formatted: `Rs. ${safeCustomLkr.toLocaleString('en-US')}`,
            currency: 'LKR',
            isCustomLkr: true,
            rateUsed: exchangeRate,
          };
        }

        const calculatedLkr = Math.round(safeUsd * exchangeRate);
        return {
          amount: calculatedLkr,
          formatted: `Rs. ${calculatedLkr.toLocaleString('en-US')}`,
          currency: 'LKR',
          isCustomLkr: false,
          rateUsed: exchangeRate,
        };
      }

      // USD is Master Anchor
      const formattedUsd = `$${safeUsd.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      return {
        amount: safeUsd,
        formatted: formattedUsd,
        currency: 'USD',
        isCustomLkr: false,
        rateUsed: 1,
      };
    },
    [currency, exchangeRate]
  );

  /**
   * Quick formatting helper for components
   */
  const formatPrice = useCallback(
    (priceUsd: number, priceLkr?: number): string => {
      return getPriceDetails(priceUsd, priceLkr).formatted;
    },
    [getPriceDetails]
  );

  const contextValue = useMemo(
    () => ({
      currency,
      exchangeRate,
      isLoading,
      isFallback,
      lastUpdated,
      setCurrency,
      toggleCurrency,
      formatPrice,
      getPriceDetails,
      refreshRate: () => fetchRate(false),
    }),
    [
      currency,
      exchangeRate,
      isLoading,
      isFallback,
      lastUpdated,
      setCurrency,
      toggleCurrency,
      formatPrice,
      getPriceDetails,
      fetchRate,
    ]
  );

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a <CurrencyProvider>');
  }
  return context;
}
