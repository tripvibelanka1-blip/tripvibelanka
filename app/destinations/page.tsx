import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import DestinationsClient from '@/components/destinations/DestinationsClient';
import { Loader2 } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Sri Lanka Destinations | Places to Visit | Tripvibe Lanka",
  description:
    "Discover the best destinations in Sri Lanka — Sigiriya, Kandy, Ella, Yala, Mirissa, Colombo and more. Private guided tours to every location.",
  alternates: {
    canonical: "https://www.tripvibelanka.com/destinations",
  },
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
      <Breadcrumb items={[{ name: "Destinations", href: "/destinations" }]} />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
            <p className="text-sm font-semibold text-stone-600">
              Loading Destinations...
            </p>
          </div>
        }
      >
        <DestinationsClient />
      </Suspense>
    </>
  );
}
