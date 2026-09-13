'use client';

import React, { useState } from 'react';
import { Currency, Experience } from '@/types/tourism';
import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import PromoBanner from '@/components/home/PromoBanner';
import Destinations from '@/components/home/Destinations';
import TourPackages from '@/components/home/TourPackages';
import Experiences from '@/components/home/Experiences';
import WhyUs from '@/components/home/WhyUs';
import FleetShowcase from '@/components/home/FleetShowcase';
import Testimonials from '@/components/home/Testimonials';
import Footer from '@/components/home/Footer';
import BookingModal from '@/components/home/BookingModal';

export default function HomePage() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(undefined);
  const [selectedDestination, setSelectedDestination] = useState<string | undefined>(undefined);

  const handleOpenBooking = (packageId?: string) => {
    setSelectedPackageId(packageId);
    setIsBookingOpen(true);
  };

  const handleSelectDestination = (destName: string) => {
    setSelectedDestination(destName);
    setIsBookingOpen(true);
  };

  const handleSelectExperience = (exp: Experience) => {
    setSelectedDestination(exp.location);
    setIsBookingOpen(true);
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setIsBookingOpen(true);
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
        {/* Full-Bleed Hero Section with Floating Preview Cards */}
        <Hero onOpenBooking={handleOpenBooking} />

        {/* Limited-Time Seasonal Promo Offer Banner */}
        <PromoBanner onOpenBooking={() => handleOpenBooking()} />

        {/* Featured Destinations Bento Grid */}
        <Destinations onSelectDestination={handleSelectDestination} />

        {/* Popular Tour Packages Grid */}
        <TourPackages
          currency={currency}
          onSelectPackage={(pkgId) => handleOpenBooking(pkgId)}
        />

        {/* Activities & Experiences Slider */}
        <Experiences
          currency={currency}
          onSelectExperience={handleSelectExperience}
        />

        {/* Why Choose Us Minimalist Pillars */}
        <WhyUs />

        {/* Executive Vehicle Fleet Showcase */}
        <FleetShowcase
          currency={currency}
          onSelectVehicle={handleSelectVehicle}
        />

        {/* Traveler Gallery & 5-Star Testimonials */}
        <Testimonials />
      </main>

      {/* Comprehensive Dark Footer with WhatsApp Floating CTA */}
      <Footer />

      {/* 7-Step Interactive Itinerary & Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        currency={currency}
        initialPackageId={selectedPackageId}
        initialDestination={selectedDestination}
      />
    </div>
  );
}
