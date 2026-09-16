import React from 'react';
import type { Metadata } from 'next';
import PolicyLayout from '@/components/legal/PolicyLayout';
import { Lock, Shield, Eye, Database, FileCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tripvibe Lanka - Data Protection & PayHere Security',
  description:
    'Read the official Privacy Policy of Tripvibe Lanka. Learn how we securely protect customer booking data, process payments via PayHere, and safeguard your personal privacy.',
  keywords: [
    'Tripvibe Lanka privacy policy',
    'Sri Lanka tour data privacy',
    'PayHere security privacy Sri Lanka',
    'traveler data protection Sri Lanka',
  ],
  alternates: {
    canonical: 'https://tripvibelanka.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Tripvibe Lanka',
    description:
      'We are committed to protecting your personal information and processing payments securely via PayHere.',
    url: 'https://tripvibelanka.com/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="Learn how we collect, use, and protect your personal information when booking private tours with Tripvibe Lanka."
      lastUpdated="Last updated: September 2026"
      activeSlug="privacy"
    >
      {/* PayHere Security Highlight Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3.5">
        <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 space-y-1">
          <p className="font-semibold text-slate-900">
            Encrypted Payments &amp; Zero Card Storage
          </p>
          <p>
            All online transactions are securely encrypted and processed directly via <strong>PayHere</strong>. Tripvibe Lanka never stores your card numbers, CVVs, or sensitive payment credentials on our servers.
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
          Trip Vibe Lanka (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights in relation to it.
        </p>
        <p className="text-slate-600 leading-relaxed">
          By using our website (
          <a href="https://tripvibelanka.com" className="text-[#FF6B00] font-medium hover:underline">
            tripvibelanka.com
          </a>
          ) or making a booking with us, you agree to the collection and use of your information as described in this policy.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 2. Information We Collect */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            2
          </span>
          <span>Information We Collect</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          We may collect the following personal information from you:
        </p>
        <ul className="space-y-2.5 text-slate-600 pl-2">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-2 shrink-0" />
            <span>
              <strong className="text-slate-900">Identity information</strong> — Full name, nationality, passport number (where required for safari/wildlife/national park permits).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-2 shrink-0" />
            <span>
              <strong className="text-slate-900">Contact information</strong> — Email address, phone number, WhatsApp number.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-2 shrink-0" />
            <span>
              <strong className="text-slate-900">Booking information</strong> — Tour dates, number of travellers, special requests, dietary requirements.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-2 shrink-0" />
            <span>
              <strong className="text-slate-900">Payment information</strong> — Payment details processed securely through our payment gateway (PayHere). We do not store your card details on our servers.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-2 shrink-0" />
            <span>
              <strong className="text-slate-900">Communication data</strong> — Messages sent to us via WhatsApp, email, or the website contact form.
            </span>
          </li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* 3. How We Use Your Information */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            3
          </span>
          <span>How We Use Your Information</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          We use your personal information to:
        </p>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>Process and confirm your tour bookings</li>
          <li>Communicate with you about your booking, itinerary, and travel details</li>
          <li>Process payments securely through PayHere</li>
          <li>Arrange accommodation, transport, and other services included in your tour</li>
          <li>Respond to your enquiries and provide customer support</li>
          <li>Improve our website and services</li>
          <li>Send booking confirmations and important travel updates</li>
        </ul>
        <p className="text-slate-600 leading-relaxed pt-1 italic">
          We do not use your information for unsolicited marketing without your consent.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 4. Sharing Your Information */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            4
          </span>
          <span>Sharing Your Information</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          We may share your information with:
        </p>
        <ul className="space-y-2.5 text-slate-600 pl-2">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
            <span>
              <strong className="text-slate-900">Service providers</strong> — Hotels, transport operators, and activity providers as necessary to fulfil your tour booking.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
            <span>
              <strong className="text-slate-900">Payment processors</strong> — PayHere (our online payment gateway) for secure payment processing.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
            <span>
              <strong className="text-slate-900">Legal authorities</strong> — Where required by law or regulation in Sri Lanka.
            </span>
          </li>
        </ul>
        <p className="text-slate-700 font-semibold pt-1">
          We do not sell, rent, or trade your personal information to third parties for marketing purposes.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 5. Data Storage & Security */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            5
          </span>
          <span>Data Storage &amp; Security</span>
        </h2>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>Your personal data is stored securely and access is limited to authorised personnel only.</li>
          <li>
            Payment transactions are processed through PayHere&apos;s secure, encrypted gateway. We do not store card numbers or sensitive payment data on our systems.
          </li>
          <li>
            While we take all reasonable steps to protect your data, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.
          </li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* 6. Data Retention */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            6
          </span>
          <span>Data Retention</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          We retain your personal information for as long as necessary to fulfil the purposes described in this policy, or as required by law. Booking records are typically retained for a period of <strong>3 years</strong>.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 7. Your Rights */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            7
          </span>
          <span>Your Rights</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          You have the right to:
        </p>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>Request access to the personal data we hold about you</li>
          <li>Request correction of inaccurate or incomplete data</li>
          <li>Request deletion of your data (subject to legal obligations)</li>
          <li>Withdraw consent at any time where processing is based on consent</li>
        </ul>
        <p className="text-slate-600 leading-relaxed pt-1">
          To exercise any of these rights, contact us at the details below.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 8. Cookies */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            8
          </span>
          <span>Cookies</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Our website may use cookies to improve your browsing experience. You can control cookie settings through your browser. Disabling cookies may affect certain website functionality.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 9. Third-Party Links */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            9
          </span>
          <span>Third-Party Links</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Our website may contain links to third-party websites (e.g., TripAdvisor, social media). We are not responsible for the privacy practices of those sites and encourage you to review their policies independently.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* 10. Changes to This Policy */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            10
          </span>
          <span>Changes to This Policy</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. Continued use of our website after changes constitutes your acceptance of the updated policy.
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
          For any privacy-related questions or requests:
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
