import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { Clock, MapPin, CheckCircle2, XCircle, Users, ArrowRight, MessageCircle, ChevronRight, Home } from 'lucide-react';
import { ToursFAQ } from '@/components/ToursFAQ';
import { SchemaScript } from '@/components/SchemaScript';
import { Breadcrumb } from '@/components/Breadcrumb';

// Ensure this matches the Next.js standard for dynamic params revalidation
export const revalidate = 3600; 

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase.from('tours').select('slug').eq('is_active', true);
  
  if (!data) return [];
  
  return data.map((tour: any) => ({
    slug: tour.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: tour } = await supabase
    .from('tours')
    .select('title, description, tagline, cover_image, slug')
    .eq('slug', params.slug)
    .single();

  if (!tour) return {};

  const rawDesc = tour.description || tour.tagline || '';
  const desc = rawDesc.length > 155 ? rawDesc.substring(0, 152) + '...' : rawDesc;
  const url = `https://www.tripvibelanka.com/tours/${tour.slug}`;
  const title = `${tour.title} | Private Sri Lanka Tour | Tripvibe Lanka`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: desc,
      url,
      images: tour.cover_image ? [{ url: tour.cover_image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: tour.cover_image ? [tour.cover_image] : [],
    }
  };
}

export default async function TourDetailPage({ params }: Props) {
  const supabase = await createClient();
  
  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tour) {
    notFound();
  }

  // Fetch 3 related tours based on category
  const { data: related } = await supabase
    .from('tours')
    .select('id, slug, title, duration_days, duration_nights, price_usd, cover_image')
    .eq('is_active', true)
    .eq('category', tour.category)
    .neq('slug', params.slug)
    .limit(3);

  const days = tour.duration_days || 1;
  const nights = tour.duration_nights || 0;
  const durText = nights > 0 ? `${days} Days / ${nights} Nights` : `${days} Day Tour`;
  const coverUrl = tour.cover_image || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80';
  const desc = tour.description || tour.tagline || '';
  const url = `https://www.tripvibelanka.com/tours/${tour.slug}`;
  const priceUsd = Number(tour.price_usd) || 0;

  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const included = Array.isArray(tour.included) ? tour.included : [];
  const excluded = Array.isArray(tour.excluded) ? tour.excluded : [];

  const touristTripSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tour.title,
    "description": desc,
    "image": coverUrl,
    "url": url,
    "touristType": tour.category || "Private tour",
    "offers": {
      "@type": "Offer",
      "price": priceUsd,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": `${new Date().getFullYear()}-01-01`,
      "url": `https://www.tripvibelanka.com/booking?package=${tour.id}`
    },
    "provider": {
      "@type": "Organization",
      "name": "Tripvibe Lanka",
      "url": "https://www.tripvibelanka.com"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "47",
      "bestRating": "5"
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <SchemaScript schema={[touristTripSchema]} />
      <Breadcrumb items={[
        { name: "Tours", href: "/tours" },
        { name: tour.title, href: `/tours/${params.slug}` }
      ]} />

      {/* Section 1 - Hero */}
      <section className="relative w-full h-[60vh] min-h-[400px] bg-slate-900">
        <Image
          src={coverUrl}
          alt={tour.title}
          fill
          priority={true}
          quality={80}
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider">
              {tour.category || 'Signature Tour'}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              {durText}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display mb-4 max-w-4xl leading-tight">
            {tour.title}
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl">
            {tour.tagline}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section 2 - Overview */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 font-display mb-6">Tour Overview</h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
              <p>{desc}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <Clock className="w-6 h-6 text-brand-text mb-2" />
                <div className="text-sm text-slate-500 font-medium">Duration</div>
                <div className="text-slate-900 font-semibold">{days} Days</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <Users className="w-6 h-6 text-brand-text mb-2" />
                <div className="text-sm text-slate-500 font-medium">Group</div>
                <div className="text-slate-900 font-semibold">100% Private</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <MapPin className="w-6 h-6 text-brand-text mb-2" />
                <div className="text-sm text-slate-500 font-medium">Start/End</div>
                <div className="text-slate-900 font-semibold truncate">Colombo (or Airport)</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-2xl font-bold text-brand-text block mb-1">
                  ${priceUsd > 0 ? priceUsd.toLocaleString() : '---'}
                </span>
                <div className="text-sm text-slate-500 font-medium">Per Person (from)</div>
              </div>
            </div>
          </section>

          {/* Section 3 - Itinerary */}
          {itinerary.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 font-display mb-8">Your Itinerary</h2>
              <div className="space-y-6">
                {itinerary.map((it: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-orange-100 flex items-center justify-center text-brand-text font-bold">
                        {it.day || idx + 1}
                      </div>
                      {idx !== itinerary.length - 1 && (
                        <div className="w-px h-full bg-slate-200 my-2" />
                      )}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {it.title || `Day ${idx + 1}`}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {it.details || it.desc || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 4 - What's Included */}
          {(included.length > 0 || excluded.length > 0) && (
            <section className="grid md:grid-cols-2 gap-8">
              {included.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-2 shrink-0" />
                    What&apos;s Included
                  </h2>
                  <ul className="space-y-3">
                    {included.map((item: string, i: number) => (
                      <li key={i} className="flex items-start text-slate-600">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {excluded.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <XCircle className="w-6 h-6 text-rose-400 mr-2 shrink-0" />
                    Not Included
                  </h2>
                  <ul className="space-y-3">
                    {excluded.map((item: string, i: number) => (
                      <li key={i} className="flex items-start text-slate-600">
                        <XCircle className="w-5 h-5 text-rose-400 mr-3 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1">
          {/* Section 5 - Pricing & Booking CTA */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Pricing & Availability</h2>
            <div className="mb-6 pb-6 border-b border-slate-100">
              <div className="text-sm text-slate-500 font-medium mb-1">Starting from</div>
              <div className="flex items-baseline text-slate-900">
                <span className="text-4xl font-bold">${priceUsd > 0 ? priceUsd.toLocaleString() : '250'}</span>
                <span className="text-slate-500 ml-2">/ person</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                * Prices vary based on group size, accommodation tier, and season.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href={`/booking?package=${tour.id}`}
                className="w-full flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors group"
              >
                Reserve This Tour
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/94775368357"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat on WhatsApp
              </a>
            </div>
            
            <div className="mt-6 flex items-center justify-center text-sm text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
              Free customization & zero deposit to inquire
            </div>
          </div>
        </div>
      </div>

      {/* Section 6 - FAQ */}
      <ToursFAQ />

      {/* Section 7 - Related Tours */}
      {related && related.length > 0 && (
        <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mb-2">Similar Private Tours</h2>
                <p className="text-slate-600">Explore more handcrafted journeys like {tour.title}.</p>
              </div>
              <Link href="/tours" className="hidden sm:flex items-center text-brand-text font-semibold hover:text-orange-600 transition-colors">
                View All Tours
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rt: any) => (
                <Link
                  key={rt.id}
                  href={`/tours/${rt.slug}`}
                  className="group flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-orange-200 transition-all duration-300"
                >
                  <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                    <Image
                      src={rt.cover_image || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80'}
                      alt={rt.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-semibold text-slate-900 shadow-sm">
                      {rt.duration_nights > 0 ? `${rt.duration_days}D/${rt.duration_nights}N` : `${rt.duration_days} Days`}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-brand-text transition-colors line-clamp-2">
                      {rt.title}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-200">
                      <div className="text-sm text-slate-500 font-medium">
                        From <span className="text-brand-text font-bold text-base ml-0.5">${Number(rt.price_usd) || 250}</span>
                      </div>
                      <span className="text-brand-text">
                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 group-hover:translate-x-1 transition-all" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
