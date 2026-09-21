'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import ToursHero from './ToursHero';
import ToursFilters, { DurationFilterKey, SortOptionKey } from './ToursFilters';
import TourCard from './TourCard';
import TourDetailDrawer, { TourDetailItem } from './TourDetailDrawer';
import Footer from '@/components/home/Footer';
import { SiteSettings } from '@/types/database';

export default function ToursClient() {
  const router = useRouter();
  const { currency, setCurrency, exchangeRate } = useCurrency();

  const [tours, setTours] = useState<TourDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings> | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<DurationFilterKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOptionKey>('featured');

  // Interactive Drawer state
  const [selectedTourForDrawer, setSelectedTourForDrawer] = useState<TourDetailItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const categories = ['All', 'Signature', 'Cultural', 'Wildlife', 'Coastal', 'Hill Country'];

  // Load site settings and tours from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const supabase = createClient();

        // 1. Fetch site settings for dynamic WhatsApp & TripAdvisor URLs
        const settingsPromise = supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        // 2. Fetch live active tours with destination info
        const toursPromise = supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        const [settingsRes, toursRes] = await Promise.allSettled([
          settingsPromise,
          toursPromise,
        ]);

        if (!isMounted) return;

        if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
          setSiteSettings(settingsRes.value.data);
        }

        if (toursRes.status === 'fulfilled' && toursRes.value.data) {
          const rawData = toursRes.value.data;
          const mapped: TourDetailItem[] = rawData.map((item: any) => {
            const days = item.duration_days || 1;
            const nights = item.duration_nights || 0;
            const durText = nights > 0 ? `${days} Days / ${nights} Nights` : `${days} Day Tour`;

            const locs = Array.isArray(item.locations)
              ? item.locations.filter((l: any) => typeof l === 'string' && l.trim().length > 0)
              : ['Sri Lanka'];

            const rawHighlights = item.highlights;
            const highlightsList: string[] = Array.isArray(rawHighlights)
              ? rawHighlights.filter((h: any) => typeof h === 'string' && h.trim().length > 0)
              : [];

            const rawIncluded = item.included;
            const includedList: string[] = Array.isArray(rawIncluded)
              ? rawIncluded.filter((inc: any) => typeof inc === 'string' && inc.trim().length > 0)
              : [];

            const rawExcluded = item.excluded;
            const excludedList: string[] = Array.isArray(rawExcluded)
              ? rawExcluded.filter((exc: any) => typeof exc === 'string' && exc.trim().length > 0)
              : [];

            const rawItinerary = item.itinerary;
            const itineraryList = Array.isArray(rawItinerary)
              ? rawItinerary.map((it: any, idx: number) => ({
                  day: Number(it.day) || idx + 1,
                  title: it.title || `Day ${idx + 1}`,
                  details: it.details || it.desc || '',
                }))
              : [];

            const cover =
              item.cover_image ||
              (Array.isArray(item.gallery_images) && item.gallery_images.length > 0
                ? item.gallery_images[0]
                : '');

            const gallery = Array.isArray(item.gallery_images) ? item.gallery_images : (cover ? [cover] : []);

            return {
              id: item.id,
              title: item.title,
              category: item.category || '',
              tagline: item.tagline || item.description || '',
              duration: durText,
              duration_days: days,
              duration_nights: nights,
              image: cover,
              gallery_images: gallery,
              locations: locs,
              highlights: highlightsList,
              included: includedList,
              excluded: excludedList,
              itinerary: itineraryList,
              priceUSD: Number(item.price_usd) || 0,
              priceLKR: Number(item.price_lkr) || 0,
              featured: Boolean(item.is_featured),
              min_guests: item.min_guests ?? 1,
              max_guests: item.max_guests ?? null,
              guest_policy: item.guest_policy || null,
            };
          });

          setTours(mapped);
        }
      } catch (err) {
        console.warn('[ToursClient] error loading data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort tours
  const filteredTours = useMemo(() => {
    return tours
      .filter((t) => {
        // 1. Category Filter
        if (selectedCategory !== 'All') {
          const cat = (t.category || '').toLowerCase();
          const target = selectedCategory.toLowerCase();
          if (cat !== target) {
            // Flexible match for signature/cultural
            if (target === 'cultural' && cat === 'signature') return true;
            if (target === 'signature' && cat === 'cultural') return true;
            return false;
          }
        }

        // 2. Duration Filter
        if (selectedDuration !== 'all') {
          const days = t.duration_days;
          if (selectedDuration === '1-4' && (days < 1 || days > 4)) return false;
          if (selectedDuration === '5-7' && (days < 5 || days > 7)) return false;
          if (selectedDuration === '8-10' && (days < 8 || days > 10)) return false;
          if (selectedDuration === '11+' && days < 11) return false;
        }

        // 3. Search Query Filter
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase().trim();
          const titleMatch = t.title.toLowerCase().includes(q);
          const taglineMatch = t.tagline.toLowerCase().includes(q);
          const locationsMatch = t.locations.some((l) => l.toLowerCase().includes(q));
          const highlightsMatch = t.highlights.some((h) => h.toLowerCase().includes(q));
          if (!titleMatch && !taglineMatch && !locationsMatch && !highlightsMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        }
        if (sortBy === 'price-asc') {
          return a.priceUSD - b.priceUSD;
        }
        if (sortBy === 'price-desc') {
          return b.priceUSD - a.priceUSD;
        }
        if (sortBy === 'duration-asc') {
          return a.duration_days - b.duration_days;
        }
        if (sortBy === 'duration-desc') {
          return b.duration_days - a.duration_days;
        }
        return 0;
      });
  }, [tours, selectedCategory, selectedDuration, searchQuery, sortBy]);

  const handleOpenDrawer = (tour: TourDetailItem) => {
    setSelectedTourForDrawer(tour);
    setIsDrawerOpen(true);
  };

  const handleOpenBooking = (packageId?: string) => {
    if (packageId) {
      router.push(`/booking?package=${encodeURIComponent(packageId)}`);
    } else {
      router.push('/booking');
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedDuration('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  const defaultWhatsapp = siteSettings?.whatsapp_number || '94775368357';
  const cleanWhatsapp = defaultWhatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Hello Tripvibe Lanka! I would like to inquire about your private tour packages.'
  )}`;
  const tripadvisorUrl =
    siteSettings?.tripadvisor_url ||
    'https://www.tripadvisor.com/Attraction_Review-g293962-d33287122-Reviews-Trip_Vibe_Lanka-Colombo_Western_Province.html';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-orange-500/20 selection:text-orange-950 font-body overflow-x-clip w-full">
      {/* Zero-jank Scroll Sentinel */}
      <div id="scroll-sentinel" className="absolute top-0 left-0 w-full h-10 pointer-events-none -z-10" />

      {/* Universal Pill Navigation */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenBooking={() => handleOpenBooking()}
        forceSolid
      />

      <main className="pt-20 sm:pt-28 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
          {/* Editorial Hero Header */}
          <ToursHero
            onOpenBooking={() => handleOpenBooking()}
            whatsappUrl={whatsappUrl}
            tripadvisorUrl={tripadvisorUrl}
          />

          {/* Filtering & Search Controls */}
          <ToursFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedDuration={selectedDuration}
            onSelectDuration={setSelectedDuration}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalResults={filteredTours.length}
            onResetFilters={handleResetFilters}
          />

          {/* Tour Packages Grid */}
          {isLoading ? (
            <div className="p-12 sm:p-16 rounded-3xl bg-white border border-slate-200/80 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
              <span className="text-xs font-semibold text-slate-500 tracking-wide">
                Loading signature tour packages...
              </span>
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF6B00]">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                No Tour Packages Match Your Filters
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
                We couldn&apos;t find any tour packages matching your current search criteria. Try resetting your filters or chatting with our concierge for a bespoke itinerary.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#E55F00] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {filteredTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  currency={currency}
                  onOpenDrawer={handleOpenDrawer}
                  onBookTour={handleOpenBooking}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Verified Footer with Real Social Media, TripAdvisor & Contacts */}
      <Footer onOpenBooking={() => handleOpenBooking()} />

      {/* Interactive Day-by-Day Itinerary Drawer */}
      <TourDetailDrawer
        tour={selectedTourForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTourForDrawer(null);
        }}
        onBookTour={(id) => {
          setIsDrawerOpen(false);
          handleOpenBooking(id);
        }}
        currency={currency}
      />
    </div>
  );
}
