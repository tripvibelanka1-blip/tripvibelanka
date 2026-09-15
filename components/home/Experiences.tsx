'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Currency, Experience } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Loader2, Sparkles, Compass, ArrowUpRight } from 'lucide-react';

interface ExperiencesProps {
  currency: Currency;
  onSelectExperience: (exp: Experience) => void;
}

export default function Experiences({ currency, onSelectExperience }: ExperiencesProps) {
  const { exchangeRate } = useCurrency();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveExperiences() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('activities')
          .select('*, destination:destinations(name)')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Experiences] Supabase query notice:', error.message);
          if (isMounted) setExperiences([]);
          return;
        }

        if (isMounted) {
          if (data && data.length > 0) {
            const mapped: Experience[] = data.map((act) => {
              const destName = act.destination?.name || 'Sri Lanka';
              const loc = act.location?.trim() || destName;
              const priceNum = Number(act.price) || 0;
              const priceLkrNum =
                Number(act.price_lkr) || Math.round(priceNum * (exchangeRate || 310));
              const img =
                act.cover_image ||
                (Array.isArray(act.gallery_images) && act.gallery_images.length > 0
                  ? act.gallery_images[0]
                  : 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80');

              return {
                id: act.id,
                title: act.title,
                duration: act.duration || 'Half Day Excursion',
                category: act.category || 'Wildlife & Nature',
                priceUSD: priceNum,
                priceLKR: priceLkrNum,
                image: img,
                description:
                  act.description ||
                  'Experience the authentic charm and natural splendor of Sri Lanka with our bespoke local guides.',
                location: loc,
              };
            });

            setExperiences(mapped);
          } else {
            setExperiences([]);
          }
        }
      } catch (err) {
        console.warn('[Experiences] Error fetching live activities:', err);
        if (isMounted) setExperiences([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLiveExperiences();

    return () => {
      isMounted = false;
    };
  }, [exchangeRate]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatPrice = (exp: Experience) => {
    if (currency === 'USD') {
      return `$${exp.priceUSD}`;
    }
    const lkr = exp.priceLKR || Math.round(exp.priceUSD * exchangeRate);
    return `Rs. ${lkr.toLocaleString()}`;
  };

  return (
    <section id="experiences" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
            Authentic Island <span className="font-semibold text-slate-950">Experiences &amp; Add-ons</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Curate your journey with exclusive activities. Add safaris, sunrise climbs, cooking classes, or tea tastings to any custom itinerary.
          </p>
        </div>

        {/* Scroll Arrows */}
        {experiences.length > 0 && !isLoading && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-16 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
          <span className="text-xs font-semibold text-slate-500 tracking-wide">
            Loading island activities &amp; experiences...
          </span>
        </div>
      ) : experiences.length === 0 ? (
        // Coming Soon Empty State
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Experiences Coming Soon
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
            Our safari tracking, tea tasting, and cultural excursions are currently being finalized. Contact our concierge for personalized activity arrangements.
          </p>
        </div>
      ) : (
        // Carousel Container (Live Server Experiences)
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 hide-scrollbar snap-x snap-mandatory"
        >
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between shrink-0 snap-start group"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    sizes="320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Top Category Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-950/70 backdrop-blur-md text-white border border-white/20">
                      {exp.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Meta (Location & Duration) */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span className="truncate max-w-[140px] font-medium text-slate-600">{exp.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exp.duration}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#FF6B00] transition-colors leading-snug font-heading">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Add Button */}
              <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Price</span>
                  <span className="text-base font-bold text-slate-900 font-heading">
                    {formatPrice(exp)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectExperience(exp)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-[#FF6B00] bg-orange-50 hover:bg-[#FF6B00] hover:text-white transition-all cursor-pointer border border-orange-200/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Trip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dedicated Experiences Catalog Link */}
      {experiences.length > 0 && (
        <div className="mt-12 text-center">
          <Link
            href="/experiences"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all group cursor-pointer active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-[#FF6B00]" />
            <span>Explore All Handcrafted Experiences &amp; Activities</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
