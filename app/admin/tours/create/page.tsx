'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  Calendar,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Loader2,
  MapPin,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { TourInsert, TourItineraryItem } from '@/types/database';

interface TourFormData {
  title: string;
  destination_id: string;
  duration_days: number;
  duration_nights: number;
  price_usd: number;
  price_lkr: number;
  description: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: TourItineraryItem[];
  cover_image: string;
  gallery_images: string[];
  is_featured: boolean;
  is_active: boolean;
}

const initialFormData: TourFormData = {
  title: '',
  destination_id: '',
  duration_days: 5,
  duration_nights: 4,
  price_usd: 650,
  price_lkr: 195000,
  description: '',
  highlights: [
    'Ascend the UNESCO World Heritage Sigiriya Rock Fortress',
    'Scenic blue train journey through lush tea plantations',
  ],
  included: [
    'Private air-conditioned vehicle with English-speaking chauffeur',
    'Daily breakfast and luxury boutique hotel accommodations',
  ],
  excluded: [
    'International airline tickets and visa fees',
    'Personal expenses and alcoholic beverages',
  ],
  itinerary: [
    {
      day: 1,
      title: 'Arrival & Scenic Transfer to Sigiriya',
      details:
        'Warm welcome at Bandaranaike International Airport (CMB). Transfer to Sigiriya with an en-route coconut refreshment stop and check-in to your eco-resort.',
    },
    {
      day: 2,
      title: 'Sigiriya Rock Fortress & Village Safari',
      details:
        'Early morning climb of the iconic Lion Rock citadel before the heat sets in. Afternoon traditional catamaran village boat ride with an authentic village lunch.',
    },
  ],
  cover_image: '',
  gallery_images: [],
  is_featured: false,
  is_active: true,
};

export default function CreateTourPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TourFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);

  // Field change handler for primitive fields
  const handleFieldChange = (
    field: keyof TourFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ----------------------------------------------------
  // Repeater: Highlights
  // ----------------------------------------------------
  const handleHighlightChange = (index: number, val: string) => {
    const updated = [...formData.highlights];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, highlights: updated }));
  };

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ''],
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // ----------------------------------------------------
  // Repeater: Included
  // ----------------------------------------------------
  const handleIncludedChange = (index: number, val: string) => {
    const updated = [...formData.included];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, included: updated }));
  };

  const addIncluded = () => {
    setFormData((prev) => ({
      ...prev,
      included: [...prev.included, ''],
    }));
  };

  const removeIncluded = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      included: prev.included.filter((_, i) => i !== index),
    }));
  };

  // ----------------------------------------------------
  // Repeater: Excluded
  // ----------------------------------------------------
  const handleExcludedChange = (index: number, val: string) => {
    const updated = [...formData.excluded];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, excluded: updated }));
  };

  const addExcluded = () => {
    setFormData((prev) => ({
      ...prev,
      excluded: [...prev.excluded, ''],
    }));
  };

  const removeExcluded = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      excluded: prev.excluded.filter((_, i) => i !== index),
    }));
  };

  // ----------------------------------------------------
  // Repeater: Itinerary
  // ----------------------------------------------------
  const handleItineraryChange = (
    index: number,
    field: keyof TourItineraryItem,
    val: string | number
  ) => {
    const updated = [...formData.itinerary];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setFormData((prev) => ({ ...prev, itinerary: updated }));
  };

  const addItineraryDay = () => {
    const nextDay = formData.itinerary.length + 1;
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day: nextDay,
          title: `Day ${nextDay}: Adventure Continues`,
          details: '',
        },
      ],
    }));
  };

  const removeItineraryDay = (index: number) => {
    if (formData.itinerary.length <= 1) return;
    const filtered = formData.itinerary
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, day: idx + 1 })); // renumber days consecutively
    setFormData((prev) => ({ ...prev, itinerary: filtered }));
  };

  // ----------------------------------------------------
  // Task 7: Submit Tour to Supabase
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessBanner(null);

    // Client-side validation
    if (!formData.title.trim()) {
      setErrorBanner('Please enter a tour title.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (formData.duration_days <= 0) {
      setErrorBanner('Duration days must be at least 1.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Clean empty items from repeaters
      const cleanedHighlights = formData.highlights
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      const cleanedIncluded = formData.included
        .map((inc) => inc.trim())
        .filter((inc) => inc.length > 0);

      const cleanedExcluded = formData.excluded
        .map((exc) => exc.trim())
        .filter((exc) => exc.length > 0);

      const cleanedItinerary = formData.itinerary
        .filter(
          (item) =>
            item.title.trim().length > 0 || item.details.trim().length > 0
        )
        .map((item, idx) => ({
          day: idx + 1,
          title: item.title.trim() || `Day ${idx + 1}`,
          details: item.details.trim(),
        }));

      // Prepare payload matching the public.tours table schema:
      // Note: destination_id is UUID in DB, mock cover_image & gallery_images as requested
      const payload: TourInsert = {
        title: formData.title.trim(),
        destination_id: null,
        duration_days: Number(formData.duration_days) || 0,
        duration_nights: Number(formData.duration_nights) || 0,
        price_usd: Number(formData.price_usd) || 0,
        price_lkr: Number(formData.price_lkr) || 0,
        description: formData.description.trim(),
        highlights: cleanedHighlights,
        included: cleanedIncluded,
        excluded: cleanedExcluded,
        itinerary: cleanedItinerary,
        cover_image: null, // Mocked as null for now
        gallery_images: [], // Mocked as empty array for now
        is_featured: Boolean(formData.is_featured),
        is_active: Boolean(formData.is_active),
      };

      const { data, error } = await supabase
        .from('tours')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('[Supabase Tour Insert Error]:', error);
        setErrorBanner(
          `Failed to save tour: ${error.message}${
            error.message.includes('relation "public.tours" does not exist')
              ? ' — Please run the database.sql migration in Supabase SQL editor.'
              : ''
          }`
        );
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setSuccessBanner(
        `Tour "${formData.title}" created successfully! Redirecting to tours listing...`
      );

      // Brief delay so user sees the success toast before redirect
      setTimeout(() => {
        router.push('/admin/tours');
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      console.error('[Unexpected Error]:', err);
      setErrorBanner(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while saving the tour.'
      );
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              href="/admin"
              className="hover:text-slate-900 transition-colors"
            >
              Admin
            </Link>
            <span>/</span>
            <Link
              href="/admin/tours"
              className="hover:text-slate-900 transition-colors"
            >
              Tours
            </Link>
            <span>/</span>
            <span className="text-emerald-700 font-bold">Create</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Tour Package
          </h1>
          <p className="text-xs text-slate-500">
            Configure travel highlights, day-by-day itinerary, pricing, and visibility status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tours"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors ${
              isSubmitting ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{showJsonPreview ? 'Hide State' : 'Inspect State'}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Tour</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold">{successBanner}</div>
              <div className="text-emerald-700 mt-0.5">
                Record inserted into <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">public.tours</code>.
              </div>
            </div>
          </div>
          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
        </div>
      )}

      {/* Error Toast Banner */}
      {errorBanner && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-rose-900">Submission Error</div>
              <div className="text-rose-700 mt-0.5">{errorBanner}</div>
            </div>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-700 hover:text-rose-950 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Collapsible JSON State Inspector */}
      {showJsonPreview && (
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono border border-slate-800 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 font-sans text-xs">
            <span className="font-bold text-emerald-400">
              Live React Form State (TourFormData)
            </span>
            <span>
              {formData.itinerary.length} Days • {formData.highlights.length} Highlights
            </span>
          </div>
          <pre className="max-h-72 overflow-y-auto text-[11px] leading-relaxed">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Tour Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Basic Tour Information
                </h2>
                <p className="text-[11px] text-slate-500">
                  Primary title, region, and marketing overview
                </p>
              </div>
            </div>

            {/* Tour Title */}
            <div>
              <label
                htmlFor="tour-title"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Tour Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="tour-title"
                type="text"
                required
                disabled={isSubmitting}
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. 7-Day Wonders of Ceylon & Coastal Retreat"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* Destination (Temporary Text Input) */}
            <div>
              <label
                htmlFor="destination-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Destination (Location / Region)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="destination-input"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.destination_id}
                  onChange={(e) =>
                    handleFieldChange('destination_id', e.target.value)
                  }
                  placeholder="e.g. Sigiriya, Kandy, Ella, Galle (Temporary text)"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Temporary text input (stored as null in database until destinations table UUID is linked)
              </p>
            </div>

            {/* Content Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="tour-description"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Content Description <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.description.length} characters
                </span>
              </div>
              <textarea
                id="tour-description"
                rows={4}
                required
                disabled={isSubmitting}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Provide an evocative, captivating description of this Sri Lanka journey..."
                className="w-full p-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Section 2: Duration & Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Duration & Pricing Schedule
                </h2>
                <p className="text-[11px] text-slate-500">
                  Days, nights, and dual-currency rates
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Duration Days */}
              <div>
                <label
                  htmlFor="duration-days"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Duration Days
                </label>
                <input
                  id="duration-days"
                  type="number"
                  min={1}
                  required
                  disabled={isSubmitting}
                  value={formData.duration_days}
                  onChange={(e) =>
                    handleFieldChange('duration_days', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all font-semibold disabled:opacity-60"
                />
              </div>

              {/* Duration Nights */}
              <div>
                <label
                  htmlFor="duration-nights"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Duration Nights
                </label>
                <input
                  id="duration-nights"
                  type="number"
                  min={0}
                  required
                  disabled={isSubmitting}
                  value={formData.duration_nights}
                  onChange={(e) =>
                    handleFieldChange(
                      'duration_nights',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all font-semibold disabled:opacity-60"
                />
              </div>

              {/* Price USD */}
              <div>
                <label
                  htmlFor="price-usd"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Price (USD)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    $
                  </div>
                  <input
                    id="price-usd"
                    type="number"
                    min={0}
                    step={0.01}
                    required
                    disabled={isSubmitting}
                    value={formData.price_usd}
                    onChange={(e) =>
                      handleFieldChange(
                        'price_usd',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-900 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Price LKR */}
              <div>
                <label
                  htmlFor="price-lkr"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Price (LKR)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    Rs.
                  </div>
                  <input
                    id="price-lkr"
                    type="number"
                    min={0}
                    step={1}
                    required
                    disabled={isSubmitting}
                    value={formData.price_lkr}
                    onChange={(e) =>
                      handleFieldChange(
                        'price_lkr',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-900 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Repeaters (Highlights, Included, Excluded) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Inclusions, Exclusions & Highlights
                </h2>
                <p className="text-[11px] text-slate-500">
                  Dynamic repeaters for tour specifications
                </p>
              </div>
            </div>

            {/* Highlights Repeater */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Key Highlights ({formData.highlights.length})
                </label>
                <button
                  type="button"
                  onClick={addHighlight}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Highlight</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-bold text-slate-400">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      disabled={isSubmitting}
                      value={highlight}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                      placeholder={`Highlight #${index + 1}`}
                      className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeHighlight(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                      title="Remove highlight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions & Exclusions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Included Repeater */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    What&apos;s Included ({formData.included.length})
                  </label>
                  <button
                    type="button"
                    onClick={addIncluded}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.included.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={isSubmitting}
                        value={item}
                        onChange={(e) => handleIncludedChange(index, e.target.value)}
                        placeholder="e.g. Airport transfers"
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-60"
                      />
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => removeIncluded(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Excluded Repeater */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-rose-500" />
                    What&apos;s Excluded ({formData.excluded.length})
                  </label>
                  <button
                    type="button"
                    onClick={addExcluded}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.excluded.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={isSubmitting}
                        value={item}
                        onChange={(e) => handleExcludedChange(index, e.target.value)}
                        placeholder="e.g. International flights"
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all disabled:opacity-60"
                      />
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => removeExcluded(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dynamic Itinerary Repeater */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Day-by-Day Itinerary ({formData.itinerary.length} Days)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Day numbers, stage titles, and activity descriptions
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addItineraryDay}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day {formData.itinerary.length + 1}</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.itinerary.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 text-white">
                        Day {item.day}
                      </span>
                      <input
                        type="text"
                        disabled={isSubmitting}
                        value={item.title}
                        onChange={(e) =>
                          handleItineraryChange(index, 'title', e.target.value)
                        }
                        placeholder={`Day ${item.day} Title (e.g. Scenic Hill Country Train & Ella Gap)`}
                        className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={formData.itinerary.length <= 1 || isSubmitting}
                      onClick={() => removeItineraryDay(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove this day"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      disabled={isSubmitting}
                      value={item.details}
                      onChange={(e) =>
                        handleItineraryChange(index, 'details', e.target.value)
                      }
                      placeholder={`Describe the schedule, activities, meals, and hotels for Day ${item.day}...`}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Status & Visibility Toggles */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100">
              Publishing & Visibility
            </h3>

            {/* Active Status Toggle */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  Active Status
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Publish to the live TripVibe Lanka website
                </p>
              </div>
              <button
                type="button"
                role="switch"
                disabled={isSubmitting}
                aria-checked={formData.is_active}
                onClick={() => handleFieldChange('is_active', !formData.is_active)}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50
                  ${formData.is_active ? 'bg-emerald-600' : 'bg-slate-300'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Featured Status Toggle */}
            <div className="flex items-start justify-between gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      formData.is_featured ? 'text-amber-500' : 'text-slate-400'
                    }`}
                  />
                  Featured Tour
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Showcase on the homepage curated recommendations
                </p>
              </div>
              <button
                type="button"
                role="switch"
                disabled={isSubmitting}
                aria-checked={formData.is_featured}
                onClick={() =>
                  handleFieldChange('is_featured', !formData.is_featured)
                }
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50
                  ${formData.is_featured ? 'bg-amber-500' : 'bg-slate-300'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${formData.is_featured ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Media & Images (Mocked as null/empty for now) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Media & Imagery</span>
              <span className="text-[10px] text-slate-400 font-normal">Mocked for now</span>
            </h3>

            <div>
              <label
                htmlFor="cover-image"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Cover Image URL (Optional)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  id="cover-image"
                  type="url"
                  disabled={isSubmitting}
                  value={formData.cover_image}
                  onChange={(e) => handleFieldChange('cover_image', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {formData.cover_image ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video relative bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.cover_image}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs">
                File uploads will be added later; mocked with null/empty array.
              </div>
            )}
          </div>

          {/* Live Tour Card Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Card Summary Preview</span>
              <span className="text-[10px] font-semibold text-emerald-600">
                Live Sync
              </span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {formData.title || 'Untitled Tour'}
                </span>
                {formData.is_featured && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  {formData.duration_days}D / {formData.duration_nights}N
                </span>
                <span className="font-extrabold text-emerald-700">
                  ${formData.price_usd} USD
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{formData.itinerary.length} Days Itinerary</span>
                <span>{formData.highlights.length} Highlights</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
