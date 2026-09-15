import React from 'react';
import type { Metadata } from 'next';
import ToursClient from '@/components/tours/ToursClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tour Packages Sri Lanka | Handcrafted Private Luxury Itineraries | Tripvibe Lanka',
  description:
    'Discover bespoke private tour packages across Sri Lanka. Certified chauffeur guides, executive AC fleet, handpicked luxury stays, and 100% customizable itineraries from Colombo to Sigiriya, Ella & Yala.',
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
    </>
  );
}
