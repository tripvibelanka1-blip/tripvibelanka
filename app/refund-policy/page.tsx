import React from 'react';
import type { Metadata } from 'next';
import PolicyLayout from '@/components/legal/PolicyLayout';
import { RefreshCw, Calendar, AlertTriangle, CheckCircle2, Clock, ShieldCheck, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Tripvibe Lanka - Fair 20% Advance Terms',
  description:
    'Review Tripvibe Lanka official Refund and Cancellation Policy. Transparent notice tiers, 7-day refund processing to original payment method via PayHere, and 20% max deposit exposure.',
  keywords: [
    'Tripvibe Lanka refund policy',
    'Sri Lanka tour cancellation policy',
    'PayHere tour refund terms',
    'Sri Lanka private tour deposit refund',
  ],
  alternates: {
    canonical: 'https://tripvibelanka.com/refund-policy',
  },
  openGraph: {
    title: 'Refund & Cancellation Policy | Tripvibe Lanka',
    description:
      'Clear, fair, and transparent refund & cancellation terms for private chauffeured journeys in Sri Lanka.',
    url: 'https://tripvibelanka.com/refund-policy',
    type: 'website',
  },
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      subtitle="Clear, fair cancellation terms designed to protect your investment with minimal deposit exposure."
      lastUpdated="Last updated: September 2026"
      activeSlug="refund-policy"
    >
      {/* 20% Advance Guarantee Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 space-y-1">
          <p className="font-semibold text-slate-900">
            Low-Risk Booking: 20% Maximum Exposure
          </p>
          <p>
            Because Tripvibe Lanka only collects a <strong>20% advance payment</strong> to confirm your vehicle and guide, your financial exposure is capped at just that deposit. The remaining 80% balance is never charged until your tour begins.
          </p>
        </div>
      </div>

      {/* How Our Booking Works */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            1
          </span>
          <span>How Our Booking Works</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Booking with Trip Vibe Lanka is simple. We only require a{' '}
          <strong className="text-slate-900">20% advance payment</strong> to confirm your tour. The remaining balance is settled directly with your guide — no complicated payment schedules, no hidden fees.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* Cancellation by the Customer */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>Cancellation by the Customer</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            If you need to cancel your booking, please notify us as soon as possible via WhatsApp or email.
          </p>
        </div>

        {/* Refund Matrix Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3.5">
                  Notice Period
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3.5 text-right sm:text-left">
                  Refund on Advance Paid
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 sm:px-6 py-4 font-medium text-slate-900">
                  30 days or more before tour
                </td>
                <td className="px-4 sm:px-6 py-4 text-right sm:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Full refund of advance (100%)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 sm:px-6 py-4 font-medium text-slate-900">
                  15 – 29 days before tour
                </td>
                <td className="px-4 sm:px-6 py-4 text-right sm:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    50% refund of advance
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 sm:px-6 py-4 font-medium text-slate-900">
                  Less than 15 days before tour
                </td>
                <td className="px-4 sm:px-6 py-4 text-right sm:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    No refund of advance
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 sm:px-6 py-4 font-medium text-slate-900">
                  No show (no notice given)
                </td>
                <td className="px-4 sm:px-6 py-4 text-right sm:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    No refund
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
          Since you only pay <strong>20% upfront</strong>, your maximum exposure at any point is just that advance — the balance is never charged until your tour begins.
        </p>
      </section>

      <hr className="border-slate-200/80" />

      {/* Amendments & Date Changes */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            3
          </span>
          <span>Amendments &amp; Date Changes</span>
        </h2>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>Date change requests must be made at least <strong>14 days</strong> before your tour start date.</li>
          <li>Subject to vehicle and guide availability, we will do our best to accommodate changes at <strong>no extra cost</strong>.</li>
          <li>Changes requested within 7 days of the tour may be treated as a cancellation depending on availability.</li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* Cancellation by Trip Vibe Lanka */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            4
          </span>
          <span>Cancellation by Trip Vibe Lanka</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          In the rare event that we need to cancel your tour (due to extreme weather, safety concerns, or unforeseen circumstances):
        </p>
        <ul className="space-y-2 list-disc list-inside text-slate-600 pl-2">
          <li>You will be notified as early as possible.</li>
          <li>
            A <strong className="text-slate-900">full refund</strong> of your advance payment will be issued within <strong>7 business days</strong>.
          </li>
          <li>We will offer to reschedule your tour at no additional cost if you prefer.</li>
        </ul>
      </section>

      <hr className="border-slate-200/80" />

      {/* How to Cancel or Request a Refund */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            5
          </span>
          <span>How to Cancel or Request a Refund</span>
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Simply message us on WhatsApp or email with your name and booking details:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Direct WhatsApp Support
            </span>
            <a
              href="https://wa.me/94761560046?text=Hello%20Tripvibe%20Lanka!%20I%20would%20like%20to%20request%20a%20booking%20amendment%20or%20cancellation."
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-slate-900 hover:text-[#FF6B00] transition-colors mt-0.5 inline-block"
            >
              076 156 0046
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Instagram Channel
            </span>
            <a
              href="https://www.instagram.com/trip_vibe_lanka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-slate-900 hover:text-[#FF6B00] transition-colors mt-0.5 inline-block"
            >
              @trip_vibe_lanka
            </a>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            Eligible refunds are processed within <strong>7 business days</strong> directly to the original payment method (via PayHere).
          </span>
        </div>
      </section>

      <hr className="border-slate-200/80" />

      {/* Contact */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
            6
          </span>
          <span>Contact</span>
        </h2>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1">
          <p className="font-bold text-slate-900 font-heading text-base">Trip Vibe Lanka</p>
          <p>Colombo, Sri Lanka</p>
          <p>
            Phone / WhatsApp:{' '}
            <a href="tel:+94761560046" className="text-[#FF6B00] font-semibold hover:underline">
              076 156 0046
            </a>
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}
