'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Shield, RefreshCw, MessageCircle, Phone, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { useCurrency } from '@/context/CurrencyContext';

interface PolicyLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  activeSlug: 'terms' | 'privacy' | 'refund-policy';
  children: React.ReactNode;
}

const POLICY_TABS = [
  {
    name: 'Terms & Conditions',
    href: '/terms',
    slug: 'terms',
    icon: FileText,
  },
  {
    name: 'Privacy Policy',
    href: '/privacy',
    slug: 'privacy',
    icon: Shield,
  },
  {
    name: 'Refund & Cancellation',
    href: '/refund-policy',
    slug: 'refund-policy',
    icon: RefreshCw,
  },
];

export default function PolicyLayout({
  title,
  subtitle,
  lastUpdated,
  activeSlug,
  children,
}: PolicyLayoutProps) {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-body antialiased selection:bg-orange-500/20 selection:text-orange-950">
      {/* Universal Solid Navbar */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => router.push('/booking')}
        forceSolid
      />

      <main className="flex-1 pt-28 sm:pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-slate-500">
              <li>
                <Link href="/" className="hover:text-[#FF6B00] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </li>
              <li className="text-slate-400">Legal &amp; Policies</li>
              <li>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </li>
              <li className="text-slate-900 font-medium truncate max-w-[200px]">
                {title}
              </li>
            </ol>
          </nav>

          {/* Editorial Header */}
          <div className="border-b border-slate-200/80 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF6B00] border border-orange-200/60 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
              <span>Official Tripvibe Lanka Policy</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 font-heading">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 bg-white border border-slate-200/80 px-2.5 py-1 rounded-md shadow-2xs">
                {lastUpdated}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PayHere Merchant Verified
              </span>
            </div>

            {/* Quick Switcher Navigation Tabs */}
            <div className="mt-8 flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              {POLICY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSlug === tab.slug;
                return (
                  <Link
                    key={tab.slug}
                    href={tab.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF6B00]' : 'text-slate-400'}`} />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Policy Document Content Card */}
          <article className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs text-slate-800 text-sm sm:text-base leading-relaxed space-y-8">
            {children}
          </article>

          {/* Contact & Support Section Card */}
          <div className="mt-10 rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">
                  Need Help or Clarification?
                </div>
                <h3 className="text-xl font-bold font-heading">
                  Contact Our Direct Island Concierge
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                  Our Colombo support team is available 24/7 to assist with your bookings, payment queries, or policy questions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="https://wa.me/94761560046?text=Hello%20Tripvibe%20Lanka!%20I%20have%20a%20question%20regarding%20your%20terms%20and%20policies."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-semibold text-xs shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp: 076 156 0046</span>
                </a>

                <a
                  href="tel:+94761560046"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-semibold text-xs border border-white/10"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+94 76 156 0046</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer onOpenBooking={() => router.push('/booking')} />
    </div>
  );
}
