'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hide while in the hero section, reveal smoothly when scrolled past 50% of viewport
      if (typeof window !== 'undefined') {
        setShowFloatingCTA(window.scrollY > window.innerHeight * 0.5);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <footer className="w-full bg-white pt-12 overflow-hidden relative border-t border-slate-200/60">
        {/* 1. Links & Metadata Container (Floating over Sky) */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm">
            {/* Top Destinations Column */}
            <div>
              <h4 className="font-semibold text-slate-400 text-xs tracking-wider uppercase mb-3 font-poppins">
                Top Destinations
              </h4>
              <ul className="space-y-2 font-medium text-slate-700">
                <li>
                  <Link href="/destinations/sigiriya" className="hover:text-[#FF6B00] transition-colors">
                    Sigiriya
                  </Link>
                </li>
                <li>
                  <Link href="/destinations/ella" className="hover:text-[#FF6B00] transition-colors">
                    Ella
                  </Link>
                </li>
                <li>
                  <Link href="/destinations/kandy" className="hover:text-[#FF6B00] transition-colors">
                    Kandy
                  </Link>
                </li>
                <li>
                  <Link href="/destinations/galle" className="hover:text-[#FF6B00] transition-colors">
                    Galle
                  </Link>
                </li>
                <li>
                  <Link href="/destinations/mirissa" className="hover:text-[#FF6B00] transition-colors">
                    Mirissa
                  </Link>
                </li>
              </ul>
            </div>

            {/* Tour Packages Column */}
            <div>
              <h4 className="font-semibold text-slate-400 text-xs tracking-wider uppercase mb-3 font-poppins">
                Tour Packages
              </h4>
              <ul className="space-y-2 font-medium text-slate-700">
                <li>
                  <Link href="/tours/cultural" className="hover:text-[#FF6B00] transition-colors">
                    Cultural Highlights
                  </Link>
                </li>
                <li>
                  <Link href="/tours/safari" className="hover:text-[#FF6B00] transition-colors">
                    Yala Wild Safari
                  </Link>
                </li>
                <li>
                  <Link href="/tours/hill-country" className="hover:text-[#FF6B00] transition-colors">
                    Hill Country Escapes
                  </Link>
                </li>
                <li>
                  <Link href="/tours/beach" className="hover:text-[#FF6B00] transition-colors">
                    Southern Coast & Surf
                  </Link>
                </li>
              </ul>
            </div>

            {/* Fleet & Support Column */}
            <div>
              <h4 className="font-semibold text-slate-400 text-xs tracking-wider uppercase mb-3 font-poppins">
                Fleet & Support
              </h4>
              <ul className="space-y-2 font-medium text-slate-700">
                <li>
                  <Link href="/fleet" className="hover:text-[#FF6B00] transition-colors">
                    Cars & Sedans
                  </Link>
                </li>
                <li>
                  <Link href="/fleet" className="hover:text-[#FF6B00] transition-colors">
                    Luxury Vans & Coaches
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="hover:text-[#FF6B00] transition-colors">
                    Online Booking Guide
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#FF6B00] transition-colors">
                    24/7 Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* About Column */}
            <div>
              <h4 className="font-semibold text-slate-400 text-xs tracking-wider uppercase mb-3 font-poppins">
                Tripvibe Lanka
              </h4>
              <ul className="space-y-2 font-medium text-slate-700">
                <li>
                  <Link href="/about" className="hover:text-[#FF6B00] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#FF6B00] transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[#FF6B00] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cancellation" className="hover:text-[#FF6B00] transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Bar directly above the artwork */}
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 pt-2 pb-2">
            <p>© Copyright 2026 Tripvibe Lanka. All rights reserved.</p>
            <p className="flex items-center gap-1 font-medium">
              ❤️ Made with love in Sri Lanka
            </p>
          </div>
        </div>

        {/* 2. Illustration Banner (Pulled up under copyright line) */}
        <div className="w-full relative h-[260px] sm:h-[340px] md:h-[400px] -mt-12 z-0 pointer-events-none select-none">
          <Image
            alt="Sri Lanka Landscape"
            className="object-cover object-top"
            fill
            priority
            src="/images/sri-lanka-footer-illustration.png"
            sizes="100vw"
          />
        </div>
      </footer>

      {/* Floating Sticky WhatsApp Concierge CTA (Hidden in Hero, fades in on scroll) */}
      <aside
        aria-label="Quick contact"
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 transition-all duration-500 ease-out ${
          showFloatingCTA
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <a
          href="https://wa.me/94770000000?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20tour%20package."
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 pl-3 pr-3.5 py-2 rounded-full bg-white/95 hover:bg-white backdrop-blur-xl border border-slate-200/90 hover:border-emerald-500/40 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.12)] hover:shadow-[0_14px_35px_-5px_rgba(16,185,129,0.18)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          aria-label="Chat with Tripvibe Lanka Island Concierge on WhatsApp"
        >
          {/* WhatsApp Icon disc with subtle live dot */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 group-hover:bg-emerald-600 text-white shadow-xs shrink-0 transition-colors">
            <MessageCircle className="w-4 h-4 fill-white text-white" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>

          {/* Typography */}
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
              Chat with Concierge
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
              WhatsApp · 24/7 Available
            </span>
          </div>

          {/* Subtle circular arrow disc */}
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-500 group-hover:text-white text-slate-400 transition-colors flex items-center justify-center shrink-0 ml-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </a>
      </aside>
    </>
  );
}
