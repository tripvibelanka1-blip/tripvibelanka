'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Currency } from '@/types/tourism';
import { TOUR_PACKAGES } from '@/data/mockData';
import { useCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle2, ArrowUpRight, MapPin } from 'lucide-react';

interface TourPackagesProps {
  currency: Currency;
  onSelectPackage: (packageId: string) => void;
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
}

export default function TourPackages({ currency, onSelectPackage }: TourPackagesProps) {
  const { exchangeRate } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [packages, setPackages] = useState<TourCardItem[]>(TOUR_PACKAGES);

  const categories = ['All', 'Cultural', 'Wildlife', 'Coastal', 'Hill Country'];

  useEffect(() => {
    let isMounted = true;

    async function loadActiveTours() {
      try {
        const supabase = createClient();

        // Query active tours ordered by display_order then recency
        let queryRes = await supabase
          .from('tours')
          .select('*, destinations(name)')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        // Resilient fallback if display_order or category column isn't migrated yet
        if (queryRes.error) {
          queryRes = await supabase
            .from('tours')
            .select('*, destinations(name)')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        }

        const data = queryRes.data;

        if (isMounted && data && data.length > 0) {
          const mappedDb: TourCardItem[] = data.map((item) => {
            const rawHighlights = item.highlights;
            const highlightsList: string[] = Array.isArray(rawHighlights)
              ? (rawHighlights as string[]).filter((h) => typeof h === 'string' && h.trim().length > 0)
              : [];

            const rawLocations = item.locations;
            let locationsList: string[] = [];
            if (Array.isArray(rawLocations) && rawLocations.length > 0) {
              locationsList = (rawLocations as string[]).filter((loc) => typeof loc === 'string' && loc.trim().length > 0);
            } else if (item.destinations && (item.destinations as { name?: string }).name) {
              locationsList = [(item.destinations as { name: string }).name];
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
            };
          });

          // If database has 3 or more, display database tours exclusively
          if (mappedDb.length >= 3) {
            setPackages(mappedDb);
          } else {
            // Merge database tours with mock tours without duplicate titles
            const dbTitles = new Set(mappedDb.map((t) => t.title.toLowerCase()));
            const remainingMocks = TOUR_PACKAGES.filter(
              (m) => !dbTitles.has(m.title.toLowerCase())
            );
            setPackages([...mappedDb, ...remainingMocks]);
          }
        }
      } catch (err) {
        console.warn('[TourPackages] Error loading live tours, using resilient fallback:', err);
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
              Signature <span className="font-semibold text-slate-950">Private Tour Packages</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Every package is 100% private and customizable. Enjoy executive vehicle transport, certified chauffeur guides, and handpicked luxury stays.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B00] text-white shadow-sm shadow-orange-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tour Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Container - Clean photography without noisy text overlays */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Single Discreet Top Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-950/70 backdrop-blur-md text-white border border-white/20 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {pkg.duration}
                    </span>
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
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[#FF6B00] transition-colors leading-snug">
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

                <button
                  onClick={() => onSelectPackage(pkg.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <span>Reserve Tour</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
