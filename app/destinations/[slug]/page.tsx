import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { MapPin, Calendar, Compass, ArrowRight, Home, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { SchemaScript } from '@/components/SchemaScript';
import { Breadcrumb } from '@/components/Breadcrumb';

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase.from('destinations').select('slug');
  
  if (!data) return [];
  
  return data.map((dest) => ({
    slug: dest.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: dest } = await supabase
    .from('destinations')
    .select('name, description, tag, cover_image, slug')
    .eq('slug', params.slug)
    .single();

  if (!dest) return {};

  const name = dest.name || 'Sri Lanka Destination';
  const rawDesc = dest.description || dest.tag || '';
  const metaDesc = `${name} travel guide — best things to do, when to visit, and private tours available. Expert local knowledge from Tripvibe Lanka.`;
  const url = `https://www.tripvibelanka.com/destinations/${dest.slug}`;
  const title = `${name}, Sri Lanka | Travel Guide | Tripvibe Lanka`;

  return {
    title,
    description: metaDesc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: metaDesc,
      url,
      images: dest.cover_image ? [{ url: dest.cover_image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: dest.cover_image ? [dest.cover_image] : [],
    }
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const supabase = await createClient();
  
  // 1. Fetch Destination
  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!destination) {
    notFound();
  }

  // 2. Fetch Tours containing this destination
  // We fetch all active tours and filter in memory to handle array matching safely
  const { data: allTours } = await supabase
    .from('tours')
    .select('id, slug, title, duration_days, duration_nights, price_usd, cover_image, locations')
    .eq('is_active', true);

  const relatedTours = (allTours || []).filter(t => {
    if (!Array.isArray(t.locations)) return false;
    return t.locations.some((loc: string) => loc.toLowerCase().includes(destination.name.toLowerCase()));
  }).slice(0, 3);

  // 3. Fetch Experiences matching this destination
  const { data: allExperiences } = await supabase
    .from('experiences')
    .select('id, slug, title, cover_image, location');

  const relatedExperiences = (allExperiences || []).filter(e => {
    return e.location?.toLowerCase().includes(destination.name.toLowerCase());
  }).slice(0, 3);

  const coverUrl = destination.cover_image || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80';
  const desc = destination.description || destination.tag || '';
  const url = `https://www.tripvibelanka.com/destinations/${destination.slug || destination.id}`;
  
  const attractions = Array.isArray(destination.popular_attractions) ? destination.popular_attractions : [];

  // JSON-LD Schemas
  const touristDestinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": destination.name,
    "description": desc,
    "url": url,
    "image": coverUrl,
    "touristType": "Leisure tourists, Adventure travellers",
    "includesAttraction": {
      "@type": "TouristAttraction",
      "name": destination.name,
      "containedInPlace": {
        "@type": "Country",
        "name": "Sri Lanka",
        "sameAs": "https://www.wikidata.org/wiki/Q854"
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <SchemaScript schema={[touristDestinationSchema]} />
      <Breadcrumb items={[
        { name: "Destinations", href: "/destinations" },
        { name: destination.name, href: `/destinations/${params.slug}` }
      ]} />

      {/* Section 1 - Hero */}
      <section className="relative w-full h-[55vh] min-h-[350px] bg-slate-900">
        <Image
          src={coverUrl}
          alt={destination.name}
          fill
          priority={true}
          quality={80}
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
          {destination.district && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                {destination.district} District
              </span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display mb-4 max-w-4xl leading-tight">
            {destination.name}
          </h1>
          {destination.tag && (
            <p className="text-lg text-slate-200 max-w-2xl font-medium">
              {destination.tag}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section 2 - About This Destination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 font-display mb-6">About {destination.name}</h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed mb-8">
              <p>{desc}</p>
            </div>
            
            {(destination.best_time_to_visit || attractions.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4">
                {destination.best_time_to_visit && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start">
                    <Calendar className="w-6 h-6 text-brand-text mr-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-500 font-medium mb-1">Best Time to Visit</div>
                      <div className="text-slate-900 font-semibold">{destination.best_time_to_visit}</div>
                    </div>
                  </div>
                )}
                {attractions.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start">
                    <Compass className="w-6 h-6 text-brand-text mr-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-500 font-medium mb-1">Top Attractions</div>
                      <div className="text-slate-900 font-semibold truncate">{attractions[0]}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {attractions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 text-orange-500 mr-2" />
                  Popular Highlights
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {attractions.map((attr: string, i: number) => (
                    <li key={i} className="flex items-start text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-5 h-5 text-brand-text mr-2 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{attr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Section 4 - Experiences at This Destination */}
          {relatedExperiences.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 font-display mb-6">Experiences in {destination.name}</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {relatedExperiences.map((exp: any) => (
                  <div key={exp.id} className="group relative rounded-2xl overflow-hidden bg-slate-900 h-64 border border-slate-200">
                    <Image
                      src={exp.cover_image || coverUrl}
                      alt={exp.title}
                      fill
                      className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500"
                    />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-slate-900/90 to-transparent">
                      <h3 className="text-white font-bold text-xl">{exp.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3 - Tours Including This Destination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 font-display mb-6">Private Tours to {destination.name}</h2>
            {relatedTours.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {relatedTours.map((rt: any) => (
                  <Link
                    key={rt.id}
                    href={`/tours/${rt.slug}`}
                    className="group flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-orange-200 transition-all duration-300"
                  >
                    <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                      <Image
                        src={rt.cover_image || coverUrl}
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
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Build a Custom Itinerary</h3>
                <p className="text-slate-600 mb-6">We can craft a personalized private tour perfectly featuring {destination.name}.</p>
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Plan Your Trip
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1">
          {/* Section 5 - Booking CTA */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-4">Plan a Private Trip to {destination.name}</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Experience the best of {destination.name} with your own government-certified local chauffeur-guide and luxury vehicle.
            </p>

            <Link
              href="/booking"
              className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors group"
            >
              Start Planning Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="mt-6 flex items-center justify-center text-sm text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-brand-text mr-1.5 shrink-0" />
              Fully customized private itineraries
            </div>
            <div className="mt-2 flex items-center justify-center text-sm text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-brand-text mr-1.5 shrink-0" />
              100% private, never shared
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
