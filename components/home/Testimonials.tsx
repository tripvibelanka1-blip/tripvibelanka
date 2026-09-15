'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, ArrowUpRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface RealReview {
  id: string;
  name: string;
  location: string;
  flag: string;
  rating: number;
  title: string;
  quote: string;
  date: string;
  travelType: string;
}

interface DestinationPhotoItem {
  id: string;
  name: string;
  district: string;
  image: string;
}

// Official TripAdvisor SVG Icon
function TripAdvisorIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Tripadvisor">
      <path d="M19.34 7.15c-1.22 0-2.31.5-3.1 1.3a7.48 7.48 0 0 0-8.48 0c-.79-.8-1.88-1.3-3.1-1.3C2.08 7.15.5 8.73.5 10.69c0 1.96 1.58 3.54 3.54 3.54.34 0 .66-.05.97-.14a7.46 7.46 0 0 0 13.98 0c.31.09.63.14.97.14 1.96 0 3.54-1.58 3.54-3.54 0-1.96-1.58-3.54-3.54-3.54zM4.04 12.83c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14zm7.96 3.86a5.97 5.97 0 0 1-5.69-4.14c.54-.38 1.16-.65 1.83-.78a4.13 4.13 0 0 1 7.72 0c.67.13 1.29.4 1.83.78a5.97 5.97 0 0 1-5.69 4.14zm7.96-3.86c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14z" />
      <circle cx="4.04" cy="10.69" r="1.1" />
      <circle cx="19.96" cy="10.69" r="1.1" />
      <circle cx="12" cy="7.2" r="1" />
    </svg>
  );
}

const TRIPADVISOR_URL =
  'https://www.tripadvisor.com/Attraction_Review-g293962-d33287122-Reviews-Trip_Vibe_Lanka-Colombo_Western_Province.html';

// 100% Real, Authenticated Reviews from Tripadvisor Profile
const REAL_TRIPADVISOR_REVIEWS: RealReview[] = [
  {
    id: 'rev-1',
    name: 'Esmablb',
    location: 'Independent Traveler',
    flag: '🇫🇷',
    rating: 5,
    title: 'The perfect trip to Sri Lanka',
    travelType: 'Couples',
    quote:
      'A real journey out of time, that we are not about to forget. None of this would have been possible without Luka and Micha, two absolutely extraordinary people. Much more than just guides, they accompanied us with passion, generosity and authenticity. We shared unique, heartfelt moments and experienced total immersion in the real Sri Lanka, away from mass tourism. The route was perfectly thought out: mountains, waterfalls, paradisiacal beaches, everything was there. I recommend them with your eyes closed!',
    date: 'March 2026',
  },
  {
    id: 'rev-2',
    name: 'Leonardo B.',
    location: 'Verified Guest',
    flag: '🇮🇹',
    rating: 5,
    title: 'Great drivers for a great travel experience',
    travelType: 'Couples',
    quote:
      'These guys are the best, we travelled around Sri Lanka with them on a 11 days itinerary and they did their best to make our experience as nice as they could, thoughtfully showing us hidden spots and helping us optimize our time, thank you very much guys for the trip together, started as drivers, ended as friends ❤️',
    date: 'January 2026',
  },
  {
    id: 'rev-3',
    name: 'Hadi Al-Hashimi',
    location: 'Kuala Lumpur, Malaysia',
    flag: '🇲🇾',
    rating: 5,
    title: 'A Soulful Journey Through Sri Lanka',
    travelType: '10 Days Tour',
    quote:
      'More Than a Holiday, A Journey of the Heart with Trip Vibe Lanka. What made this adventure truly special was the passion and warmth of Trip Vibe Lanka. Luca and Mishal went above and beyond. From arranging breathtaking views, ensuring amazing local halal-friendly meals, to personal touches that made me feel safe, respected, and genuinely cared for. They didn’t just plan a tour; they delivered an experience.',
    date: 'July 2025',
  },
  {
    id: 'rev-4',
    name: 'Departure42728',
    location: 'United Kingdom',
    flag: '🇬🇧',
    rating: 5,
    title: '5 days tour with Director Abdul',
    travelType: 'Family Journey',
    quote:
      'Very professional company. We were picked up by our Director Abdul who greeted us with garlands of flowers at the airport. Everything went well and the hotels are perfect with scenic location. Abdul was very informative and fun to be with, took us to many special places. The spice garden and elephants were the highlight, we really enjoyed every part of the tour.',
    date: 'August 2025',
  },
  {
    id: 'rev-5',
    name: 'Mazen E.',
    location: 'Holiday Guest',
    flag: '🇦🇪',
    rating: 5,
    title: 'Great experience from start to finish',
    travelType: '5-Day Package',
    quote:
      'We booked a 5-day, 4-night package with Trip Vibe Lanka and it was truly an amazing experience. Everything was well organized, from start to finish. The team was responsive, professional, and made sure every detail was taken care of, which made our trip completely stress-free. If you are planning your next holiday, I highly recommend Trip Vibe Lanka.',
    date: 'September 2025',
  },
  {
    id: 'rev-6',
    name: 'Nellita L.',
    location: 'Travel Enthusiast',
    flag: '🇨🇭',
    rating: 5,
    title: 'A day to remember',
    travelType: 'Day Tour',
    quote:
      'It was a very nice tour guiding, our tour guider was very soft spoken. He expounded on the history at length and he knows his country very well. I highly recommend Trip Vibe Lanka, you won’t regret it... 5/5. We had a very incredible day.',
    date: 'December 2025',
  },
];

export default function Testimonials() {
  const [destinationPhotos, setDestinationPhotos] = useState<DestinationPhotoItem[]>([]);

  // Fetch real destination photos dynamically from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadRealDestinationPhotos() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('destinations')
          .select('id, name, district, cover_image')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(6);

        if (!error && data && isMounted) {
          const valid = data
            .filter((d) => d.cover_image && typeof d.cover_image === 'string' && d.cover_image.trim().length > 0)
            .map((d) => ({
              id: d.id,
              name: d.name,
              district: d.district || 'Sri Lanka',
              image: d.cover_image.trim(),
            }));

          // Exact rule:
          // If 4 or more -> show top 4
          // If exactly 3 -> show 3
          // If fewer than 3 -> do not show
          if (valid.length >= 4) {
            setDestinationPhotos(valid.slice(0, 4));
          } else if (valid.length === 3) {
            setDestinationPhotos(valid.slice(0, 3));
          } else {
            setDestinationPhotos([]);
          }
        }
      } catch (err) {
        console.warn('Could not load real destination photos:', err);
        if (isMounted) setDestinationPhotos([]);
      }
    }

    loadRealDestinationPhotos();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="reviews" className="w-full bg-white pt-8 sm:pt-12 pb-0">
      <div className="mx-3 sm:mx-6 lg:mx-8 xl:mx-auto max-w-7xl rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[48px] rounded-b-none bg-[#EEF4F8] border-2 border-white shadow-[0_-12px_36px_-6px_rgba(15,23,42,0.06)] pt-16 sm:pt-20 pb-20 sm:pb-24 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Subtle ambient light glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Header with Verified TripAdvisor 5.0 Proof */}
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-16">
          <a
            href={TRIPADVISOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-slate-200/80 shadow-xs hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all text-xs font-semibold text-slate-800 group"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <TripAdvisorIcon className="w-3.5 h-3.5 fill-white" />
            </div>
            <span>5.0 on Tripadvisor · 7 Reviews (100% 5-Star)</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
            Unfiltered Reviews &amp; <span className="font-semibold text-slate-950">Island Memories</span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Real words from international travelers who trusted Tripvibe Lanka with their holidays.
          </p>
        </div>

        {/* Real Destination Photos Gallery (Only shown if 3 or 4 real images exist) */}
        {destinationPhotos.length >= 3 && (
          <div
            className={`relative z-10 grid gap-4 mb-14 sm:mb-16 ${
              destinationPhotos.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {destinationPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative h-48 sm:h-64 rounded-3xl overflow-hidden border-2 border-white shadow-md shadow-slate-900/5 bg-slate-900"
              >
                <Image
                  src={photo.image}
                  alt={photo.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-3.5 inset-x-3.5 text-white">
                  <p className="text-xs sm:text-sm font-bold leading-snug">{photo.name}</p>
                  <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">{photo.district}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real 5-Star Testimonial Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REAL_TRIPADVISOR_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl p-7 bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div className="space-y-3">
                {/* Rating & Date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-emerald-500">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-400 shrink-0">{review.date}</span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 font-heading leading-snug">
                  {review.title}
                </h4>

                {/* Quote */}
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 font-heading">{review.name}</span>
                    <span className="text-xs">{review.flag}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight truncate">
                    {review.location}
                  </span>
                </div>

                <a
                  href={TRIPADVISOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 transition-colors shrink-0"
                >
                  <TripAdvisorIcon className="w-3 h-3 fill-emerald-600" />
                  <span>Tripadvisor</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
