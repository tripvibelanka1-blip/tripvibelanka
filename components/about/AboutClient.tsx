'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  ShieldCheck,
  Star,
  Users,
  UtensilsCrossed,
  MessageCircle,
  PhoneCall,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Car,
  Check,
  Camera,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import AboutNavbar from '@/components/about/AboutNavbar';
import Footer from '@/components/home/Footer';
import BookingModal from '@/components/home/BookingModal';
import { createClient } from '@/utils/supabase/client';
import { SiteSettings } from '@/types/database';

// Official TripAdvisor SVG Icon
function TripAdvisorIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Tripadvisor">
      <path d="M19.34 7.15c-1.22 0-2.31.5-3.1 1.3a7.48 7.48 0 0 0-8.48 0c-.79-.8-1.88-1.3-3.1-1.3C2.08 7.15.5 8.73.5 10.69c0 1.96 1.58 3.54 3.54 3.54.34 0 .66-.05.97-.14a7.46 7.46 0 0 0 13.98 0c.31.09.63.14.97.14 1.96 0 3.54-1.58 3.54-3.54 0-1.96-1.58-3.54-3.54-3.54zM4.04 12.83c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14zm7.96 3.86a5.97 5.97 0 0 1-5.69-4.14c.54-.38 1.16-.65 1.83-.78a4.13 4.13 0 0 1 7.72 0c.67.13 1.29.4 1.83.78a5.97 5.97 0 0 1-5.69 4.14zm7.96-3.86c-1.18 0-2.14-.96-2.14-2.14 0-1.18.96-2.14 2.14-2.14 1.18 0 2.14.96 2.14 2.14 0 1.18-.96 2.14-2.14 2.14z" />
      <circle cx="4.04" cy="10.69" r="1.1" />
      <circle cx="19.96" cy="10.69" r="1.1" />
      <circle cx="12" cy="7.2" r="1" />
    </svg>
  );
}

// Official TikTok SVG Icon
function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="TikTok">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-.88-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.49V8.58a8.3 8.3 0 0 0 5-1.89l-1.18-2z" />
    </svg>
  );
}

// Instagram SVG Icon
function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-label="Instagram">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Facebook SVG Icon
function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Facebook">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const DEFAULT_TRIPADVISOR_URL =
  'https://www.tripadvisor.com/Attraction_Review-g293962-d33287122-Reviews-Trip_Vibe_Lanka-Colombo_Western_Province.html';

// 7 Real Guest Moments (Strict 4:3 Aspect Ratio)
const REAL_GUEST_MOMENTS = [
  {
    id: 1,
    src: '/gallery/sigiriya-tourists.png',
    alt: 'Tripvibe Lanka guests and private guide in front of Sigiriya Rock Fortress',
    title: 'Ancient Sigiriya Rock Citadel',
    location: 'Sigiriya, Cultural Triangle',
    caption: 'Golden hour smiles with our private chauffeur guide at the foot of the 5th-century UNESCO rock fortress.',
    tag: 'Cultural Heritage',
  },
  {
    id: 2,
    src: '/gallery/ella-mountains.png',
    alt: 'International couple exploring mountain viewpoints in Ella with Tripvibe guide Luca',
    title: 'Misty Ella Mountain Ranges',
    location: "Little Adam's Peak, Ella",
    caption: 'Panoramic highland trails, morning mist, and unhurried exploration with Luca and the island team.',
    tag: 'Highland Escapes',
  },
  {
    id: 3,
    src: '/gallery/nuwara-eliya-tea.png',
    alt: 'Travelers learning authentic Ceylon tea harvesting in Nuwara Eliya estates',
    title: 'Hands-on Ceylon Tea Harvest',
    location: 'Nuwara Eliya Tea Country',
    caption: 'Traditional basket plucking amidst rolling hillside estates, shared with laughter and genuine warmth.',
    tag: 'Authentic Ceylon',
  },
  {
    id: 4,
    src: '/gallery/waterfall-explore.png',
    alt: 'Guests exploring cascading mountain waterfalls with private Tripvibe guide',
    title: 'Cascading Mountain Waterfalls',
    location: 'St. Clair & Ramboda Valley',
    caption: 'Discovering hidden rocky gorges and pristine natural pools far away from crowded tour bus stops.',
    tag: 'Untamed Nature',
  },
  {
    id: 5,
    src: '/gallery/kandy-viewpoint.png',
    alt: 'Guests overlooking panoramic Kandy Lake and city hills with chauffeur hosts',
    title: 'Panoramic Kandy Hillside Overlook',
    location: 'Kandy Lake & Royal City',
    caption: 'Taking in the calm beauty of the historic royal lake and temple city from private scenic vantage points.',
    tag: 'Royal Heritage',
  },
  {
    id: 6,
    src: '/gallery/temple-viewpoint.png',
    alt: 'Guests holding traditional yellow flowers at a scenic temple viewpoint',
    title: 'Sacred Hilltop Traditions & Offerings',
    location: 'Central Province Viewpoint',
    caption: 'Experiencing authentic Sri Lankan cultural hospitality, flower offerings, and peaceful mountain lookouts.',
    tag: 'Spiritual Ceylon',
  },
  {
    id: 7,
    src: '/gallery/colombo-arcade.png',
    alt: 'Travelers with Tripvibe host at historic Arcade Independence Square Colombo',
    title: 'Historic Colombo Architecture',
    location: 'Independence Square, Colombo',
    caption: 'Whitewashed colonial arcades and vibrant urban culture upon touchdown in the oceanfront capital.',
    tag: 'Capital Heritage',
  },
];

// 7 Key Uncompromising Commitments
const OUR_PROMISES = [
  {
    title: '100% Tailored Private Itineraries',
    description: 'No rigid group schedules. Every stop, daily wakeup time, and scenic detour is sculpted around your personal wishes.',
  },
  {
    title: 'Dedicated Island Chauffeur Guides',
    description: 'Local hosts who grew up here, know the secret scenic backroads, and accompany you with genuine warmth and safety.',
  },
  {
    title: 'Certified Halal-Friendly Hospitality',
    description: 'Pre-vetted halal culinary stops, prayer time coordination, and family-first privacy arranged smoothly on request.',
  },
  {
    title: '24/7 Island Concierge Care',
    description: 'Direct WhatsApp communication with your personal travel planner from airport greeting to your departure gate farewell.',
  },
  {
    title: 'Complete Financial Transparency',
    description: 'Clear, itemized quotes with zero hidden booking surcharges, unexpected driver meal fees, or tourist traps.',
  },
  {
    title: 'Curated Boutique Stays',
    description: 'Handpicked colonial tea bungalows, boutique beach villas, and scenic eco-lodges vetted for top comfort and cleanliness.',
  },
  {
    title: 'Authentic Human Memories',
    description: 'Heartfelt cultural conversations, tranquil vistas, and genuine local friendships that you will cherish for life.',
  },
];

// Verified TripAdvisor Testimonials
const VERIFIED_REVIEWS = [
  {
    author: 'Leonardo B.',
    country: 'Italy',
    date: 'Verified TripAdvisor Guest',
    quote: 'Started as drivers, ended as friends. Luca was incredible, taking care of every tiny detail with patience and joy.',
    highlight: 'Started as drivers, ended as friends',
  },
  {
    author: 'Esmablb',
    country: 'France',
    date: 'Couple Holiday',
    quote: 'A real journey out of time that we are not about to forget. Total immersion in the real Sri Lanka, away from mass tourism.',
    highlight: 'A real journey out of time',
  },
  {
    author: 'Hadi Al-Hashimi',
    country: 'Kuala Lumpur, Malaysia',
    date: 'Family Tour',
    quote: 'They did not just plan a tour. They delivered an experience. The halal dining arrangements and thoughtful pacing were flawless.',
    highlight: 'Delivered a true experience',
  },
  {
    author: 'Departure42728',
    country: 'United Kingdom',
    date: 'Private Circuit',
    quote: 'Everything was perfectly organised from day one. We never felt like strangers. The car was spotless and comfortable.',
    highlight: 'Never felt like strangers',
  },
  {
    author: 'Mazen E.',
    country: 'United Arab Emirates',
    date: 'VIP Private Tour',
    quote: 'The best way to ensure a smooth, safe and fully satisfying journey is to hire a trustworthy guide service. That is Tripvibe Lanka.',
    highlight: 'Smooth, safe and trustworthy',
  },
  {
    author: 'Nellita L.',
    country: 'Switzerland',
    date: 'Solo Traveler',
    quote: 'Our tour guider was very soft spoken and knows his country very well. 5/5. We had a very incredible and memorable day.',
    highlight: 'Soft spoken and knows the country',
  },
];

export default function AboutClient() {
  const { currency, setCurrency } = useCurrency();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
        if (data) {
          setSiteSettings(data);
        }
      } catch (err) {
        console.warn('Could not fetch site_settings in about page:', err);
      }
    }
    loadSettings();
  }, []);

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === 0 ? REAL_GUEST_MOMENTS.length - 1 : prev - 1) : 0
        );
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === REAL_GUEST_MOMENTS.length - 1 ? 0 : prev + 1) : 0
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  const phone = siteSettings?.company_phone || '076 156 0046';
  const rawWhatsapp = siteSettings?.whatsapp_number || '94761560046';
  const cleanWhatsappDigits = rawWhatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(
    'Hello Tripvibe Lanka! I would like to plan a bespoke private tour in Sri Lanka.'
  )}`;
  const tripadvisorUrl = siteSettings?.tripadvisor_url || DEFAULT_TRIPADVISOR_URL;
  const instagramUrl = siteSettings?.instagram_url || 'https://instagram.com/tripvibelanka';
  const facebookUrl = siteSettings?.facebook_url || 'https://facebook.com/tripvibelanka';
  const tiktokUrl = siteSettings?.tiktok_url || 'https://tiktok.com/@tripvibelanka';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-orange-500/20 selection:text-orange-950 font-body">
      {/* Zero-jank Scroll Sentinel */}
      <div id="scroll-sentinel" className="absolute top-0 left-0 w-full h-10 pointer-events-none -z-10" />

      {/* About Page Navigation Bar (Exact same style as Home Page, About-specific links) */}
      <AboutNavbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => setIsBookingOpen(true)}
      />

      <main className="pt-24 sm:pt-28">
        {/* ========================================================== */}
        {/* 1. HERO SECTION: BRAND SOUL & VALUES                       */}
        {/* ========================================================== */}
        <section id="hero" className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-6 pb-12 sm:pb-16">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-gradient-to-tr from-amber-200/35 via-orange-100/25 to-emerald-100/30 blur-3xl pointer-events-none -z-10 rounded-full" />

          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Editorial Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-stone-200/90 text-stone-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              <span className="font-heading tracking-wide uppercase text-[11px] text-stone-600">
                Bespoke Sri Lanka Travel Collective
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-slate-900 font-heading leading-[1.12]">
              We Do Not Just Show You Sri Lanka.{' '}
              <span className="font-semibold text-slate-950 block sm:inline">
                We Let You Feel It.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
              Bespoke private journeys, native chauffeur guides, and authentic island encounters handcrafted around your personal pace.
            </p>

            {/* Dual Primary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#FF6B00] hover:bg-[#E55F00] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <span>Plan Custom Journey</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 text-slate-800 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp 24/7</span>
              </a>
            </div>
          </div>

          {/* Dedicated Trust Credentials Strip Under Hero */}
          <div className="mt-12 pt-6 border-t border-stone-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <a
              href={tripadvisorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs hover:border-emerald-500/60 hover:shadow-xs transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <TripAdvisorIcon className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                  5.0 on Tripadvisor
                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                </span>
                <span className="text-[11px] text-slate-500">100% 5-Star Reviews</span>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900">Halal-Friendly Hospitality</span>
                <span className="text-[11px] text-slate-500">Certified Dining &amp; Privacy</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
                <Car className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900">Private Chauffeur Fleet</span>
                <span className="text-[11px] text-slate-500">Air-conditioned &amp; Unhurried</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 2. OUR STORY: CONTRAST, PURPOSE & THE CEYLON DISTINCTION   */}
        {/* ========================================================== */}
        <section id="story" className="py-16 sm:py-24 bg-white border-y border-stone-200/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Narrative */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                  <Compass className="w-4 h-4" />
                  <span>Our Story</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-light text-slate-900 font-heading tracking-tight leading-snug">
                  From Cookie-Cutter Tours to{' '}
                  <span className="font-semibold text-slate-950">Soulful Exploration</span>
                </h2>

                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                  Sri Lanka has everything: emerald tea valleys that disappear into morning mist, pristine coral reefs along the warm Indian Ocean, jungles where wild leopards still roam free, and ancient royal citadels standing for over two millennia.
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Yet most international travelers only ever scratch the surface. Rushed schedules, rigid 40-passenger bus groups, and commercial commission traps whisk visitors past the moments that actually make travel meaningful.
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Tripvibe Lanka was born from a simple conviction: the finest journeys are built around people, genuine human connection, and untamed natural beauty. We are a boutique collective of native island guides, private chauffeurs, and itinerary planners. We accompany you with pride, authenticity, and respect.
                </p>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>From Touchdown to Farewell, We Take Care of Every Mile</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Personal airport greeting with fresh flower garlands. Smooth coastal highway transfers. Handpicked boutique villas. Secret roadside viewpoints where you can sip king coconut water while the sun sets over the palm canopy.
                  </p>
                </div>
              </div>

              {/* Right Column: Comparative Bento Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-3xl bg-[#FAF9F6] border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
                      The Tripvibe Difference
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Bespoke Standard
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400 line-through">Rigid Tour Group Schedules</span>
                        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Your Pace
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Sleep in when you want, stay longer at sunset viewpoints, and never rush for a bus call.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400 line-through">Commercial Gift Shops</span>
                        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Authentic Gems
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Family-run tea factories, authentic village pottery, and secluded scenic lookouts.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400 line-through">Impersonal Call Centers</span>
                        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Native Hosts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Luca, Mishal, and Abdul: dedicated local companions who treat you like visiting family.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">100% Tailor-made Private Chauffeurs</span>
                    <span className="font-bold text-slate-900 font-heading">Zero Hidden Fees</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 3. WHO WE ARE: LUCA, MISHAL, ABDUL & THE TRIPVIBE FAMILY   */}
        {/* ========================================================== */}
        <section id="team" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              <Users className="w-4 h-4" />
              <span>Who We Are</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
              Not a Faceless Booking Engine.{' '}
              <span className="font-semibold text-slate-950">A Dedicated Team.</span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Luca, Mishal, Director Abdul, and our island team are the real people you will meet on arrival. When you reserve with Tripvibe Lanka, you travel in the hands of people who treat your holiday with deep personal responsibility.
            </p>
          </div>

          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 1. Luca (Luka) */}
            <div className="rounded-3xl p-8 bg-white border border-stone-200/90 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-2xs">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800 font-bold text-xl font-heading shadow-2xs group-hover:scale-105 transition-transform">
                    L
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Lead Chauffeur Guide
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-heading">Luca (Luka)</h3>
                  <span className="text-xs font-semibold text-[#FF6B00] uppercase tracking-wider block mt-0.5">
                    Senior Route Specialist &amp; Cultural Storyteller
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Celebrated across TripAdvisor for boundless generosity, passion, and cultural storytelling. Luca ensures every traveler feels completely at home, discovering hidden waterfalls and quiet viewpoint stops far away from mass tour buses.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 space-y-2">
                <div className="flex items-center gap-1 text-emerald-600">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-emerald-600" />
                  ))}
                  <span className="text-[10px] font-bold text-slate-500 ml-1">TripAdvisor Review</span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;Luca accompanied us with passion, generosity and authenticity. Much more than just a guide, we felt almost at home.&rdquo;
                </p>
                <span className="text-[11px] font-semibold text-slate-400 block">Esmablb, France</span>
              </div>
            </div>

            {/* 2. Mishal (Micha) */}
            <div className="rounded-3xl p-8 bg-white border border-stone-200/90 hover:border-orange-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-2xs">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF6B00] font-bold text-xl font-heading shadow-2xs group-hover:scale-105 transition-transform">
                    M
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                    Itinerary Curator
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-heading">Mishal (Micha)</h3>
                  <span className="text-xs font-semibold text-[#FF6B00] uppercase tracking-wider block mt-0.5">
                    Island Concierge &amp; Halal Hospitality Lead
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  A master of logistics and personal touches. Mishal curates seamless transitions, handpicks scenic tea country bungalows, and coordinates specialized halal dining and prayer-friendly itineraries with unmatched attention to detail.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 space-y-2">
                <div className="flex items-center gap-1 text-emerald-600">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-emerald-600" />
                  ))}
                  <span className="text-[10px] font-bold text-slate-500 ml-1">TripAdvisor Review</span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;Mishal went above and beyond, making me feel safe, respected, and genuinely cared for throughout our travel.&rdquo;
                </p>
                <span className="text-[11px] font-semibold text-slate-400 block">Verified TripAdvisor Guest</span>
              </div>
            </div>

            {/* 3. Director Abdul */}
            <div className="rounded-3xl p-8 bg-white border border-stone-200/90 hover:border-sky-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-2xs">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-800 font-bold text-xl font-heading shadow-2xs group-hover:scale-105 transition-transform">
                    A
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                    VIP Operations
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-heading">Director Abdul</h3>
                  <span className="text-xs font-semibold text-[#FF6B00] uppercase tracking-wider block mt-0.5">
                    Executive Host &amp; VIP Airport Welcome
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Famous for welcoming guests at Colombo Airport with traditional fresh flower garlands. Abdul coordinates private executive fleet transport, bespoke family circuits, and visits to authentic spice gardens with warm island hospitality.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 space-y-2">
                <div className="flex items-center gap-1 text-emerald-600">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-emerald-600" />
                  ))}
                  <span className="text-[10px] font-bold text-slate-500 ml-1">TripAdvisor Review</span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;Picked up by our Director Abdul with flower garlands... informative, fun, and wonderful to travel with.&rdquo;
                </p>
                <span className="text-[11px] font-semibold text-slate-400 block">Leonardo B., Italy</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 4. REAL GUEST MOMENTS: 100% AUTHENTIC UNFILTERED MEMORIES  */}
        {/* Strictly 4:3 Aspect Ratio, Anti-Slop, High-Trust Gallery  */}
        {/* ========================================================== */}
        <section id="moments" className="py-20 sm:py-28 bg-white border-y border-stone-200/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF6B00] border border-orange-200/80 shadow-2xs">
                <Camera className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Real Travelers · Real Moments</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
                Authentic Island Journeys,{' '}
                <span className="font-semibold text-slate-950 block sm:inline">Captured in the Wild.</span>
              </h2>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                No stock photography, no staged actors. These are genuine international travelers discovering Sri Lanka with Luca, Mishal, and our private chauffeur team.
              </p>
            </div>

            {/* Gallery: 2 Top + 3 Middle + 2 Bottom (All 7 strictly 4:3) */}
            <div className="space-y-6 sm:space-y-8">
              {/* Row 1: 2 Featured Moments (Sigiriya & Ella) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {REAL_GUEST_MOMENTS.slice(0, 2).map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="rounded-3xl bg-[#FAF9F6] border border-stone-200/90 shadow-2xs hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                      {/* Location Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/55 backdrop-blur-md text-white border border-white/20 shadow-xs">
                          <MapPin className="w-3 h-3 text-[#FF6B00]" />
                          <span>{item.location}</span>
                        </span>
                      </div>

                      {/* Expand Icon */}
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-xs">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Overlay Title */}
                      <div className="absolute bottom-4 inset-x-4 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 block mb-1">
                          {item.tag}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white font-heading leading-tight drop-shadow-sm">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 bg-white space-y-2 border-t border-stone-100 flex-1 flex flex-col justify-between">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {item.caption}
                      </p>
                      <div className="flex items-center gap-1.5 pt-2 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Tripvibe Guest Experience</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2: 3 Moments (Nuwara Eliya Tea, Waterfall, Kandy Viewpoint) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {REAL_GUEST_MOMENTS.slice(2, 5).map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIndex(idx + 2)}
                    className="rounded-3xl bg-[#FAF9F6] border border-stone-200/90 shadow-2xs hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                      {/* Location Badge */}
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/55 backdrop-blur-md text-white border border-white/20 shadow-xs">
                          <MapPin className="w-3 h-3 text-[#FF6B00]" />
                          <span>{item.location}</span>
                        </span>
                      </div>

                      {/* Expand Icon */}
                      <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-xs">
                          <Maximize2 className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Overlay Title */}
                      <div className="absolute bottom-3.5 inset-x-3.5 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 block mb-0.5">
                          {item.tag}
                        </span>
                        <h3 className="text-base font-bold text-white font-heading leading-tight drop-shadow-sm">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4.5 sm:p-5 bg-white space-y-2 border-t border-stone-100 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {item.caption}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Verified Guest Memory</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 3: 2 Moments (Temple Flowers & Colombo Heritage) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {REAL_GUEST_MOMENTS.slice(5, 7).map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIndex(idx + 5)}
                    className="rounded-3xl bg-[#FAF9F6] border border-stone-200/90 shadow-2xs hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                      {/* Location Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/55 backdrop-blur-md text-white border border-white/20 shadow-xs">
                          <MapPin className="w-3 h-3 text-[#FF6B00]" />
                          <span>{item.location}</span>
                        </span>
                      </div>

                      {/* Expand Icon */}
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-xs">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Overlay Title */}
                      <div className="absolute bottom-4 inset-x-4 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 block mb-1">
                          {item.tag}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white font-heading leading-tight drop-shadow-sm">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 bg-white space-y-2 border-t border-stone-100 flex-1 flex flex-col justify-between">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {item.caption}
                      </p>
                      <div className="flex items-center gap-1.5 pt-2 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Tripvibe Guest Experience</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions Banner */}
            <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#FAF9F6] border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B00] shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-heading">
                    Real Ceylon Moments, Unscripted and Unhurried
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Private air-conditioned vehicle, vetted local chauffeur guide, handpicked hotels, and 24/7 concierge.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 hover:bg-[#FF6B00] text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0 group active:scale-[0.98]"
              >
                <span>Design Custom Itinerary</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 5. SIGNATURE DIFFERENTIATOR: HALAL-FRIENDLY HOSPITALITY    */}
        {/* Re-themed to Luminous Ceylon Tea Sanctuary (No Black Void) */}
        {/* ========================================================== */}
        <section id="halal" className="py-20 sm:py-28 bg-gradient-to-b from-[#F2F7F4] via-[#F8FAF8] to-white border-y border-emerald-200/70 text-slate-900 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Halal Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-300 shadow-2xs">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Signature Differentiator</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light font-heading tracking-tight text-slate-900 leading-tight">
                  Halal-Friendly Hospitality,{' '}
                  <span className="font-semibold text-emerald-900 block sm:inline">Handcrafted with Care.</span>
                </h2>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  We warmly welcome Muslim travelers and families from the Middle East, Malaysia, Europe, and worldwide. Our native team arranges every facet of your journey to match your religious and personal preferences seamlessly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="p-4.5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-1 hover:border-emerald-400 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs font-heading">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>Certified Halal Dining</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Pre-screened halal restaurants, fresh seafood feasts, and authentic home kitchens across every stop.
                    </p>
                  </div>

                  <div className="p-4.5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-1 hover:border-emerald-400 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs font-heading">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>Prayer Time Coordination</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Daily prayer stops scheduled naturally alongside visits to local historical mosques.
                    </p>
                  </div>

                  <div className="p-4.5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-1 hover:border-emerald-400 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs font-heading">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>Family-First Privacy</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Private air-conditioned executive vehicles with dedicated respectful chauffeur guides.
                    </p>
                  </div>

                  <div className="p-4.5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-1 hover:border-emerald-400 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs font-heading">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>Alcohol-Free Stays</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Option for alcohol-free boutique villas and private dining environments upon request.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#064E3B] hover:bg-[#043E2E] text-white font-semibold text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span>Inquire About Halal Custom Tour</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Key Commitments Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-7 sm:p-8 rounded-3xl bg-white border border-emerald-200/90 shadow-xs space-y-6">
                  <div className="space-y-1 border-b border-stone-100 pb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B00]">
                      The Tripvibe Standard
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 font-heading">
                      7 Core Commitments to You
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    {OUR_PROMISES.slice(0, 5).map((promise, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-heading">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{promise.title}</h4>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{promise.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 6. VERIFIED TRIPADVISOR 5.0 REVIEW WALL                    */}
        {/* ========================================================== */}
        <section id="reviews" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <TripAdvisorIcon className="w-3.5 h-3.5 fill-emerald-700" />
              <span>Verified 5.0 Rating</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-slate-900 font-heading">
              Why Travelers Choose <span className="font-semibold text-slate-950">Tripvibe Lanka</span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              100% five-star reviews on TripAdvisor. Real words from international travelers who trusted us with their Ceylon vacations.
            </p>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VERIFIED_REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white border border-stone-200/90 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-emerald-600">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-emerald-600" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {rev.country}
                    </span>
                  </div>

                  <p className="text-sm text-slate-900 font-semibold font-heading leading-snug">
                    &ldquo;{rev.highlight}&rdquo;
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {rev.quote}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{rev.author}</span>
                  <span className="text-slate-400 text-[11px]">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href={tripadvisorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-slate-800 text-xs font-semibold tracking-wide transition-all shadow-2xs"
            >
              <TripAdvisorIcon className="w-4 h-4 fill-emerald-600" />
              <span>Read All Verified Reviews on Tripadvisor</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </section>

        {/* ========================================================== */}
        {/* 7. GET IN TOUCH: WARM CEYLON LUXURY SHOWCASE               */}
        {/* Re-designed: Warm Sand/Ivory Palette, Harmonious Buttons   */}
        {/* ========================================================== */}
        <section id="contact" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F5EFE3] border border-amber-200/90 text-slate-900 relative overflow-hidden shadow-sm">
            {/* Subtle Ambient Radial Warmth */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-[#FF6B00] text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Ready to Start Planning?</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light font-heading tracking-tight text-slate-900 leading-tight">
                Your Private Sri Lanka Voyage{' '}
                <span className="font-semibold text-slate-950 block sm:inline">Begins with a Conversation.</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Connect with our local travel specialists today. We are available 7 days a week, 24 hours a day on WhatsApp and telephone to tailor every detail to your schedule.
              </p>

              {/* Harmonious Action Channels */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Primary CTA: Brand Cinnamon Orange */}
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  className="px-6 py-3.5 rounded-full bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/25 cursor-pointer active:scale-[0.98]"
                >
                  <span>Request Custom Itinerary</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                {/* Secondary CTA: Clean Luxury White Pill with subtle WhatsApp icon */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-stone-200/90 shadow-2xs hover:border-emerald-500/50 cursor-pointer active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Call / WhatsApp: {phone}</span>
                </a>

                {/* Third Link: Clean Explore Packages */}
                <Link
                  href="/#tours"
                  className="px-5 py-3.5 rounded-full text-stone-700 hover:text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Explore Tour Packages</span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </Link>
              </div>

              {/* Social Channels Row */}
              <div className="pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
                <div className="flex items-center gap-3">
                  <span>Follow Our Daily Ceylon Moments:</span>
                  <span className="font-bold text-slate-900">@tripvibelanka</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-pink-600 flex items-center justify-center transition-colors shadow-2xs"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-blue-600 flex items-center justify-center transition-colors shadow-2xs"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-black flex items-center justify-center transition-colors shadow-2xs"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="w-4 h-4 fill-current" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Verified Footer */}
      <Footer onOpenBooking={() => setIsBookingOpen(true)} />

      {/* Booking Itinerary Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        currency={currency}
      />

      {/* Interactive Lightbox Modal for Real Guest Photos */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-stone-900 rounded-3xl border border-stone-700/80 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar: Title & Close Button */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-stone-800 text-white">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-sm font-semibold font-heading">
                  {REAL_GUEST_MOMENTS[lightboxIndex].location}
                </span>
                <span className="text-xs text-stone-400 hidden sm:inline">
                  · Photo {lightboxIndex + 1} of {REAL_GUEST_MOMENTS.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Strict 4:3 Image Container in Lightbox */}
            <div className="relative aspect-[4/3] w-full bg-black">
              <Image
                src={REAL_GUEST_MOMENTS[lightboxIndex].src}
                alt={REAL_GUEST_MOMENTS[lightboxIndex].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover object-center"
                priority
              />

              {/* Prev Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev === 0 ? REAL_GUEST_MOMENTS.length - 1 : prev - 1) : 0
                  );
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#FF6B00] transition-colors border border-white/20 cursor-pointer shadow-md"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev === REAL_GUEST_MOMENTS.length - 1 ? 0 : prev + 1) : 0
                  );
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#FF6B00] transition-colors border border-white/20 cursor-pointer shadow-md"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Caption Footer */}
            <div className="p-4 sm:p-5 bg-stone-900 border-t border-stone-800 text-stone-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="font-bold text-white block">
                  {REAL_GUEST_MOMENTS[lightboxIndex].title}
                </span>
                <p className="text-xs text-stone-400 mt-0.5">
                  {REAL_GUEST_MOMENTS[lightboxIndex].caption}
                </p>
              </div>

              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Real Guest Photo</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
