import React from 'react';
import type { Metadata } from 'next';
import DestinationsClient from '@/components/destinations/DestinationsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sri Lanka Destinations Guide | Handcrafted Luxury Sanctuaries | Tripvibe Lanka',
  description:
    'Explore Sri Lanka’s most breathtaking destinations, from the ancient rock fortress of Sigiriya to the mist-veiled peaks of Ella, colonial Nuwara Eliya, and the golden shores of Mirissa. Private chauffeur guides and luxury bespoke itineraries.',
  keywords: [
    'Sri Lanka Destinations',
    'Sigiriya Rock Fortress',
    'Ella Sri Lanka Attractions',
    'Mirissa Whale Watching',
    'Nuwara Eliya Tea Plantations',
    'Sri Lanka Luxury Travel',
    'Private Chauffeur Tour Destinations',
    'Tripvibe Lanka Destinations',
  ],
  openGraph: {
    title: 'Curated Sri Lankan Destinations | Tripvibe Lanka',
    description:
      'Immerse yourself in authentic Sri Lankan wonders with certified chauffeur guides, executive air-conditioned vehicles, and handpicked luxury boutique stays.',
    type: 'website',
    url: 'https://tripvibelanka.com/destinations',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sri Lanka Destinations & Regional Guides | Tripvibe Lanka',
    description:
      'Discover curated Sri Lankan sanctuaries from ancient UNESCO fortresses to misty tea estates and tropical south coast beaches.',
  },
};

export default function DestinationsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tripvibe Lanka Curated Sri Lankan Destinations',
    description:
      'Explore handpicked luxury destinations across Sri Lanka including Sigiriya, Ella, Mirissa, and Nuwara Eliya with private chauffeur guides.',
    url: 'https://tripvibelanka.com/destinations',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DestinationsClient />
    </>
  );
}
