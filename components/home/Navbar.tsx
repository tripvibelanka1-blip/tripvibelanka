'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Currency } from '@/types/tourism';
import { Menu, X, ArrowUpRight, Globe, PhoneCall, ChevronDown, Check } from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenBooking: (packageId?: string) => void;
  forceSolid?: boolean;
}

export interface NavLinkItem {
  name: string;
  href: string;
  id: string;
  isDedicated?: boolean;
}

const CURRENCIES: { code: Currency; symbol: string; label: string; flag: string }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'LKR', symbol: 'Rs', label: 'Sri Lanka Rupee', flag: '🇱🇰' },
];

export const NAV_LINKS: NavLinkItem[] = [
  { name: 'Home', href: '/', id: 'home', isDedicated: true },
  { name: 'Destinations', href: '/destinations', id: 'destinations', isDedicated: true },
  { name: 'Tours', href: '/tours', id: 'tours', isDedicated: true },
  { name: 'Experiences', href: '/experiences', id: 'experiences', isDedicated: true },
  { name: 'Fleet', href: '/fleet', id: 'fleet', isDedicated: true },
  { name: 'About Us', href: '/about', id: 'about', isDedicated: true },
];

export default function Navbar({
  currency,
  onCurrencyChange,
  onOpenBooking,
  forceSolid = false,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  const isDedicatedPage = pathname !== '/';
  const isSolid = forceSolid || scrolled || isDedicatedPage;

  useEffect(() => {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const isLinkActive = (link: NavLinkItem) => {
    // When on the homepage, the Home pill remains highlighted for the whole page
    if (link.id === 'home' || link.href === '/') {
      return pathname === '/';
    }
    if (link.href === '/destinations') {
      return pathname === '/destinations' || pathname?.startsWith('/destinations/');
    }
    if (link.href === '/tours') {
      return pathname === '/tours' || pathname?.startsWith('/tours/');
    }
    if (link.href === '/experiences') {
      return pathname === '/experiences' || pathname?.startsWith('/experiences/');
    }
    if (link.href === '/fleet') {
      return pathname === '/fleet' || pathname?.startsWith('/fleet/');
    }
    if (link.href === '/about') {
      return pathname === '/about' || pathname?.startsWith('/about/');
    }
    return pathname === link.href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: NavLinkItem) => {
    // When clicking the link for the page the traveler is already on, smooth-scroll to top
    if (pathname === link.href || (link.href === '/' && pathname === '/')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="fixed top-5 inset-x-4 z-50 max-w-6xl mx-auto transition-all duration-300">
        <nav
          className={`w-full rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
            isSolid
              ? 'bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-lg shadow-slate-900/5 text-slate-900'
              : 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white'
          }`}
          aria-label="Universal Navigation"
        >
          {/* Logo & Brand Name */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-full py-1 pr-2"
          >
            <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border shadow-xs flex items-center justify-center p-0.5 ${
              isSolid ? 'border-orange-500/20 bg-white' : 'border-white/30 bg-white/95 backdrop-blur-md'
            }`}>
              <Image
                src="/logo-emblem.png"
                alt="Tripvibe Lanka Logo"
                fill
                sizes="36px"
                className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className={`text-base sm:text-lg font-bold tracking-tight font-heading leading-tight flex items-center gap-1 ${
                isSolid ? 'text-slate-900' : 'text-white'
              }`}>
                Tripvibe<span className="text-[#FF6B00]">Lanka</span>
              </span>
              <span className={`text-[10px] uppercase tracking-widest font-medium hidden sm:inline-block ${
                isSolid ? 'text-slate-500' : 'text-white/70'
              }`}>
                Luxury Private Tours
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`px-3.5 py-1.5 rounded-full text-xs lg:text-sm transition-all duration-200 font-medium ${
                    isActive
                      ? isSolid
                        ? 'bg-slate-900 text-white shadow-sm font-semibold'
                        : 'bg-white text-slate-900 font-semibold shadow-sm'
                      : isSolid
                      ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Actions: Currency & CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Custom Frosted Currency Dropdown */}
            <div ref={currencyDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none border ${
                  isSolid
                    ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200/90 text-slate-800'
                    : 'bg-white/15 hover:bg-white/25 border-white/25 text-white backdrop-blur-md'
                }`}
                aria-haspopup="listbox"
                aria-expanded={currencyDropdownOpen}
                aria-label="Select Currency"
              >
                <Globe className={`w-3.5 h-3.5 shrink-0 ${isSolid ? 'text-slate-600' : 'text-white/80'}`} />
                <span>{currency} ({currency === 'USD' ? '$' : 'Rs'})</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    currencyDropdownOpen ? 'rotate-180' : ''
                  } ${isSolid ? 'text-slate-600' : 'text-white/70'}`}
                />
              </button>

              {/* Custom Popover matching Navbar glass */}
              {currencyDropdownOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-48 rounded-2xl p-1.5 shadow-2xl border transition-all z-50 ${
                    isSolid
                      ? 'bg-white/95 backdrop-blur-xl border-slate-200/90 text-slate-900 shadow-xl shadow-slate-900/10'
                      : 'bg-slate-900/90 backdrop-blur-2xl border-white/20 shadow-2xl text-white'
                  }`}
                  role="listbox"
                >
                  <div className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                    isSolid ? 'text-slate-400' : 'text-white/60'
                  }`}>
                    Select Currency
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {CURRENCIES.map((c) => {
                      const isSelected = currency === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            onCurrencyChange(c.code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer border-0 ${
                            isSelected
                              ? isSolid
                                ? 'bg-slate-100 font-semibold text-slate-950'
                                : 'bg-white/15 font-semibold text-white'
                              : isSolid
                              ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-950'
                              : 'hover:bg-white/10 text-white/80 hover:text-white'
                          }`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm leading-none">{c.flag}</span>
                            <div className="flex flex-col">
                              <span className="leading-tight">{c.code} ({c.symbol})</span>
                              <span className={`text-[10px] ${
                                isSelected
                                  ? isSolid
                                    ? 'text-slate-500'
                                    : 'text-white/80'
                                  : isSolid
                                  ? 'text-slate-400'
                                  : 'text-white/60'
                              }`}>
                                {c.label}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className={`w-3.5 h-3.5 shrink-0 ${isSolid ? 'text-slate-900' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Book Now Button */}
            <Link
              href="/booking"
              onClick={(e) => {
                if (pathname === '/booking') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
              }}
              className={`inline-flex items-center justify-center gap-2 px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-semibold active:scale-[0.98] transition-all duration-200 cursor-pointer group ${
                isSolid
                  ? 'text-white bg-[#FF6B00] hover:bg-[#E55F00] shadow-sm shadow-orange-500/25'
                  : 'text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 shadow-md'
              }`}
            >
              <span>Book now</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                isSolid ? 'bg-white/20 text-white' : 'bg-white text-slate-900'
              }`}>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {/* Mobile Right Controls: Currency Toggle + Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onCurrencyChange(currency === 'USD' ? 'LKR' : 'USD')}
              className={`text-xs font-semibold rounded-full px-2.5 py-1 border transition-all cursor-pointer flex items-center gap-1 ${
                isSolid
                  ? 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                  : 'bg-white/15 text-white border-white/25 backdrop-blur-md hover:bg-white/25'
              }`}
              aria-label="Toggle currency"
            >
              <Globe className="w-3 h-3" />
              <span>{currency}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full focus:outline-none ${
                isSolid ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/20'
              }`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Slide-out Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-24 inset-x-4 bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-100 transform-gpu transition-all duration-300 ${
            mobileMenuOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-4 scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col space-y-2">
              {NAV_LINKS.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      handleNavClick(e, link);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-2xl text-base font-semibold transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FF6B00] text-white shadow-sm shadow-orange-500/25'
                        : 'text-slate-800 hover:bg-orange-50 hover:text-[#FF6B00]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-full text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
              >
                <span>Book now</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/94775368357?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20tour."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp: 077 536 8357 (24/7)</span>
              </a>
            </div>
          </div>
        </div>
    </>
  );
}
