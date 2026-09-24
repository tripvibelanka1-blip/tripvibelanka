import React from 'react';
import type { Metadata } from 'next';
import AboutClient from '@/components/about/AboutClient';
import { SchemaScript } from '@/components/SchemaScript';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "About Tripvibe Lanka | Our Story & Expert Guides",
  description:
    "Meet the team behind Tripvibe Lanka. Government-certified local guides, 5.0 TripAdvisor rating, and a passion for authentic Sri Lankan travel experiences.",
  alternates: {
    canonical: "https://www.tripvibelanka.com/about",
  },
  keywords: [
    'About Tripvibe Lanka',
    'Sri Lanka Private Chauffeur',
    'Halal Friendly Sri Lanka Tours',
    'Custom Sri Lanka Itinerary',
    'Sri Lanka Tour Guide Luca',
    'Tripvibe Lanka Reviews',
  ],
  openGraph: {
    title: 'About Us | Tripvibe Lanka - We Let You Feel Sri Lanka',
    description:
      'Tripvibe Lanka was born from a belief that the best trips are built around people. Experience unhurried, tailor-made private tours across Sri Lanka.',
    type: 'website',
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Tripvibe Lanka",
    "url": "https://www.tripvibelanka.com/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "Tripvibe Lanka",
      "url": "https://www.tripvibelanka.com",
      "areaServed": "Sri Lanka",
      "knowsAbout": [
        "Sri Lanka private tours",
        "Luxury travel Sri Lanka", 
        "Cultural tours Sri Lanka",
        "Wildlife safaris Sri Lanka"
      ],
      "hasCredential": "Government-certified tour operator, Sri Lanka",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "47",
        "bestRating": "5"
      },
      "employee": [
        {
          "@type": "Person",
          "name": "Luca (Luka)",
          "jobTitle": "Lead Chauffeur-Guide",
          "knowsLanguage": "English",
          "hasCredential": "Government-certified tour guide, Sri Lanka",
          "worksFor": {
            "@type": "Organization",
            "name": "Tripvibe Lanka"
          }
        },
        {
          "@type": "Person", 
          "name": "Mishal",
          "jobTitle": "Senior Chauffeur-Guide",
          "knowsLanguage": "English",
          "hasCredential": "Government-certified tour guide, Sri Lanka",
          "worksFor": {
            "@type": "Organization",
            "name": "Tripvibe Lanka"
          }
        }
      ]
    }
  };

  return (
    <>
      <SchemaScript schema={aboutSchema} />
      <AboutClient />
    </>
  );
}
