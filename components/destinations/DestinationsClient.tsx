'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Sparkles, MapPin, Compass, ArrowUpRight, PhoneCall } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import DestinationsHero from './DestinationsHero';
import DestinationCard from './DestinationCard';
import DestinationDetailDrawer, {
  DestinationItem,
  LinkedTourSummary,
  LinkedActivitySummary,
} from './DestinationDetailDrawer';
import BookingModal from '@/components/home/BookingModal';
import Footer from '@/components/home/Footer';
import { SiteSettings } from '@/types/database';

export default function DestinationsClient() {
  const { currency, setCurrency, exchangeRate } = useCurrency();

  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');

  // Interactive Drawer and Booking Modal State
  const [selectedDestinationForDrawer, setSelectedDestinationForDrawer] =
    useState<DestinationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingDestination, setBookingDestination] = useState<string | undefined>(undefined);
  const [bookingPackageId, setBookingPackageId] = useState<string | undefined>(undefined);

  // Load live data from Supabase
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

        // 2. Fetch active destinations
        const destPromise = supabase
          .from('destinations')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        // 3. Fetch active tours to link with destinations
        const toursPromise = supabase
          .from('tours')
          .select('id, title, destination_id, locations, duration_days, duration_nights, price_usd, price_lkr, cover_image, category')
          .eq('is_active', true);

        // 4. Fetch active activities
        const actPromise = supabase
          .from('activities')
          .select('id, title, destination_id, location, duration, price, price_lkr')
          .eq('is_active', true);

        const [settingsRes, destRes, toursRes, actRes] = await Promise.allSettled([
          settingsPromise,
          destPromise,
          toursPromise,
          actPromise,
        ]);

        if (isMounted) {
          if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
            setSiteSettings(settingsRes.value.data);
          }
          if (destRes.status === 'fulfilled' && destRes.value.data) {
            setDestinations(destRes.value.data);
          }
          if (toursRes.status === 'fulfilled' && toursRes.value.data) {
            setTours(toursRes.value.data);
          }
          if (actRes.status === 'fulfilled' && actRes.value.data) {
            setActivities(actRes.value.data);
          }
        }
      } catch (err) {
        console.error('Error fetching destinations data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter destinations by region and search query
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // 1. Region filter
      if (selectedRegion !== 'All Regions') {
        const regionLower = selectedRegion.toLowerCase();
        const destText = `${dest.name} ${dest.district || ''} ${dest.tag || ''}`.toLowerCase();

        if (regionLower.includes('cultural') && !destText.includes('sigiriya') && !destText.includes('matale') && !destText.includes('cultural')) {
          return false;
        }
        if (regionLower.includes('highlands') && !destText.includes('ella') && !destText.includes('nuwara eliya') && !destText.includes('badulla') && !destText.includes('mountain') && !destText.includes('highland')) {
          return false;
        }
        if (regionLower.includes('south') && !destText.includes('mirissa') && !destText.includes('matara') && !destText.includes('south coast') && !destText.includes('coastal') && !destText.includes('tropical')) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = dest.name.toLowerCase().includes(q);
        const districtMatch = (dest.district || '').toLowerCase().includes(q);
        const tagMatch = (dest.tag || '').toLowerCase().includes(q);
        const descMatch = (dest.description || '').toLowerCase().includes(q);
        const attractionsMatch = Array.isArray(dest.popular_attractions)
          ? dest.popular_attractions.some((a) => a.toLowerCase().includes(q))
          : false;

        return nameMatch || districtMatch || tagMatch || descMatch || attractionsMatch;
      }

      return true;
    });
  }, [destinations, selectedRegion, searchQuery]);

  // Helper to get linked tours for a given destination
  const getLinkedToursForDestination = (dest: DestinationItem): LinkedTourSummary[] => {
    const destNameLower = dest.name.toLowerCase();
    return tours
      .filter((t) => {
        if (t.destination_id && t.destination_id === dest.id) return true;
        if (Array.isArray(t.locations)) {
          return t.locations.some((loc: string) => {
            const l = loc.toLowerCase();
            return destNameLower.includes(l) || l.includes(destNameLower);
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
        cover_image: t.cover_image,
        category: t.category,
      }));
  };

  // Helper to get linked activities for a given destination
  const getLinkedActivitiesForDestination = (dest: DestinationItem): LinkedActivitySummary[] => {
    const destNameLower = dest.name.toLowerCase();
    return activities
      .filter((a) => {
        if (a.destination_id && a.destination_id === dest.id) return true;
        if (a.location) {
          const l = a.location.toLowerCase();
          return destNameLower.includes(l) || l.includes(destNameLower);
        }
        return false;
      })
      .map((a) => ({
        id: a.id,
        title: a.title,
        location: a.location,
        duration: a.duration,
        price: a.price,
        price_lkr: a.price_lkr,
      }));
  };

  const handleOpenDrawer = (destination: DestinationItem) => {
    setSelectedDestinationForDrawer(destination);
    setIsDrawerOpen(true);
  };

  const handleOpenBooking = (destinationName?: string, packageId?: string) => {
    setBookingDestination(destinationName);
    setBookingPackageId(packageId);
    setIsBookingOpen(true);
  };

  const defaultWhatsapp = siteSettings?.whatsapp_number || '94761560046';
  const cleanWhatsapp = defaultWhatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Hello Tripvibe Lanka! I would like to inquire about visiting your Sri Lankan destinations.'
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
        {/* Editorial Hero & Filters */}
        <DestinationsHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          totalDestinations={destinations.length}
        />

        {/* Destinations Catalog Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {isLoading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
              <p className="text-sm font-medium text-stone-500">
                Loading authentic Sri Lankan destinations...
              </p>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="min-h-[320px] bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                No matching destinations found
              </h3>
              <p className="text-sm text-stone-600">
                We couldn&apos;t find any destinations matching &ldquo;{searchQuery}&rdquo;. Try clearing your filters or search for another landmark.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRegion('All Regions');
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredDestinations.map((destination) => {
                const linkedTours = getLinkedToursForDestination(destination);
                return (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    linkedToursCount={linkedTours.length}
                    onOpenDrawer={handleOpenDrawer}
                    onOpenBooking={(destName) => handleOpenBooking(destName)}
                  />
                );
              })}
            </div>
          )}

          {/* Bottom Bespoke Planning CTA Banner */}
          {!isLoading && (
            <div className="mt-16 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF8F1] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-sm border border-orange-200/80">
              <div className="absolute -top-12 -right-12 w-72 h-72 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-[#FF6B00] text-xs font-semibold tracking-wide uppercase font-heading">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tailor-Made Island Circuits</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 leading-tight">
                  Can&apos;t decide which sanctuaries to combine?
                </h3>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-body">
                  Our native Ceylon itinerary specialists craft private multi-destination journeys combining ancient UNESCO citadels, scenic highland tea routes, and wild leopard coastal reserves, designed entirely around your pace.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#FF6B00] hover:bg-[#E55F00] text-white shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Start Custom Itinerary</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 transition-colors inline-flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Slide-over Detailed Dossier Drawer */}
      <DestinationDetailDrawer
        destination={selectedDestinationForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currency={currency}
        exchangeRate={exchangeRate}
        linkedTours={
          selectedDestinationForDrawer
            ? getLinkedToursForDestination(selectedDestinationForDrawer)
            : []
        }
        linkedActivities={
          selectedDestinationForDrawer
            ? getLinkedActivitiesForDestination(selectedDestinationForDrawer)
            : []
        }
        onOpenBooking={(destName, pkgId) => {
          setIsDrawerOpen(false);
          handleOpenBooking(destName, pkgId);
        }}
        whatsappUrl={whatsappUrl}
      />

      {/* 7-step Interactive Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        currency={currency}
        initialDestination={bookingDestination}
        initialPackageId={bookingPackageId}
      />

      {/* Universal Footer */}
      <Footer onOpenBooking={() => handleOpenBooking()} />
    </div>
  );
}
