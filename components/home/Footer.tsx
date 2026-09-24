'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle,
  ArrowUpRight,
  ArrowRight,
  Phone,
  Clock,
  MapPin,
  Star,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { SiteSettings } from '@/types/database';

interface FooterProps {
  onOpenBooking?: () => void;
}

// Official TripAdvisor SVG Icon
function TripAdvisorIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Tripadvisor">
      <path d="M19.34 7.15c-1.22 0-2.31.5-3.1 1.3a7.48 7.48 0 0 0-8.48 0c-.79-.8-1.88-1.3-3.1-1.3C2.08 7.15.5 8.73.5 10.69c0 1.96 1.58 3.54 3.54 3.54.34 0 .66-.05.97-.14a7.46 7.46 0 0 0 13.98 0c.31.09.63.14.97.14 1.96 0 3.54-1.58 3.54-3.54 0-1.96-1.58-3.54-3.54-3.54zM4.04 12.83c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14zm7.96 3.86a5.97 5.97 0 0 1-5.69-4.14c.54-.38 1.16-.65 1.83-.78a4.13 4.13 0 0 1 7.72 0c.67.13 1.29.4 1.83.78a5.97 5.97 0 0 1-5.69 4.14zm7.96-3.86c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14z" />
      <circle cx="4.04" cy="10.69" r="1.1" />
      <circle cx="19.96" cy="10.69" r="1.1" />
      <circle cx="12" cy="7.2" r="1" />
    </svg>
  );
}

// Official TikTok SVG Icon
function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="TikTok">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-.88-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.49V8.58a8.3 8.3 0 0 0 5-1.89l-1.18-2z" />
    </svg>
  );
}

// Instagram SVG Icon
function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-label="Instagram">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Facebook SVG Icon
function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Facebook">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const DEFAULT_TRIPADVISOR_URL =
  'https://www.tripadvisor.com/Attraction_Review-g293962-d33287122-Reviews-Trip_Vibe_Lanka-Colombo_Western_Province.html';

export default function Footer({ onOpenBooking }: FooterProps) {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowFloatingCTA(window.scrollY > window.innerHeight * 0.5);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch dynamic contact and social channels from settings table
  useEffect(() => {
    let isMounted = true;
    async function loadSiteSettings() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
        if (data && isMounted) {
          setSiteSettings(data);
        }
      } catch (err) {
        console.warn('Could not load site_settings:', err);
      }
    }
    loadSiteSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = targetId === 'home' ? '/' : `/#${targetId}`;
      return;
    }
    e.preventDefault();
    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(targetId);
    if (elem) {
      const yOffset = -80;
      const y = elem.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Resolved dynamic links
  const whatsappNum = siteSettings?.whatsapp_number || '077 536 8357';
  const cleanWhatsappDigits = whatsappNum.replace(/\D/g, '') || '94775368357';
  const formattedWhatsapp = cleanWhatsappDigits.startsWith('94')
    ? cleanWhatsappDigits
    : cleanWhatsappDigits.startsWith('0')
    ? `94${cleanWhatsappDigits.slice(1)}`
    : `94${cleanWhatsappDigits}`;

  const phoneNum = siteSettings?.company_phone || '+94 77 536 8357';
  const cleanPhoneHref = `tel:${phoneNum.replace(/[^\d+]/g, '')}`;

  const facebookUrl = siteSettings?.facebook_url || 'https://www.facebook.com/tripvibelanka';
  const instagramUrl = siteSettings?.instagram_url || 'https://www.instagram.com/trip_vibe_lanka';
  const tiktokUrl = siteSettings?.tiktok_url || 'https://www.tiktok.com/@tripvibelanka';
  const tripadvisorUrl = siteSettings?.tripadvisor_url && siteSettings.tripadvisor_url.includes('tripadvisor')
    ? siteSettings.tripadvisor_url
    : DEFAULT_TRIPADVISOR_URL;

  const socialLinks = [
    {
      name: 'Tripadvisor',
      href: tripadvisorUrl,
      icon: TripAdvisorIcon,
      hoverBg: 'hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
      title: 'Read verified 5.0 reviews on Tripadvisor',
    },
    {
      name: 'Instagram',
      href: instagramUrl,
      icon: InstagramIcon,
      hoverBg: 'hover:bg-pink-600 hover:text-white hover:border-pink-600',
      title: 'Follow @trip_vibe_lanka on Instagram',
    },
    {
      name: 'Facebook',
      href: facebookUrl,
      icon: FacebookIcon,
      hoverBg: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
      title: 'Connect with Tripvibe Lanka on Facebook',
    },
    {
      name: 'TikTok',
      href: tiktokUrl,
      icon: TikTokIcon,
      hoverBg: 'hover:bg-slate-900 hover:text-white hover:border-slate-900',
      title: 'Watch our Ceylon travels on TikTok',
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/${formattedWhatsapp}?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20plan%20a%20private%20tour.`,
      icon: MessageCircle,
      hoverBg: 'hover:bg-emerald-500 hover:text-white hover:border-emerald-500',
      title: `Direct WhatsApp: ${whatsappNum}`,
    },
  ];

  return (
    <>
      <footer className="w-full bg-white pt-16 overflow-hidden relative border-t border-slate-200/80">
        {/* Real Links & Verified Company Metadata */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12 text-sm">
            {/* Column 1: Brand & TripAdvisor Badge (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <Link
                href="/"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-2.5 group"
              >
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-orange-500/20 bg-white shadow-xs flex items-center justify-center p-0.5">
                  <Image
                    src="/logo-emblem.png"
                    alt="Tripvibe Lanka Logo"
                    fill
                    sizes="36px"
                    className="object-contain p-0.5 group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight font-heading text-slate-900 leading-tight">
                    Tripvibe<span className="text-[#FF6B00]">Lanka</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-medium text-slate-500">
                    Luxury Private Tours
                  </span>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
                Bespoke private tours, native chauffeur guides, and authentic immersive Ceylon journeys. We do not just
                show you Sri Lanka: we let you feel it.
              </p>

              <div>
                <Link
                  href="/about"
                  className="text-xs font-semibold text-[#FF6B00] hover:text-[#E55F00] inline-flex items-center gap-1 group/story transition-colors"
                >
                  <span>Read our full story</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/story:translate-x-1" />
                </Link>
              </div>

              {/* Verified TripAdvisor Proof Badge */}
              <a
                href={tripadvisorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/ta flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/40 hover:bg-emerald-50/40 transition-all max-w-xs shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <TripAdvisorIcon className="w-5 h-5 fill-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 font-heading">Tripadvisor</span>
                    <div className="flex text-emerald-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-emerald-500" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium group-hover/ta:text-emerald-700 transition-colors">
                    5.0 Rating · 7 Verified Reviews ↗
                  </span>
                </div>
              </a>

              {/* Social Media Row with Real Links */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Connect With Us
                </div>
                <div className="flex items-center gap-2">
                  {socialLinks.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item.title}
                        className={`w-9 h-9 rounded-xl border border-slate-200/80 bg-white text-slate-600 flex items-center justify-center transition-all duration-200 shadow-xs ${item.hoverBg}`}
                        aria-label={item.name}
                      >
                        <IconComp className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Available Island Circuits (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase font-heading">
                Explore Island Circuits
              </h4>
              <ul className="space-y-2.5 font-normal text-xs sm:text-sm text-slate-600">
                <li>
                  <Link
                    href="/tours"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      All Tour Packages
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      Destinations &amp; Guides
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/experiences"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      Activities &amp; Experiences
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/fleet"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      Executive Vehicle Fleet
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      Plan Custom Itinerary
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: About Tripvibe & Trust (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase font-heading">
                About Tripvibe
              </h4>
              <ul className="space-y-2.5 font-normal text-xs sm:text-sm text-slate-600">
                <li>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      About Our Story
                    </span>
                  </Link>
                </li>
                <li>
                  <a
                    href="/#why-us"
                    onClick={(e) => handleSmoothScroll(e, 'why-us')}
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      Why Choose Us
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/#reviews"
                    onClick={(e) => handleSmoothScroll(e, 'reviews')}
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      Traveler Reviews
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={tripadvisorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      Tripadvisor Reviews
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#FF6B00] transition-colors shrink-0" />
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${formattedWhatsapp}?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20plan%20a%20private%20tour.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-[#FF6B00] transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      24/7 WhatsApp Concierge
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#FF6B00] transition-colors shrink-0" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Real 24/7 Island Concierge & Contact (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase font-heading">
                Direct Island Concierge
              </h4>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                {/* Real WhatsApp Contact */}
                <a
                  href={`https://wa.me/${formattedWhatsapp}?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20plan%20a%20private%20tour.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium">WhatsApp 24/7</span>
                    <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {whatsappNum}
                    </span>
                  </div>
                </a>

                {/* Real Phone Call */}
                <a
                  href={cleanPhoneHref}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-orange-500/50 hover:bg-orange-50/50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium">Direct Call</span>
                    <span className="font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                      {phoneNum}
                    </span>
                  </div>
                </a>

                {/* Operating details */}
                <div className="pt-1 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Available 24/7 · 7 Days a Week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{siteSettings?.office_address || 'Colombo, Western Province, Sri Lanka'}</span>
                  </div>
                </div>

                {onOpenBooking ? (
                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#FF6B00] transition-colors text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Design Custom Itinerary</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    href="/booking"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#FF6B00] transition-colors text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Design Custom Itinerary</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Copyright Bar with PayHere Required Policy Links */}
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 pt-6 pb-4 border-t border-slate-200/70 gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 whitespace-nowrap">
              <p className="whitespace-nowrap">© {new Date().getFullYear()} Tripvibe Lanka. All rights reserved.</p>
              <span className="hidden sm:inline text-slate-300">·</span>
              <nav aria-label="Legal Links" className="flex items-center gap-3 text-slate-500 whitespace-nowrap">
                <Link href="/terms" className="hover:text-[#FF6B00] transition-colors whitespace-nowrap">
                  Terms &amp; Conditions
                </Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-[#FF6B00] transition-colors whitespace-nowrap">
                  Privacy Policy
                </Link>
                <span>·</span>
                <Link href="/refund-policy" className="hover:text-[#FF6B00] transition-colors whitespace-nowrap">
                  Refund &amp; Cancellation
                </Link>
              </nav>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1 font-medium text-slate-600 text-[11px] sm:text-xs whitespace-nowrap">
              <p className="flex items-center gap-1 whitespace-nowrap">
                ❤️ Made with love in Sri Lanka · Licensed and Verified Private Tour Operator
              </p>
              <p className="text-[11px] text-slate-500 whitespace-nowrap">
                Engineered by{' '}
                <a
                  href="https://www.instagram.com/_knight_graphics_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-700 hover:text-[#FF6B00] hover:underline transition-colors"
                >
                  Knight Graphics
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Illustration Banner */}
        <div className="w-full relative h-[220px] sm:h-[300px] md:h-[360px] -mt-10 z-0 pointer-events-none select-none">
          <Image
            alt="Sri Lanka Landscape Illustration"
            className="object-cover object-top"
            fill
            loading="lazy"
            quality={55}
            src="/images/sri-lanka-footer-illustration.webp"
            sizes="100vw"
          />
        </div>
      </footer>

      {/* Floating Sticky WhatsApp Concierge CTA */}
      <aside
        aria-label="Quick contact"
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 transition-all duration-500 ease-out ${
          showFloatingCTA
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <a
          href={`https://wa.me/${formattedWhatsapp}?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20tour%20package.`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 pl-3 pr-3.5 py-2 rounded-full bg-white/95 hover:bg-white backdrop-blur-xl border border-slate-200/90 hover:border-emerald-500/40 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.12)] hover:shadow-[0_14px_35px_-5px_rgba(16,185,129,0.18)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          aria-label="Chat with Tripvibe Lanka Island Concierge on WhatsApp"
        >
          {/* WhatsApp Icon disc with subtle live pulsing dot */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 group-hover:bg-emerald-600 text-white shadow-xs shrink-0 transition-colors">
            <MessageCircle className="w-4 h-4 fill-white text-white" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </div>

          {/* Typography */}
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
              Chat with Concierge
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
              WhatsApp · {whatsappNum}
            </span>
          </div>

          {/* Circular arrow disc */}
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-500 group-hover:text-white text-slate-400 transition-colors flex items-center justify-center shrink-0 ml-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </a>
      </aside>
    </>
  );
}
