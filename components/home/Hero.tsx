'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface HeroProps {
  onOpenBooking: (packageId?: string) => void;
  onSelectDestination?: (destName: string) => void;
  initialCards?: HeroCardItem[];
}

export interface HeroCardItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  destinationName: string;
}

export default function Hero({ onOpenBooking, onSelectDestination, initialCards }: HeroProps) {
  const [cards, setCards] = useState<HeroCardItem[]>(initialCards || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCards);

  useEffect(() => {
    if (initialCards !== undefined) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadHeroDestinations() {
      try {
        const supabase = createClient();

        // Query active destinations ordered by display_order ASC, created_at DESC
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
            const mappedCards: HeroCardItem[] = data.map((dest) => {
              const cover =
                dest.cover_image && typeof dest.cover_image === 'string' && dest.cover_image.trim().length > 0
                  ? dest.cover_image.trim()
                  : 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80';

              const subtitleText =
                dest.tag?.trim() ||
                dest.district?.trim() ||
                (dest.description?.trim()
                  ? dest.description.trim().slice(0, 52) + (dest.description.length > 52 ? '...' : '')
                  : 'Luxury Private Destination');

              return {
                id: dest.id,
                title: dest.name,
                subtitle: subtitleText,
                image: cover,
                destinationName: dest.name,
              };
            });

            setCards(mappedCards);
          } else {
            setCards([]);
          }
        }
      } catch (err) {
        console.warn('[Hero] Error loading destinations:', err);
        if (isMounted) setCards([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHeroDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (card: HeroCardItem) => {
    if (onSelectDestination) {
      onSelectDestination(card.destinationName);
    }
  };

  return (
    <section id="home" className="relative min-h-[100dvh] w-full flex flex-col justify-between pt-28 sm:pt-32 pb-8 sm:pb-10 overflow-hidden bg-slate-950 rounded-b-2xl sm:rounded-b-3xl md:rounded-b-[32px]">
      {/* Background Image: Mirissa Sunset / Ceylon Landscape */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.webp"
          alt="Sri Lanka Sunrise & Luxury Private Tours"
          fill
          priority={true}
          quality={60}
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
        {/* Subtle Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/20 to-slate-950/75" />
      </div>

      {/* Background Gradient & Fog Effect */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none z-0" />

      {/* 1. Hero Centered Header & Typography */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wide mb-6 shadow-sm">
          <span>Sri Lanka&apos;s Natural Wonder</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-4 leading-tight font-heading drop-shadow-md">
          Unforgettable Sri Lankan <br className="hidden sm:inline" />
          Sunrise &amp; Private Tours
        </h1>
      </div>

      {/* 2. Bottom Floating Destination Cards (Centered & Responsive) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-start sm:justify-center overflow-x-auto pb-6 sm:pb-8 pt-4 px-4 sm:px-6 hide-scrollbar gap-4 mt-auto snap-x snap-mandatory">
        {isLoading ? (
          // Loading Skeleton State
          <div className="flex items-center justify-center gap-4 py-8 w-full">
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-medium shadow-lg">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Loading signature destinations...</span>
            </div>
          </div>
        ) : cards.length === 0 ? (
          // Coming Soon Empty State
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/20 text-center max-w-md mx-auto shadow-2xl">
            <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Signature Circuits Coming Soon</h3>
            <p className="text-xs text-slate-300 mt-1">
              Our private destination itineraries are currently being curated by island specialists.
            </p>
          </div>
        ) : (
          // Live Database Destination Cards
          cards.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations?destination=${encodeURIComponent(dest.destinationName)}`}
              onClick={() => handleCardClick(dest)}
              className="w-[210px] h-[290px] sm:w-[230px] sm:h-[320px] md:w-[250px] md:h-[340px] rounded-3xl shrink-0 snap-center overflow-hidden relative group cursor-pointer border border-white/20 shadow-2xl transition-all duration-300 hover:scale-[1.03] flex flex-col justify-end"
            >
              <Image
                src={dest.image}
                alt={dest.title}
                fill
                quality={65}
                sizes="(max-width: 640px) 180px, 220px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent absolute inset-0" />

              <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div className="relative z-10 p-4 sm:p-5 space-y-1">
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                  {dest.title}
                </h3>
                <p className="text-xs text-slate-200/90 leading-relaxed line-clamp-2">
                  {dest.subtitle}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
