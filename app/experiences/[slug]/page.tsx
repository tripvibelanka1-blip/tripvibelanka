import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { createClient, createStaticClient } from '@/utils/supabase/server';
import { MapPin, Clock, ArrowRight, Home, ChevronRight, CheckCircle2, Compass, Tag } from 'lucide-react';
import { SchemaScript } from '@/components/SchemaScript';
import { Breadcrumb } from '@/components/Breadcrumb';

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase.from('experiences').select('slug');
  
  if (!data) return [];
  
  return data.map((exp) => ({
    slug: exp.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: exp } = await supabase
    .from('experiences')
    .select('title, description, cover_image, slug')
    .eq('slug', params.slug)
    .single();

  if (!exp) return {};

  const name = exp.title || 'Sri Lanka Experience';
  const rawDesc = exp.description || '';
  const metaDesc = `${name} — ${rawDesc.length > 130 ? rawDesc.substring(0, 127) + '...' : rawDesc}. Private, guided experience with Tripvibe Lanka.`;
  const url = `https://www.tripvibelanka.com/experiences/${exp.slug}`;

  return {
    title: `${name} Experience in Sri Lanka | Tripvibe Lanka`,
    description: metaDesc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} Experience in Sri Lanka | Tripvibe Lanka`,
      description: metaDesc,
      url,
      images: exp.cover_image ? [{ url: exp.cover_image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} Experience in Sri Lanka | Tripvibe Lanka`,
      images: exp.cover_image ? [exp.cover_image] : [],
    }
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const supabase = await createClient();
  
  // 1. Fetch Experience with its destination
  const { data: experience } = await supabase
    .from('experiences')
    .select(`
      *,
      destination:destinations (
        id,
        name,
        slug
      )
    `)
    .eq('slug', params.slug)
    .single();

  if (!experience) {
    notFound();
  }

  // 2. Fetch all active tours and find ones that visit this location
  const { data: allTours } = await supabase
    .from('tours')
    .select('id, slug, title, duration_days, duration_nights, price_usd, cover_image, locations')
    .eq('is_active', true);

  const locLower = (experience.location || experience.destination?.name || '').toLowerCase();
  
  const relatedTours = (allTours || []).filter(t => {
    if (!locLower) return false;
    if (Array.isArray(t.locations)) {
      return t.locations.some((loc: string) => {
        const l = loc.toLowerCase();
        return locLower.includes(l) || l.includes(locLower);
      });
    }
    return false;
  }).slice(0, 3);

  const coverUrl = experience.cover_image || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80';
  const desc = experience.description || '';
  const url = `https://www.tripvibelanka.com/experiences/${experience.slug || experience.id}`;

  // JSON-LD Schemas
  const touristAttractionSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": experience.title,
    "description": desc,
    "url": url,
    "image": coverUrl,
    "touristType": "Leisure tourists",
    "containedInPlace": {
      "@type": "Country",
      "name": "Sri Lanka"
    },
    "provider": {
      "@type": "Organization",
      "name": "Tripvibe Lanka",
      "url": "https://www.tripvibelanka.com"
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <SchemaScript schema={[touristAttractionSchema]} />
      <Breadcrumb items={[
        { name: "Experiences", href: "/experiences" },
        { name: experience.title, href: `/experiences/${params.slug}` }
      ]} />

      {/* Section 1 - Hero */}
      <section className="relative w-full h-[55vh] min-h-[350px] bg-slate-900">
        <Image
          src={coverUrl}
          alt={experience.title}
          fill
          priority={true}
          quality={80}
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {experience.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 mr-1.5" />
                {experience.category}
              </span>
            )}
            {experience.duration && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {experience.duration}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display mb-4 max-w-4xl leading-tight">
            {experience.title}
          </h1>
          {experience.location && (
            <p className="text-lg text-slate-200 max-w-2xl font-medium flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {experience.location}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section 2 - About This Experience */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 font-display mb-6">About This Experience</h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed mb-8">
              <p>{desc}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {experience.duration && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start">
                  <Clock className="w-6 h-6 text-brand-text mr-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-slate-500 font-medium mb-1">Duration</div>
                    <div className="text-slate-900 font-semibold">{experience.duration}</div>
                  </div>
                </div>
              )}
              {experience.location && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start">
                  <MapPin className="w-6 h-6 text-brand-text mr-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-slate-500 font-medium mb-1">Location</div>
                    <div className="text-slate-900 font-semibold">
                      {experience.destination?.slug ? (
                        <Link href={`/destinations/${experience.destination.slug}`} className="hover:text-brand-text transition-colors">
                          {experience.location}
                        </Link>
                      ) : (
                        experience.location
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-4 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-slate-500 font-medium mb-1">Type</div>
                  <div className="text-slate-900 font-semibold">100% Private Guided</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 - Tours That Include This Experience */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 font-display mb-6">Tours Including This Experience</h2>
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
                <p className="text-slate-600 mb-6">We can craft a personalized private tour perfectly featuring this experience.</p>
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
          {/* Section 4 - Booking CTA */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 font-display mb-4">Add This to Your Private Itinerary</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Enhance your Sri Lanka tour with this private experience, perfectly paced to your schedule.
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
