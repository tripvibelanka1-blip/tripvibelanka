import React from 'react';
import type { Metadata } from 'next';
import PolicyLayout from '@/components/legal/PolicyLayout';
import { ShieldCheck, CreditCard, Compass, AlertCircle, FileCheck, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Tripvibe Lanka - Official Tour Booking Terms',
  description:
    'Review the official Terms & Conditions for booking private guided tours in Sri Lanka with Tripvibe Lanka. Transparent 20% deposit, PayHere verified payment gateway.',
  keywords: [
    'Tripvibe Lanka terms and conditions',
    'Sri Lanka tour booking terms',
    'PayHere tour booking terms',
    'Sri Lanka private tour contract',
  ],
  alternates: {
    canonical: 'https://tripvibelanka.com/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | Tripvibe Lanka',
    description:
      'Official booking agreement and terms for private chauffeur-guided tours across Sri Lanka.',
    url: 'https://tripvibelanka.com/terms',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Please read these terms and conditions carefully before booking your private journey with Tripvibe Lanka."
      lastUpdated="Last updated: September 2026"
      activeSlug="terms"
    >
      {/* Overview Highlight Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 space-y-1">
          <p className="font-semibold text-slate-900">
            Transparent Booking Guarantee
          </p>
          <p>
            Tripvibe Lanka operates with complete pricing transparency. Only a <strong>20% advance payment</strong> is required to secure your private vehicle, licensed guide, and travel dates.
          </p>
        </div>
      </div>

      {/* 1. Introduction */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            1
          </span>
          <span>Introduction</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Welcome to Trip Vibe Lanka. By booking a tour or using our website (
          <a href="https://tripvibelanka.com" className="text-[#FF6B00] font-medium hover:underline">
            tripvibelanka.com
          </a>
          ), you agree to be bound by these Terms &amp; Conditions. Please read them carefully before making a booking.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Trip Vibe Lanka is a Sri Lanka-based inbound tour company operating out of Colombo, Sri Lanka. We provide private guided tour packages for international and local travellers across Sri Lanka.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 2. Bookings & Confirmation */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            2
          </span>
          <span>Bookings &amp; Confirmation</span>
        </h2>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>All bookings are subject to availability and are confirmed only upon receipt of the advance payment.</li>
          <li>
            A booking confirmation will be sent to you via email or WhatsApp once the advance payment is received and verified.
          </li>
          <li>Trip Vibe Lanka reserves the right to decline any booking at its discretion.</li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* 3. Payments */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            3
          </span>
          <span>Payments</span>
        </h2>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>
            An advance payment of <strong>20% of the total tour price</strong> is required to confirm your booking.
          </li>
          <li>
            The remaining balance is due before or on the first day of the tour, unless otherwise agreed in writing.
          </li>
          <li>
            Payments can be made via our online payment gateway (<strong>PayHere</strong>) or via bank transfer.
          </li>
          <li>
            All prices are quoted in Sri Lankan Rupees (LKR) unless otherwise stated. For international customers, payments may also be accepted in USD at the applicable exchange rate.
          </li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* 4. Pricing */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            4
          </span>
          <span>Pricing</span>
        </h2>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>Tour prices are as published on the website or as quoted directly to the customer.</li>
          <li>
            Prices include services specified in the tour package (accommodation, transport, guide services, meals where mentioned).
          </li>
          <li>
            Prices do not include international flights, travel insurance, personal expenses, optional activities, or visa fees unless explicitly stated.
          </li>
          <li>
            Trip Vibe Lanka reserves the right to adjust prices due to unforeseen cost increases (e.g., fuel surcharges, government levies). Customers will be notified in advance.
          </li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* 5. Itinerary Changes */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            5
          </span>
          <span>Itinerary Changes</span>
        </h2>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>
            Trip Vibe Lanka reserves the right to modify tour itineraries due to weather conditions, road closures, natural events, or other circumstances beyond our control.
          </li>
          <li>
            Where changes are necessary, we will offer alternative arrangements of equal or similar value.
          </li>
          <li>
            We are not liable for any losses, costs, or inconvenience arising from itinerary changes due to force majeure.
          </li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* 6. Customer Responsibilities */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            6
          </span>
          <span>Customer Responsibilities</span>
        </h2>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>Customers are responsible for holding a valid passport and any required visas for Sri Lanka.</li>
          <li>Customers are responsible for obtaining appropriate travel insurance prior to travel.</li>
          <li>
            Customers must inform Trip Vibe Lanka of any health conditions, dietary requirements, or special needs at the time of booking.
          </li>
          <li>
            Customers are expected to behave respectfully towards guides, drivers, and local communities at all times.
          </li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* 7. Liability */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            7
          </span>
          <span>Liability</span>
        </h2>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>
            Trip Vibe Lanka acts as an inbound tour operator and facilitates travel arrangements. We are not liable for personal injury, illness, death, property damage, or other loss arising from circumstances outside our control.
          </li>
          <li>
            We are not responsible for the actions or omissions of third-party service providers (hotels, transport operators, etc.).
          </li>
          <li>Travel insurance is strongly recommended for all travellers.</li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* 8. Force Majeure */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            8
          </span>
          <span>Force Majeure</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Trip Vibe Lanka shall not be liable for any failure or delay in performing its obligations where such failure or delay results from events beyond its reasonable control, including but not limited to: natural disasters, acts of government, pandemic or health emergencies, civil unrest, or extreme weather conditions.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 9. Intellectual Property */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            9
          </span>
          <span>Intellectual Property</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          All content on tripvibelanka.com including text, images, logos, and videos is the property of Trip Vibe Lanka and may not be reproduced without prior written permission.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 10. Governing Law */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            10
          </span>
          <span>Governing Law</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          These Terms &amp; Conditions are governed by the laws of Sri Lanka. Any disputes shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 11. Contact */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            11
          </span>
          <span>Contact</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          For any questions regarding these Terms &amp; Conditions:
        </p>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1">
          <p className="font-bold text-slate-900 font-heading text-base">Trip Vibe Lanka</p>
          <p>Colombo, Sri Lanka</p>
          <p>
            Phone / WhatsApp:{' '}
            <a href="tel:+94761560046" className="text-[#FF6B00] font-semibold hover:underline">
              076 156 0046
            </a>
          </p>
          <p>
            Instagram:{' '}
            <a
              href="https://www.instagram.com/trip_vibe_lanka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF6B00] font-semibold hover:underline"
            >
              @trip_vibe_lanka
            </a>
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}
