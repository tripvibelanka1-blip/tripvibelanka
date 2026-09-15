import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import FleetClient from '@/components/fleet/FleetClient';
import { FleetVehicleDetail } from '@/components/fleet/VehicleDetailDrawer';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'Executive Chauffeur Fleet & Luxury Vehicles | TripVibe Lanka',
  description:
    'Explore TripVibe Lanka executive fleet: luxury private touring vans, sedans, and coaches with certified English-speaking chauffeurs, climate control, and Wi-Fi.',
  keywords: [
    'Sri Lanka chauffeur fleet',
    'private van hire Sri Lanka',
    'Toyota KDH hire Sri Lanka',
    'chauffeur driven car Sri Lanka',
    'Sri Lanka luxury vehicle rental with driver',
    'airport transfer Colombo private van',
  ],
  alternates: {
    canonical: 'https://tripvibelanka.com/fleet',
  },
  openGraph: {
    title: 'Executive Chauffeur Fleet & Luxury Vehicles | TripVibe Lanka',
    description:
      'Private air-conditioned vans, sedans, and coaches with licensed English-speaking chauffeurs for unforgettable Sri Lanka tours.',
    url: 'https://tripvibelanka.com/fleet',
    siteName: 'TripVibe Lanka',
    images: [
      {
        url: 'https://qxsmwnrhtlxqmxlbvvms.supabase.co/storage/v1/object/public/vehicle-images/cover_1789379598100_l12kqi.webp',
        width: 1200,
        height: 630,
        alt: 'TripVibe Lanka Executive Fleet',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function FleetPage() {
  let vehicles: FleetVehicleDetail[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      vehicles = data.map((v) => ({
        id: v.id,
        name: v.name,
        category: v.category || 'van',
        license_plate: v.license_plate || undefined,
        passenger_capacity: v.passenger_capacity || 6,
        luggage_capacity: v.luggage_capacity || 4,
        passengers_text: v.passengers_text || undefined,
        luggage_text: v.luggage_text || undefined,
        transmission: v.transmission || 'Automatic',
        fuel_type: v.fuel_type || 'Diesel',
        features: Array.isArray(v.features) ? (v.features as string[]) : [],
        description: v.description || undefined,
        cover_image: v.cover_image || undefined,
        gallery_images: Array.isArray(v.gallery_images) ? (v.gallery_images as string[]) : [],
        price_per_day_usd: Number(v.price_per_day_usd) || 0,
        price_per_day_lkr: Number(v.price_per_day_lkr) || 0,
        price_per_km_usd: Number(v.price_per_km_usd) || 0,
        price_per_km_lkr: Number(v.price_per_km_lkr) || 0,
        recommended_for: v.recommended_for || undefined,
      }));
    }
  } catch (err) {
    console.error('Error fetching fleet vehicles in FleetPage:', err);
  }

  // Structured JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: 'TripVibe Lanka Executive Fleet',
    description:
      'Chauffeured private touring vans, sedans, and coaches for island-wide Sri Lanka journeys.',
    url: 'https://tripvibelanka.com/fleet',
    telephone: '+94770857319',
    areaServed: {
      '@type': 'Country',
      name: 'Sri Lanka',
    },
    currenciesAccepted: 'USD, LKR',
    paymentAccepted: 'Credit Card, Cash, Bank Transfer',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Executive Fleet Vehicles',
      itemListElement: vehicles.map((veh, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Car',
          name: veh.name,
          category: veh.category,
          seatingCapacity: veh.passenger_capacity || 6,
          image: veh.cover_image,
          description: veh.description,
        },
        price: veh.price_per_day_usd,
        priceCurrency: 'USD',
        position: index + 1,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FleetClient initialVehicles={vehicles} />
    </>
  );
}
