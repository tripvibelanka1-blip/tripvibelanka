'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Currency } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle2, ArrowUpRight, MapPin, Loader2, Sparkles, Compass, User, Users, Heart } from 'lucide-react';

interface TourPackagesProps {
  currency: Currency;
  onSelectPackage?: (packageId: string) => void;
}

interface TourCardItem {
  id: string;
  title: string;
  tagline: string;
  duration: string;
  image: string;
  category: string;
  featured?: boolean;
  locations: string[];
  highlights: string[];
  priceUSD: number;
  priceLKR: number;
  min_guests?: number;
  max_guests?: number | null;
  guest_policy?: string | null;
}

export default function TourPackages({ currency, onSelectPackage }: TourPackagesProps) {
  const { exchangeRate } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [packages, setPackages] = useState<TourCardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const categories = ['All', 'Signature', 'Cultural', 'Wildlife', 'Coastal', 'Hill Country'];

  useEffect(() => {
    let isMounted = true;

    async function loadActiveTours() {
      try {
        const supabase = createClient();

        // Fetch live active tours and destinations in parallel
        const [toursRes, destRes] = await Promise.all([
          supabase
            .from('tours')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false }),
          supabase
            .from('destinations')
            .select('id, name'),
        ]);

        let data = toursRes.data;
        if (toursRes.error) {
          console.warn('[TourPackages] Notice on primary tours query, attempting fallback:', toursRes.error);
          const fallbackRes = await supabase
            .from('tours')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          data = fallbackRes.data;
        }

        const destMap = new Map((destRes.data || []).map((d: { id: string; name: string }) => [d.id, d.name]));

        if (isMounted) {
          if (data && data.length > 0) {
            const mappedDb: TourCardItem[] = data.map((item: any) => {
              const rawHighlights = item.highlights;
              const highlightsList: string[] = Array.isArray(rawHighlights)
                ? (rawHighlights as string[]).filter((h) => typeof h === 'string' && h.trim().length > 0)
                : [];

              const rawLocations = item.locations;
              let locationsList: string[] = [];
              if (Array.isArray(rawLocations) && rawLocations.length > 0) {
                locationsList = (rawLocations as string[]).filter((loc) => typeof loc === 'string' && loc.trim().length > 0);
              } else if (item.destination_id && destMap.has(item.destination_id)) {
                locationsList = [destMap.get(item.destination_id)!];
              } else {
                locationsList = ['All Island Tour'];
              }

              const cover =
                item.cover_image ||
                (Array.isArray(item.gallery_images) && item.gallery_images.length > 0
                  ? (item.gallery_images[0] as string)
                  : 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80');

              const durationNights = item.duration_nights || 0;
              const durationText =
                durationNights > 0
                  ? `${item.duration_days} Days / ${durationNights} Nights`
                  : `${item.duration_days} Day Tour`;

              return {
                id: item.id,
                title: item.title,
                tagline: item.tagline || item.description || 'Private luxury chauffeured tour with licensed guides.',
                duration: durationText,
                image: cover,
                category: item.category || 'Cultural',
                featured: Boolean(item.is_featured),
                locations: locationsList,
                highlights:
                  highlightsList.length > 0
                    ? highlightsList
                    : ['Executive AC vehicle & driver guide', 'Handpicked luxury stays', 'Private scenic excursions'],
                priceUSD: Number(item.price_usd) || 0,
                priceLKR: Number(item.price_lkr) || 0,
                min_guests: item.min_guests ?? 1,
                max_guests: item.max_guests ?? null,
                guest_policy: item.guest_policy || null,
              };
            });

            setPackages(mappedDb);
          } else {
            setPackages([]);
          }
        }
      } catch (err) {
        console.warn('[TourPackages] Error loading live tours:', err);
        if (isMounted) setPackages([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadActiveTours();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPackages = selectedCategory === 'All'
    ? packages
    : packages.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (cat === sel) return true;
        if (sel === 'cultural' && cat === 'signature') return true;
        if (sel === 'signature' && cat === 'cultural') return true;
        return false;
      });

  const formatPrice = (pkg: TourCardItem) => {
    if (currency === 'USD') {
      return `$${pkg.priceUSD.toLocaleString()}`;
    }
    const lkr = pkg.priceLKR > 0 ? pkg.priceLKR : Math.round(pkg.priceUSD * exchangeRate);
    return `Rs. ${lkr.toLocaleString()}`;
  };

  return (
    <section id="tours" className="py-24 bg-slate-50/60 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Filter Tabs */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
              Signature <span className="font-semibold text-slate-950">Private Tour Packages</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Every package is 100% private and customizable. Enjoy executive vehicle transport, certified chauffeur guides, and handpicked luxury stays.
            </p>
          </div>

          {/* Category Filter Pills (Optimized desktop single-row track with smooth swipe on smaller screens) */}
          <div className="w-full xl:w-auto overflow-x-auto hide-scrollbar pb-1 self-start xl:self-auto">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white border border-slate-200 shadow-xs whitespace-nowrap min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 select-none ${
                    selectedCategory === cat
                      ? 'bg-[#FF6B00] text-white shadow-sm shadow-orange-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-16 rounded-3xl bg-white border border-slate-200/80 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
            <span className="text-xs font-semibold text-slate-500 tracking-wide">
              Loading signature tour packages...
            </span>
          </div>
        ) : packages.length === 0 ? (
          // Coming Soon Empty State
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Tour Packages Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
              Our signature multi-day itineraries and private chauffeur circuits are currently being crafted. Contact our concierge for custom bespoke itineraries.
            </p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/70 p-8">
            <p className="text-sm font-medium text-slate-600">
              No tour packages listed under &ldquo;{selectedCategory}&rdquo; at the moment.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-3 text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
            >
              View all packages
            </button>
          </div>
        ) : (
          // Tour Cards Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      quality={65}
                      sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, 30vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-950/70 backdrop-blur-md text-white border border-white/20 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {pkg.duration}
                      </span>
                      {pkg.guest_policy === 'solo' || (pkg.min_guests === 1 && pkg.max_guests === 1) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/90 backdrop-blur-md text-white border border-white/20 shadow-xs">
                          <User className="w-3 h-3 text-sky-100" />
                          <span>Solo</span>
                        </span>
                      ) : pkg.guest_policy === 'couple' || (pkg.min_guests === 2 && pkg.max_guests === 2) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/90 backdrop-blur-md text-white border border-white/20 shadow-xs">
                          <Heart className="w-3 h-3 text-rose-100" />
                          <span>Couple</span>
                        </span>
                      ) : pkg.guest_policy === 'family' || (pkg.min_guests && pkg.min_guests >= 3) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/90 backdrop-blur-md text-white border border-white/20 shadow-xs">
                          <Users className="w-3 h-3 text-emerald-100" />
                          <span>Family ({pkg.min_guests}{pkg.max_guests ? `–${pkg.max_guests}` : '+'})</span>
                        </span>
                      ) : null}
                    </div>

                    {pkg.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B00] text-white shadow-sm">
                          Curated
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    {/* Locations Row */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{pkg.locations.join(' · ')}</span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[#FF6B00] transition-colors leading-snug font-heading">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {pkg.tagline}
                      </p>
                    </div>

                    {/* Highlights Bullets */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <ul className="space-y-1.5">
                        {pkg.highlights.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & CTA */}
                <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Starting From
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                        {formatPrice(pkg)}
                      </span>
                      <span className="text-xs text-slate-500">/ person</span>
                    </div>
                  </div>

                  <Link
                    href={`/booking?package=${pkg.id}`}
                    onClick={() => onSelectPackage?.(pkg.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    <span>Reserve Tour</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dedicated Tour Packages Catalog Link */}
        {packages.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 text-xs sm:text-sm font-semibold tracking-wide shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-[#FF6B00] group-hover:text-white transition-colors shrink-0" />
              <span>Explore All Tour Packages &amp; Itineraries</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
