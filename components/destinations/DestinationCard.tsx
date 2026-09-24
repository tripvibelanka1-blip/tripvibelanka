'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SchemaScript } from '../SchemaScript';
import {
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  Compass,
} from 'lucide-react';
import { DestinationItem, LinkedTourSummary } from './DestinationDetailDrawer';

interface DestinationCardProps {
  destination: DestinationItem;
  linkedToursCount?: number;
  onOpenDrawer: (destination: DestinationItem) => void;
  onOpenBooking: (destinationName: string) => void;
  isPriority?: boolean;
}

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80';

// Helper to extract clean attraction title
function parseAttractionTitle(raw: string): string {
  if (!raw) return '';
  const match = raw.split(/\s*[-:–—]\s*/);
  return match[0].trim();
}

export default function DestinationCard({
  destination,
  linkedToursCount = 0,
  onOpenDrawer,
  onOpenBooking,
  isPriority = false,
}: DestinationCardProps) {
  const coverUrl = destination.cover_image?.trim() || DEFAULT_COVER;

  const attractions = Array.isArray(destination.popular_attractions)
    ? destination.popular_attractions
        .filter((a) => typeof a === 'string' && a.trim().length > 0)
        .slice(0, 3)
    : [];

  return (
    <article className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-orange-200/80 transition-all duration-300">
      <SchemaScript
        schema={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          "name": destination.name,
          "description": destination.description || destination.tag || "",
          "url": `https://www.tripvibelanka.com/destinations/${destination.id}`,
          "image": coverUrl,
          "touristType": "Leisure tourists, Luxury travellers",
          "includesAttraction": {
            "@type": "TouristAttraction",
            "name": destination.name,
            "containedInPlace": {
              "@type": "Country",
              "name": "Sri Lanka"
            }
          }
        }}
      />
      {/* Visual Cover Header */}
      <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-stone-100">
        <Image
          src={coverUrl}
          alt={destination.name}
          fill
          quality={65}
          priority={isPriority}
          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 32vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2">
          {destination.tag ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-stone-800 shadow-xs border border-white/40">
              <Sparkles className="w-3 h-3 text-[#FF6B00]" />
              <span>{destination.tag}</span>
            </span>
          ) : (
            <span />
          )}

          {destination.best_time_to_visit && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20">
              <Calendar className="w-3 h-3 text-amber-300" />
              <span>{destination.best_time_to_visit}</span>
            </span>
          )}
        </div>

        {/* Bottom Image Overlay Text */}
        <div className="absolute bottom-4 inset-x-4 space-y-1 text-white">
          <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="truncate">{destination.district || 'Sri Lanka'}</span>
          </p>
          <h3 className="text-xl sm:text-2xl font-bold font-heading leading-snug drop-shadow-xs">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          {/* Editorial Excerpt */}
          {destination.description && (
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
              {destination.description}
            </p>
          )}

          {/* Key Attractions Quick Pills */}
          {attractions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-600">
                Top Landmarks
              </span>
              <div className="flex flex-wrap gap-1.5">
                {attractions.map((att, i) => {
                  const title = parseAttractionTitle(att);
                  return (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-50 border border-stone-200/80 text-stone-700"
                    >
                      {title}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Linked Tours Indicator */}
          {linkedToursCount > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70">
              <Compass className="w-3.5 h-3.5" />
              <span>
                {linkedToursCount} Private {linkedToursCount === 1 ? 'Tour' : 'Tours'} Available
              </span>
            </div>
          )}
        </div>

        {/* Card Action Buttons */}
        <div className="pt-4 border-t border-stone-100 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenDrawer(destination)}
            className="flex-1 py-2.5 px-3 rounded-full text-xs font-semibold border border-stone-300 hover:border-stone-400 text-stone-800 bg-white hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <span>Explore Dossier</span>
          </button>

          <Link
            href={`/booking?destination=${encodeURIComponent(destination.name)}`}
            className="flex-1 py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] shadow-sm shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>Plan Journey</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
