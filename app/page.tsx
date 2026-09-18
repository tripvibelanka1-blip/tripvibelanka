'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Currency, Experience } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';
import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import PromoBanner from '@/components/home/PromoBanner';
import Destinations from '@/components/home/Destinations';
import TourPackages from '@/components/home/TourPackages';
import Experiences from '@/components/home/Experiences';
import FleetShowcase from '@/components/home/FleetShowcase';
import WhyUs from '@/components/home/WhyUs';
import Testimonials from '@/components/home/Testimonials';
import Footer from '@/components/home/Footer';

export default function HomePage() {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const handleOpenBooking = (packageId?: string, couponCode?: string) => {
    const params = new URLSearchParams();
    if (packageId) params.set('package', packageId);
    if (couponCode) params.set('coupon', couponCode);
    const qs = params.toString();
    router.push(qs ? `/booking?${qs}` : '/booking');
  };

  const handleSelectDestination = (destName: string) => {
    router.push(`/destinations?destination=${encodeURIComponent(destName)}`);
  };

  const handleSelectExperience = (exp: Experience) => {
    router.push(
      `/booking?addon=${exp.id}${exp.location ? `&destination=${encodeURIComponent(exp.location)}` : ''}`
    );
  };

  const handleSelectVehicle = (vehicleId: string) => {
    router.push(`/booking?vehicle=${vehicleId}`);
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-orange-500/20 selection:text-orange-950 font-body">
      {/* Zero-jank Scroll Sentinel for Navbar State */}
      <div id="scroll-sentinel" className="absolute top-0 left-0 w-full h-10 pointer-events-none -z-10" />

      {/* Floating Pill Navbar */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => handleOpenBooking()}
      />

      <main>
        {/* Full-Bleed Hero Section with Floating Destination Cards */}
        <Hero
          onOpenBooking={handleOpenBooking}
          onSelectDestination={handleSelectDestination}
        />

        {/* Limited-Time Seasonal Promo Offer Banner */}
        <PromoBanner onOpenBooking={handleOpenBooking} />

        {/* Popular Tour Packages Grid */}
        <TourPackages
          currency={currency}
          onSelectPackage={(pkgId) => router.push(`/booking?package=${pkgId}`)}
        />

        {/* Featured Destinations Bento Grid */}
        <Destinations onSelectDestination={handleSelectDestination} />

        {/* Activities & Experiences Slider */}
        <Experiences
          currency={currency}
          onSelectExperience={handleSelectExperience}
        />

        {/* Executive Vehicle Fleet Showcase */}
        <FleetShowcase
          currency={currency}
          onSelectVehicle={handleSelectVehicle}
        />

        {/* Why Choose Us & About Us Story Pillars */}
        <WhyUs onOpenBooking={() => handleOpenBooking()} />

        {/* Traveler Gallery & 5-Star Testimonials */}
        <Testimonials />
      </main>

      {/* Verified Footer with Real Social Media, TripAdvisor & 24/7 Contacts */}
      <Footer onOpenBooking={() => handleOpenBooking()} />
    </div>
  );
}
