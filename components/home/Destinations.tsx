'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DESTINATIONS } from '@/data/mockData';
import { createClient } from '@/utils/supabase/client';
import { Destination as DbDestination } from '@/types/database';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';

interface DestinationsProps {
  onSelectDestination: (destName: string) => void;
  initialDestinations?: DbDestination[];
}

interface DestinationCardItem {
  id: string;
  name: string;
  district: string;
  tag: string;
  description: string;
  image: string;
  highlights: string[];
  bestTimeToVisit: string;
  bentoSpan: string;
}

// Helper to determine bento grid span for 4 cards (2-1-1-2 grid layout)
const getBentoSpan = (index: number): string => {
  return index === 0 || index === 3 ? 'col-span-1 md:col-span-2' : 'col-span-1';
};

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80';

export default function Destinations({
  onSelectDestination,
  initialDestinations,
}: DestinationsProps) {
  // Initialize with mock destinations to ensure instant zero-CLS first paint
  const [destinations, setDestinations] = useState<DestinationCardItem[]>(DESTINATIONS);

  useEffect(() => {
    let isMounted = true;

    async function loadActiveDestinations() {
      try {
        const supabase = createClient();

        // Query active destinations ordered by display_order then recency
        let queryRes = await supabase
          .from('destinations')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(4);

        // Resilient fallback if display_order column isn't migrated yet
        if (queryRes.error) {
          queryRes = await supabase
            .from('destinations')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(4);
        }

        const data = queryRes.data;

        if (isMounted && data && data.length > 0) {
          const mappedDb: DestinationCardItem[] = data.map((item, idx) => {
            const rawAttractions = item.popular_attractions;
            const highlightsList: string[] = Array.isArray(rawAttractions)
              ? (rawAttractions as string[]).filter((h) => typeof h === 'string' && h.trim().length > 0)
              : [];

            const cover =
              item.cover_image ||
              (Array.isArray(item.gallery_images) && item.gallery_images.length > 0
                ? (item.gallery_images[0] as string)
                : DEFAULT_FALLBACK_IMAGE);

            return {
              id: item.id,
              name: item.name,
              district: item.district || 'Sri Lanka',
              tag: item.tag || 'Popular Destination',
              description: item.description || 'Explore the breathtaking landscapes and cultural heritage.',
              image: cover,
              highlights: highlightsList.length > 0 ? highlightsList : ['Scenic Views', 'Cultural Heritage', 'Iconic Landmarks'],
              bestTimeToVisit: item.best_time_to_visit || 'Year-round',
              bentoSpan: getBentoSpan(idx),
            };
          });

          // If database has 4 or more, display top 4 exclusively
          if (mappedDb.length >= 4) {
            setDestinations(mappedDb.slice(0, 4));
          } else {
            // If database has 1-3 destinations, prepend them and fill remaining slots from mockData
            const dbNames = new Set(mappedDb.map((d) => d.name.toLowerCase()));
            const remainingMocks = DESTINATIONS.filter(
              (m) => !dbNames.has(m.name.toLowerCase())
            );
            const combined = [...mappedDb, ...remainingMocks].slice(0, 4).map((item, idx) => ({
              ...item,
              bentoSpan: getBentoSpan(idx),
            }));
            setDestinations(combined);
          }
        }
      } catch (err) {
        console.warn('[Destinations] Error loading live destinations, using resilient fallback:', err);
      }
    }

    loadActiveDestinations();

    return () => {
      isMounted = false;
    };
  }, [initialDestinations]);

  return (
    <section id="destinations" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header: Clean Vertical Stack */}
      <div className="max-w-2xl mb-12 space-y-3">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
          From Ancient Citadels to <span className="font-semibold text-slate-950">Southern Coasts</span>
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          From the 5th-century clouds of Sigiriya to the turquoise surf of Mirissa, explore the breathtaking diversity of Sri Lanka.
        </p>
      </div>

      {/* Bento Grid (Top 4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => onSelectDestination(dest.name)}
            className={`group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/80 bg-slate-900 cursor-pointer min-h-[360px] flex flex-col justify-between p-6 sm:p-8 ${dest.bentoSpan}`}
          >
            {/* Background Image with Hover Scale */}
            <Image
              src={dest.image}
              alt={dest.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
            />

            {/* Dark Gradient Overlay for optimal legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20 pointer-events-none" />

            {/* Top Row: Tag badge + Arrow Icon */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white border border-white/20">
                <MapPin className="w-3 h-3 text-amber-400" />
                {dest.tag}
              </span>

              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#FF6B00] group-hover:border-[#FF6B00] group-hover:scale-110 transition-all duration-300">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-10 space-y-3 pt-12">
              <div className="space-y-1">
                <span className="text-xs font-medium text-amber-400">
                  {dest.district}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight group-hover:text-orange-200 transition-colors">
                  {dest.name}
                </h3>
              </div>

              <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                {dest.description}
              </p>

              {/* Highlights Micro-Badges */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {dest.highlights.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/40 backdrop-blur-sm text-slate-200 border border-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Best Season */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Best Time: <strong className="text-white">{dest.bestTimeToVisit}</strong>
                </span>
                <span className="text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Explore Packages →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
