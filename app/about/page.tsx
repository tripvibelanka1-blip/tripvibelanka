import React from 'react';
import type { Metadata } from 'next';
import AboutClient from '@/components/about/AboutClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us | Tripvibe Lanka - Private Chauffeur & Bespoke Sri Lanka Tours',
  description:
    'Learn about Tripvibe Lanka, our story, native chauffeur guides Luca, Mishal, Abdul, and our 5.0 TripAdvisor-rated private custom tours across Sri Lanka.',
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
  return <AboutClient />;
}
