'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Currency } from '@/types/tourism';
import { Menu, X, ArrowUpRight, Globe, ChevronDown, Check, PhoneCall } from 'lucide-react';

interface AboutNavbarProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenBooking: () => void;
}

const CURRENCIES: { code: Currency; symbol: string; label: string; flag: string }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'LKR', symbol: 'Rs', label: 'Sri Lanka Rupee', flag: '🇱🇰' },
];

export default function AboutNavbar({
  currency,
  onCurrencyChange,
  onOpenBooking,
}: AboutNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('story');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // About Page specific navigation links (6 items matching the home page navbar rhythm)
  const navLinks = [
    { name: 'Home', href: '/', id: 'home' },
    { name: 'Our Story', href: '#story', id: 'story' },
    { name: 'Our Team', href: '#team', id: 'team' },
    { name: 'Moments', href: '#moments', id: 'moments' },
    { name: 'Halal Care', href: '#halal', id: 'halal' },
    { name: 'Reviews', href: '#reviews', id: 'reviews' },
  ];

  // Scroll-spy tracking the actual sections of the About Page
  useEffect(() => {
    const sectionIds = ['story', 'team', 'moments', 'halal', 'reviews'];

    const handleScroll = () => {
      if (isClickScrollingRef.current) return;

      const scrollPosition = window.scrollY + 200;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (window.scrollY + windowHeight >= documentHeight - 80) {
        setActiveSection('reviews');
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, href: string) => {
    if (id === 'home') {
      // Return to homepage
      window.location.href = '/';
      return;
    }

    e.preventDefault();
    setActiveSection(id);
    isClickScrollingRef.current = true;

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 850);

    const element = document.getElementById(id);
    if (element) {
      const navOffset = 90;
      const targetPosition = element.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  // Close currency dropdown on outside click or Escape
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
          className="w-full rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-lg shadow-slate-900/5 text-slate-900"
          aria-label="About Page Navigation"
        >
          {/* Logo & Brand Name - Identical to Home Page */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-full py-1 pr-2"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border shadow-sm flex items-center justify-center border-orange-500/20 bg-orange-500/10">
              <Image
                src="/logo.jpeg"
                alt="Tripvibe Lanka Logo"
                fill
                sizes="36px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight font-heading leading-tight flex items-center gap-1 text-slate-900">
                Tripvibe<span className="text-[#FF6B00]">Lanka</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-medium hidden sm:inline-block text-slate-500">
                Luxury Private Tours
              </span>
            </div>
          </a>

          {/* Desktop Nav Links - Identical Style to Home Page, About-Specific Content */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id, link.href)}
                  className={`px-3.5 py-1.5 rounded-full text-xs lg:text-sm transition-all duration-200 font-medium ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm font-semibold'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Desktop Right Actions: Currency & CTA - Identical to Home Page */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Custom Frosted Currency Dropdown */}
            <div ref={currencyDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none border bg-slate-100/90 hover:bg-slate-200/80 border-slate-200/90 text-slate-800"
                aria-haspopup="listbox"
                aria-expanded={currencyDropdownOpen}
                aria-label="Select Currency"
              >
                <Globe className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                <span>{currency} ({currency === 'USD' ? '$' : 'Rs'})</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 text-slate-600 ${
                    currencyDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Custom Popover matching Navbar glass */}
              {currencyDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-2xl p-1.5 shadow-xl border transition-all z-50 bg-white/95 backdrop-blur-xl border-slate-200/90 text-slate-900 shadow-slate-900/10"
                  role="listbox"
                >
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
                              ? 'bg-slate-100 font-semibold text-slate-950'
                              : 'hover:bg-slate-50 text-slate-700 hover:text-slate-950'
                          }`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm leading-none">{c.flag}</span>
                            <div className="flex flex-col">
                              <span className="leading-tight">{c.code} ({c.symbol})</span>
                              <span className={`text-[10px] ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                                {c.label}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 shrink-0 text-slate-900" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Book Now Button matching reference */}
            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center justify-center gap-2 px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-semibold active:scale-[0.98] transition-all duration-200 cursor-pointer group text-white bg-[#FF6B00] hover:bg-[#E55F00] shadow-sm shadow-orange-500/25"
            >
              <span>Book now</span>
              <span className="w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 bg-white/20 text-white">
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </button>
          </div>

          {/* Mobile Right Controls: Currency Toggle + Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onCurrencyChange(currency === 'USD' ? 'LKR' : 'USD')}
              className="text-xs font-semibold rounded-full px-2.5 py-1 border transition-all cursor-pointer flex items-center gap-1 bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
              aria-label="Toggle currency"
            >
              <Globe className="w-3 h-3" />
              <span>{currency}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full focus:outline-none text-slate-800 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-md md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-24 inset-x-4 bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      handleNavClick(e, link.id, link.href);
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
                  </a>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3 rounded-full text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
              >
                <span>Book now</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <a
                href="https://wa.me/94761560046?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20tour."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp: 076 156 0046 (24/7)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
