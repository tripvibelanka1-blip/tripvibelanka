import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import BookingClient from '@/components/booking/BookingClient';
import { Loader2 } from 'lucide-react';
import { ToursFAQ } from '@/components/ToursFAQ';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Book a Private Sri Lanka Tour | Tripvibe Lanka",
  description:
    "Request your bespoke private Sri Lanka itinerary. Tell us your dates, budget, and interests — we'll craft the perfect journey. Starting from $250/person.",
  alternates: {
    canonical: "https://www.tripvibelanka.com/booking",
  },
  keywords: [
    'Book Sri Lanka Tour',
    'Sri Lanka Private Tour Reservation',
    'Sri Lanka Chauffeur Booking',
    'Bespoke Itinerary Sri Lanka',
    'Tripvibe Lanka Booking',
  ],
  openGraph: {
    title: 'Reserve Your Private Sri Lanka Tour | Tripvibe Lanka',
    description:
      'Customize and book your private luxury journey across Sri Lanka with certified chauffeur guides and transparent currency rates.',
    type: 'website',
    url: 'https://tripvibelanka.com/booking',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Private Sri Lanka Tour | Tripvibe Lanka',
    description:
      'Official booking portal for handcrafted private chauffeured tours across Sri Lanka.',
  },
};

export default function BookingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ReservationPage',
    name: 'Tripvibe Lanka Tour Reservation Portal',
    description:
      'Book private chauffeured tours, boutique hotels, and signature activities across Sri Lanka.',
    url: 'https://tripvibelanka.com/booking',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
            <p className="text-sm font-semibold text-stone-600">
              Initializing Reservation Portal...
            </p>
          </div>
        }
      >
        <BookingClient />
      </Suspense>
      <ToursFAQ />
    </>
  );
}
