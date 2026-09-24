import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import HomeClient from './HomeClient';
import { HeroCardItem } from '@/components/home/Hero';
import { SchemaScript } from '@/components/SchemaScript';

// Fetch data on the server to make initial load instant with zero layout shift
export const revalidate = 3600; // Cache the page for 1 hour

export const metadata: Metadata = {
  title: "Sri Lanka Private Tours & Luxury Travel | Tripvibe Lanka",
  description: "Handcrafted private tours across Sri Lanka with certified chauffeur-guides. From Sigiriya to Yala — 100% private, never shared. Starting from $250/person.",
  alternates: {
    canonical: "https://www.tripvibelanka.com",
  },
  openGraph: {
    title: "Sri Lanka Private Tours & Luxury Travel | Tripvibe Lanka",
    description: "Handcrafted private tours across Sri Lanka with certified chauffeur-guides. From Sigiriya to Yala — 100% private, never shared. Starting from $250/person.",
    url: "https://www.tripvibelanka.com",
    type: "website",
    images: [
      {
        url: "https://www.tripvibelanka.com/og-image.jpg",
        width: 1200,
        height: 630,
      }
    ]
  }
};

export default async function Page() {
  const supabase = await createClient();

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
  let initialHeroCards: HeroCardItem[] = [];

  if (data && data.length > 0) {
    initialHeroCards = data.map((dest: any) => {
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
  }

  return (
    <>
      <SchemaScript
        schema={[
          {
            "@context": "https://schema.org",
            "@type": ["TouristInformationCenter", "LocalBusiness", "Organization"],
            "name": "Tripvibe Lanka",
            "alternateName": "TripvibeLanka",
            "url": "https://www.tripvibelanka.com",
            "logo": "https://www.tripvibelanka.com/logo.png",
            "image": "https://www.tripvibelanka.com/og-image.jpg",
            "description": "Luxury private tour operator in Sri Lanka offering handcrafted itineraries with certified chauffeur-guides.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Colombo",
              "addressCountry": "LK"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 6.9271,
              "longitude": 79.8612
            },
            "telephone": "+94775368357",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+94775368357",
              "contactType": "customer service",
              "availableLanguage": "English"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "reviewCount": "47",
              "bestRating": "5",
              "worstRating": "1"
            },
            "priceRange": "$$$",
            "currenciesAccepted": "USD",
            "areaServed": "Sri Lanka",
            "sameAs": [
              "https://www.tripadvisor.com/Attraction_Review-g293962-d33287122-Reviews-Trip_Vibe_Lanka-Colombo_Western_Province.html",
              "https://www.instagram.com/tripvibelanka",
              "https://www.facebook.com/tripvibelanka"
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Tripvibe Lanka",
            "url": "https://www.tripvibelanka.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.tripvibelanka.com/tours?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />
      <HomeClient initialHeroCards={initialHeroCards} />
    </>
  );
}
