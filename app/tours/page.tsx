import React from 'react';
import type { Metadata } from 'next';
import ToursClient from '@/components/tours/ToursClient';
import { ToursFAQ } from '@/components/ToursFAQ';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Sri Lanka Private Tour Packages | Tripvibe Lanka",
  description:
    "Browse handcrafted private Sri Lanka tour packages from 5 to 14 days. Sigiriya, Kandy, Ella, Yala & more. 100% private from $250/person.",
  alternates: {
    canonical: "https://www.tripvibelanka.com/tours",
  },
  keywords: [
    'Sri Lanka Tour Packages',
    'Private Chauffeur Tours Sri Lanka',
    'Sigiriya Cultural Triangle Tour',
    'Ella Scenic Blue Train Tour',
    'Yala Leopard Safari Tour',
    'Sri Lanka Luxury Vacations',
    'Halal Friendly Sri Lanka Tours',
    'Tripvibe Lanka Packages',
  ],
  openGraph: {
    title: 'Signature Private Tour Packages | Tripvibe Lanka',
    description:
      'Every tour package is 100% private and customizable. Enjoy executive vehicle transport, certified chauffeur guides, and handpicked boutique stays across Sri Lanka.',
    type: 'website',
    url: 'https://tripvibelanka.com/tours',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sri Lanka Private Tour Packages | Tripvibe Lanka',
    description:
      'Handcrafted bespoke journeys with native chauffeur guides. Explore ancient UNESCO citadels, misty tea country, and wild leopard safaris.',
  },
};

export default function ToursPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tripvibe Lanka Signature Tour Packages',
    description:
      'Bespoke private chauffeured tours across Sri Lanka with certified guides and boutique accommodations.',
    url: 'https://tripvibelanka.com/tours',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToursClient />
      <ToursFAQ />
    </>
  );
}
