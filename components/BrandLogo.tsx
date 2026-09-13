'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  /**
   * Display style:
   * - 'sidebar': Emblem + brand typography + operations sub-badge
   * - 'login': Centered emblem with radiant ambient glow + bold brand title
   * - 'header': Compact emblem + title for navigation bars
   * - 'emblem': Icon-only square/rounded avatar
   */
  variant?: 'sidebar' | 'login' | 'header' | 'emblem';
  /** Optional link destination, defaults to '/admin' for admin usage */
  href?: string;
  className?: string;
  subtext?: string;
}

export default function BrandLogo({
  variant = 'sidebar',
  href,
  className = '',
  subtext,
}: BrandLogoProps) {
  const content = (() => {
    switch (variant) {
      case 'emblem':
        return (
          <div className={`relative w-9 h-9 rounded-xl overflow-hidden border border-orange-500/20 bg-white shadow-sm flex items-center justify-center p-0.5 ${className}`}>
            <Image
              src="/logo.jpeg"
              alt="TripVibe Lanka"
              width={36}
              height={36}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        );

      case 'login':
        return (
          <div className={`flex flex-col items-center text-center ${className}`}>
            <div className="relative mb-4">
              {/* Warm Ambient Brand Glow behind logo */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-amber-600/20 rounded-3xl blur-lg -z-10 opacity-70" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 shadow-xl shadow-orange-950/10 border border-orange-100 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.jpeg"
                  alt="TripVibe Lanka"
                  width={96}
                  height={96}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-slate-900 tracking-tight">
              <span>Tripvibe</span>
              <span className="text-[#FF6B00]">Lanka</span>
            </div>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {subtext || 'Admin & Operations Portal'}
            </p>
          </div>
        );

      case 'header':
        return (
          <div className={`flex items-center gap-2.5 ${className}`}>
            <div className="w-8 h-8 rounded-lg bg-white border border-orange-200/60 p-0.5 shadow-xs overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.jpeg"
                alt="TripVibe Lanka"
                width={32}
                height={32}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                Tripvibe<span className="text-[#FF6B00]">Lanka</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                {subtext || 'Admin'}
              </span>
            </div>
          </div>
        );

      case 'sidebar':
      default:
        return (
          <div className={`flex items-center gap-3 ${className}`}>
            {/* Emblem Container with subtle warm border */}
            <div className="w-10 h-10 rounded-xl bg-white border border-orange-200/80 p-0.5 shadow-sm shadow-orange-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image
                src="/logo.jpeg"
                alt="TripVibe Lanka"
                width={40}
                height={40}
                className="object-contain w-full h-full"
                priority
              />
            </div>

            {/* Typography */}
            <div className="flex flex-col min-w-0">
              <div className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
                Tripvibe<span className="text-[#FF6B00]">Lanka</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700/80">
                  {subtext || 'Operations'}
                </span>
              </div>
            </div>
          </div>
        );
    }
  })();

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
