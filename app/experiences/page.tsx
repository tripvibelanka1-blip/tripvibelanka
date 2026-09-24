import React from 'react';
import type { Metadata } from 'next';
import ExperiencesClient from '@/components/experiences/ExperiencesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Sri Lanka Experiences & Activities | Tripvibe Lanka",
  description:
    "Curated Sri Lanka experiences — Village tours, tea factory visits, wildlife safaris, whale watching, and more. All private, all exclusive.",
  alternates: {
    canonical: "https://www.tripvibelanka.com/experiences",
  },
  keywords: [
    'Sri Lanka Experiences',
    'Sri Lanka Activities',
    'Sigiriya Hot Air Balloon',
    'Sri Lanka Safari Activities',
    'Private Excursions Sri Lanka',
    'Luxury Travel Activities Sri Lanka',
    'Tripvibe Lanka Experiences',
  ],
  openGraph: {
    title: 'Signature Sri Lankan Experiences | Tripvibe Lanka',
    description:
      'Immerse yourself in authentic Sri Lankan activities with certified local guides and executive private transfers.',
    type: 'website',
    url: 'https://tripvibelanka.com/experiences',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sri Lanka Activities & Private Excursions | Tripvibe Lanka',
    description:
      'Handcrafted activities and immersive excursions designed to elevate your private journey in Sri Lanka.',
  },
};

export default function ExperiencesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tripvibe Lanka Signature Sri Lankan Experiences',
    description:
      'Explore handpicked luxury activities and excursions across Sri Lanka with private chauffeur guides.',
    url: 'https://tripvibelanka.com/experiences',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExperiencesClient />
    </>
  );
}
