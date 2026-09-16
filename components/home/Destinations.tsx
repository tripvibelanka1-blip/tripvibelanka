'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Destination as DbDestination } from '@/types/database';
import { MapPin, Calendar, ArrowUpRight, Loader2, Compass } from 'lucide-react';

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
const getBentoSpan = (index: number, total: number): string => {
  if (total === 1) return 'col-span-1 md:col-span-3';
  if (total === 2) return 'col-span-1 md:col-span-3';
  if (total === 3) return 'col-span-1';
  return index === 0 || index === 3 ? 'col-span-1 md:col-span-2' : 'col-span-1';
};

// Helper to extract clean landmark name from "Name - Description" or "Name: Description"
const parseAttraction = (raw: string): { title: string; desc?: string } => {
  if (!raw) return { title: '' };
  const match = raw.split(/\s*[-:–—]\s*/);
  if (match.length > 1 && match[0].trim() && match[1].trim()) {
    return {
      title: match[0].trim(),
      desc: match.slice(1).join(' - ').trim(),
    };
  }
  return { title: raw.trim() };
};

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80';

export default function Destinations({
  onSelectDestination,
  initialDestinations,
}: DestinationsProps) {
  const [destinations, setDestinations] = useState<DestinationCardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollLeft = container.scrollLeft;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth : 300;
    const gap = 16;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveCardIndex(Math.min(Math.max(index, 0), destinations.length - 1));
  };

  const scrollToCard = (index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth : 300;
    const gap = 16;
    container.scrollTo({
      left: index * (cardWidth + gap),
      behavior: 'smooth',
    });
    setActiveCardIndex(index);
  };

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

        if (queryRes.error) {
          queryRes = await supabase
            .from('destinations')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(4);
        }

        const data = queryRes.data;

        if (isMounted) {
          if (data && data.length > 0) {
            const mappedDb: DestinationCardItem[] = data.map((item, idx, arr) => {
              const rawAttractions = item.popular_attractions;
              const highlightsList: string[] = Array.isArray(rawAttractions)
                ? (rawAttractions as string[]).filter((h) => typeof h === 'string' && h.trim().length > 0)
                : [];

              const cover =
                item.cover_image && typeof item.cover_image === 'string' && item.cover_image.trim().length > 0
                  ? item.cover_image.trim()
                  : DEFAULT_FALLBACK_IMAGE;

              return {
                id: item.id,
                name: item.name,
                district: item.district || 'Sri Lanka',
                tag: item.tag || 'Popular Destination',
                description: item.description || 'Explore the breathtaking landscapes and cultural heritage.',
                image: cover,
                highlights: highlightsList.length > 0 ? highlightsList : ['Scenic Views', 'Cultural Heritage', 'Iconic Landmarks'],
                bestTimeToVisit: item.best_time_to_visit || 'Year-round',
                bentoSpan: getBentoSpan(idx, arr.length),
              };
            });

            setDestinations(mappedDb.slice(0, 4));
          } else {
            setDestinations([]);
          }
        }
      } catch (err) {
        console.warn('[Destinations] Error loading live destinations:', err);
        if (isMounted) setDestinations([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadActiveDestinations();

    return () => {
      isMounted = false;
    };
  }, [initialDestinations]);

  return (
    <section id="destinations" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
            From Ancient Citadels to <span className="font-semibold text-slate-950">Southern Coasts</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            From the 5th-century clouds of Sigiriya to the turquoise surf of Mirissa, explore the breathtaking diversity of Sri Lanka.
          </p>
        </div>

        {/* Mobile Swipe Cue + Live Counter */}
        {destinations.length > 1 && (
          <div className="sm:hidden flex items-center justify-between pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/60 text-slate-600 font-medium">
              <span>Swipe to discover</span>
              <span className="text-[#FF6B00]">→</span>
            </span>
            <span className="font-mono text-xs font-semibold text-slate-500 tracking-wider">
              {String(activeCardIndex + 1).padStart(2, '0')} / {String(destinations.length).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-16 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
          <span className="text-xs font-semibold text-slate-500 tracking-wide">
            Loading private destinations...
          </span>
        </div>
      ) : destinations.length === 0 ? (
        // Coming Soon Empty State
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00]">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            New Destinations Coming Soon
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
            Our luxury travel specialists are currently curating new destination circuits. Please check back shortly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile: Horizontal Peek Carousel (Pure CSS Scroll-Snap, 120fps) | Desktop: 2-1-1-2 Bento Grid */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 hide-scrollbar snap-x snap-mandatory"
          >
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations?destination=${encodeURIComponent(dest.name)}`}
                onClick={() => onSelectDestination(dest.name)}
                className={`group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/80 bg-slate-900 cursor-pointer w-[86vw] sm:w-[380px] md:w-auto shrink-0 snap-center md:snap-align-none min-h-[460px] sm:min-h-[420px] md:min-h-[360px] flex flex-col justify-between p-6 sm:p-8 ${dest.bentoSpan}`}
              >
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 768px) 86vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/15 pointer-events-none transition-opacity duration-500 group-hover:from-slate-950/90" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/25 shadow-sm">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {dest.tag}
                  </span>

                  <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#FF6B00] group-hover:border-[#FF6B00] group-hover:scale-110 transition-all duration-300 shadow-sm">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

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

                  {/* Refined Landmark Badges: Crisp landmark names with glowing amber accent and informative hover tooltips */}
                  <div className="pt-1.5 flex flex-wrap gap-1.5 items-center">
                    {dest.highlights.slice(0, 3).map((item, idx) => {
                      const { title, desc } = parseAttraction(item);
                      if (!title) return null;
                      return (
                        <span
                          key={idx}
                          title={desc ? `${title}: ${desc}` : title}
                          className="group/chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-100 hover:text-white border border-white/15 hover:border-white/30 transition-all duration-200 cursor-default"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 group-hover/chip:scale-125 transition-transform" />
                          <span className="truncate max-w-[130px] sm:max-w-[190px]">{title}</span>
                        </span>
                      );
                    })}
                    {dest.highlights.length > 3 && (
                      <span
                        title={dest.highlights.slice(3).map((h) => parseAttraction(h).title).join(', ')}
                        className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-white/10 backdrop-blur-md text-white/70 border border-white/15 cursor-default"
                      >
                        +{dest.highlights.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Best Time: <strong className="text-white">{dest.bestTimeToVisit}</strong></span>
                    </span>
                    <span className="text-orange-400 font-semibold group-hover:translate-x-1 transition-transform shrink-0">
                      Explore Destination →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Pagination Indicator Dots */}
          {destinations.length > 1 && (
            <div className="sm:hidden flex items-center justify-center gap-2 pt-2">
              {destinations.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to destination ${idx + 1}`}
                  onClick={() => scrollToCard(idx)}
                  className={`transition-all duration-300 rounded-full h-1.5 ${
                    activeCardIndex === idx
                      ? 'w-7 bg-[#FF6B00]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dedicated Destinations Catalog Link */}
      {destinations.length > 0 && (
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all group cursor-pointer active:scale-[0.98]"
          >
            <MapPin className="w-4 h-4 text-[#FF6B00]" />
            <span>Explore All Regional Destinations &amp; Cultural Guides</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
