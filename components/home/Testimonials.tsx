'use client';

import React from 'react';
import Image from 'next/image';
import { TESTIMONIALS } from '@/data/mockData';
import { Star, Quote, CheckCircle } from 'lucide-react';

export default function Testimonials() {
  const galleryPhotos = [
    {
      title: 'Sunrise on Sigiriya Summit',
      src: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80',
      caption: 'Sigiriya Rock, Cultural Triangle',
    },
    {
      title: 'Tea Garden Carriage Train',
      src: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80',
      caption: 'Demodara Nine Arch Bridge, Ella',
    },
    {
      title: 'Coconut Tree Hill Golden Hour',
      src: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
      caption: 'Mirissa Southern Headland',
    },
    {
      title: 'Yala Elephant Herd Crossing',
      src: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=600&q=80',
      caption: 'Yala National Park Safari',
    },
  ];

  return (
    <section className="w-full bg-white pt-8 sm:pt-12 pb-0">
      {/* 
        Aesthetic Coastal Card Container:
        - Top 2 edges curvy: rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[48px] rounded-b-none
        - Left & right spaces: mx-3 sm:mx-6 lg:mx-8 xl:mx-auto max-w-7xl
        - Distinct aesthetic background color: bg-[#EEF4F8] (subtle Sri Lanka coastal mist)
        - Crisp white borders: border-2 border-white
      */}
      <div className="mx-3 sm:mx-6 lg:mx-8 xl:mx-auto max-w-7xl rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[48px] rounded-b-none bg-[#EEF4F8] border-2 border-white shadow-[0_-12px_36px_-6px_rgba(15,23,42,0.06)] pt-16 sm:pt-20 pb-20 sm:pb-24 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Subtle ambient light glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Header */}
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
            Unfiltered Reviews &amp; <span className="font-semibold text-slate-950">Island Memories</span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            See how international travelers experienced Sri Lanka with our private chauffeur service and dedicated team.
          </p>
        </div>

        {/* Asymmetric Visual Photo Grid */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14 sm:mb-16">
          {galleryPhotos.map((photo, i) => (
            <div
              key={i}
              className="group relative h-48 sm:h-64 rounded-3xl overflow-hidden border-2 border-white shadow-md shadow-slate-900/5"
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 inset-x-3 text-white">
                <p className="text-xs sm:text-sm font-bold leading-snug">{photo.title}</p>
                <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 5-Star Testimonial Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl p-8 bg-white border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-orange-200 group-hover:text-orange-300 transition-colors pointer-events-none" />

              <div className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-semibold text-slate-500 ml-1.5">{review.date}</span>
                </div>

                {/* Quote */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-6 mt-6 border-t border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-orange-500/25">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        {review.name}
                      </h4>
                      <span>{review.flag}</span>
                    </div>
                    <p className="text-xs text-slate-500">{review.country}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  Verified Journey
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
