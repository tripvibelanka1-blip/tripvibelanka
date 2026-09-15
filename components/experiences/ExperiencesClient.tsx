'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Sparkles, Compass, ArrowUpRight, PhoneCall } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import ExperiencesHero from './ExperiencesHero';
import ExperienceCard from './ExperienceCard';
import ExperienceDetailDrawer, {
  ExperienceItem,
  LinkedTourMini,
} from './ExperienceDetailDrawer';
import BookingModal from '@/components/home/BookingModal';
import Footer from '@/components/home/Footer';
import { SiteSettings } from '@/types/database';

export default function ExperiencesClient() {
  const { currency, setCurrency, exchangeRate } = useCurrency();

  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  // Interactive Drawer and Booking Modal State
  const [selectedExperienceForDrawer, setSelectedExperienceForDrawer] =
    useState<ExperienceItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingAddonId, setBookingAddonId] = useState<string | undefined>(undefined);
  const [bookingDestination, setBookingDestination] = useState<string | undefined>(undefined);

  // Load live activities from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const supabase = createClient();

        // 1. Fetch site settings
        const settingsPromise = supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        // 2. Fetch active activities
        const actPromise = supabase
          .from('activities')
          .select('*, destination:destinations(id, name, district)')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        // 3. Fetch active tours for cross-referencing
        const toursPromise = supabase
          .from('tours')
          .select('id, title, destination_id, locations, duration_days, duration_nights, price_usd, price_lkr')
          .eq('is_active', true);

        const [settingsRes, actRes, toursRes] = await Promise.allSettled([
          settingsPromise,
          actPromise,
          toursPromise,
        ]);

        if (isMounted) {
          if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
            setSiteSettings(settingsRes.value.data);
          }
          if (actRes.status === 'fulfilled' && actRes.value.data) {
            setExperiences(actRes.value.data);
          }
          if (toursRes.status === 'fulfilled' && toursRes.value.data) {
            setTours(toursRes.value.data);
          }
        }
      } catch (err) {
        console.error('Error fetching experiences data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter experiences by category and search query
  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      // 1. Category Filter
      if (selectedCategory !== 'All Categories') {
        const cat = (exp.category || '').toLowerCase();
        const target = selectedCategory.toLowerCase();
        if (!cat.includes(target) && !target.includes(cat)) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = exp.title.toLowerCase().includes(q);
        const locMatch = (exp.location || '').toLowerCase().includes(q);
        const destMatch = (exp.destination?.name || '').toLowerCase().includes(q);
        const descMatch = (exp.description || '').toLowerCase().includes(q);
        const catMatch = (exp.category || '').toLowerCase().includes(q);

        return titleMatch || locMatch || destMatch || descMatch || catMatch;
      }

      return true;
    });
  }, [experiences, selectedCategory, searchQuery]);

  // Helper to find tours matching this experience's location/destination
  const getLinkedToursForExperience = (exp: ExperienceItem): LinkedTourMini[] => {
    const locLower = (exp.location || exp.destination?.name || '').toLowerCase();
    if (!locLower) return [];

    return tours
      .filter((t) => {
        if (exp.destination_id && t.destination_id === exp.destination_id) return true;
        if (Array.isArray(t.locations)) {
          return t.locations.some((loc: string) => {
            const l = loc.toLowerCase();
            return locLower.includes(l) || l.includes(locLower);
          });
        }
        return false;
      })
      .map((t) => ({
        id: t.id,
        title: t.title,
        duration_days: t.duration_days,
        duration_nights: t.duration_nights,
        price_usd: t.price_usd,
        price_lkr: t.price_lkr,
      }));
  };

  const handleOpenDrawer = (experience: ExperienceItem) => {
    setSelectedExperienceForDrawer(experience);
    setIsDrawerOpen(true);
  };

  const handleOpenBooking = (addonId?: string, location?: string) => {
    setBookingAddonId(addonId);
    setBookingDestination(location);
    setIsBookingOpen(true);
  };

  const defaultWhatsapp = siteSettings?.whatsapp_number || '94761560046';
  const cleanWhatsapp = defaultWhatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Hello Tripvibe Lanka! I would like to inquire about booking your bespoke private experiences.'
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-orange-500/20 selection:text-orange-950 font-body">
      {/* Zero-jank Scroll Sentinel */}
      <div id="scroll-sentinel" className="absolute top-0 left-0 w-full h-10 pointer-events-none -z-10" />

      {/* Universal Pill Navigation */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => handleOpenBooking()}
        forceSolid
      />

      <main>
        {/* Editorial Hero & Filter Strip */}
        <ExperiencesHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalExperiences={experiences.length}
        />

        {/* Experiences Catalog Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {isLoading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
              <p className="text-sm font-medium text-stone-500">
                Loading authentic Sri Lankan experiences...
              </p>
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="min-h-[320px] bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                No matching experiences found
              </h3>
              <p className="text-sm text-stone-600">
                We couldn&apos;t find any experiences matching &ldquo;{searchQuery}&rdquo;. Try clearing your filters or search for another activity.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExperiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  currency={currency}
                  exchangeRate={exchangeRate}
                  onOpenDrawer={handleOpenDrawer}
                  onOpenBooking={(addonId, loc) => handleOpenBooking(addonId, loc)}
                />
              ))}
            </div>
          )}

          {/* Bottom Bespoke Custom Planning CTA Banner (Harmonious Warm Ivory Palette, No Em Dashes) */}
          {!isLoading && (
            <div className="mt-16 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF8F1] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-sm border border-orange-200/80">
              <div className="absolute -top-12 -right-12 w-72 h-72 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-[#FF6B00] text-xs font-semibold tracking-wide uppercase font-heading">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Custom Activity Planning</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 leading-tight">
                  Want an unlisted private excursion?
                </h3>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-body">
                  Whether you wish to arrange a private wildlife ranger at dawn, an exclusive culinary masterclass with a native chef, or helicopter transfers between highland tea estates, our bespoke concierge can arrange it smoothly into your private itinerary.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#FF6B00] hover:bg-[#E55F00] text-white shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Request Custom Activity</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 transition-colors inline-flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <span>Chat with Concierge</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Slide-over Detailed Dossier Drawer */}
      <ExperienceDetailDrawer
        experience={selectedExperienceForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currency={currency}
        exchangeRate={exchangeRate}
        linkedTours={
          selectedExperienceForDrawer
            ? getLinkedToursForExperience(selectedExperienceForDrawer)
            : []
        }
        onOpenBooking={(addonId, loc) => {
          setIsDrawerOpen(false);
          handleOpenBooking(addonId, loc);
        }}
        whatsappUrl={whatsappUrl}
      />

      {/* 7-step Interactive Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        currency={currency}
        initialAddonId={bookingAddonId}
        initialDestination={bookingDestination}
      />

      {/* Universal Footer */}
      <Footer onOpenBooking={() => handleOpenBooking()} />
    </div>
  );
}
