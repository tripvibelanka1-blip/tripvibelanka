'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Images,
  Loader2,
  MapPin,
  UploadCloud,
  Users,
  User,
  Heart,
  Info,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { TourInsert, TourItineraryItem, DestinationRecord } from '@/types/database';
import { compressImage, formatBytes } from '@/utils/imageCompression';
import DestinationSelect from '@/components/admin/DestinationSelect';
import TrustTooltip from '@/components/admin/TrustTooltip';
import DualPriceInput from '@/components/admin/DualPriceInput';
import AIContentHelper from '@/components/admin/AIContentHelper';
import CustomSelect, { CustomSelectOption } from '@/components/admin/CustomSelect';
import { Landmark, Compass as CompassIcon, Waves, Mountain } from 'lucide-react';

const TOUR_CATEGORY_OPTIONS: CustomSelectOption[] = [
  { value: 'Cultural', label: 'Cultural', description: 'Ancient citadels, sacred temples & UNESCO heritage', icon: <Landmark className="w-3.5 h-3.5 text-amber-600" /> },
  { value: 'Wildlife', label: 'Wildlife', description: 'Leopard safaris, elephant gatherings & bird sanctuaries', icon: <CompassIcon className="w-3.5 h-3.5 text-emerald-600" /> },
  { value: 'Coastal', label: 'Coastal', description: 'Golden beaches, surf breaks & whale watching', icon: <Waves className="w-3.5 h-3.5 text-sky-600" /> },
  { value: 'Hill Country', label: 'Hill Country', description: 'Misty tea estates, waterfalls & scenic train routes', icon: <Mountain className="w-3.5 h-3.5 text-teal-600" /> },
  { value: 'Signature', label: 'Signature', description: 'All-inclusive bespoke VIP private island circuits', icon: <Sparkles className="w-3.5 h-3.5 text-orange-600" /> },
];

interface TourFormData {
  title: string;
  category: string;
  tagline: string;
  locations_input: string;
  display_order: number;
  destination_id: string;
  duration_days: number;
  duration_nights: number;
  price_usd: number;
  price_lkr: number;
  min_guests: number;
  max_guests: number | null;
  guest_policy: 'solo' | 'couple' | 'family' | 'custom';
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
  category: 'Cultural',
  tagline: '',
  locations_input: '',
  display_order: 1,
  destination_id: '',
  duration_days: 1,
  duration_nights: 0,
  price_usd: 0,
  price_lkr: 0,
  min_guests: 1,
  max_guests: null,
  guest_policy: 'custom',
  description: '',
  highlights: [''],
  included: [''],
  excluded: [''],
  itinerary: [
    {
      day: 1,
      title: '',
      details: '',
    },
  ],
  cover_image: '',
  gallery_images: [],
  is_featured: false,
  is_active: true,
};

export default function CreateTourPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<TourFormData>(initialFormData);
  const [destinations, setDestinations] = useState<DestinationRecord[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(true);

  // Cover Image Storage upload states
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadStage, setUploadStage] = useState<'optimizing' | 'uploading' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [optimizationInfo, setOptimizationInfo] = useState<{
    originalSize: string;
    compressedSize: string;
    reductionPercentage: number;
  } | null>(null);

  // Tour Gallery Storage upload states
  const [isUploadingGallery, setIsUploadingGallery] = useState<boolean>(false);
  const [isGalleryDragging, setIsGalleryDragging] = useState<boolean>(false);
  const [galleryUploadStage, setGalleryUploadStage] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [galleryOptimizationSummary, setGalleryOptimizationSummary] = useState<string | null>(null);

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // ----------------------------------------------------
  // Task 8: Fetch Destinations on Mount
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchDestinations() {
      setIsLoadingDestinations(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('[Destinations Fetch Error]:', error);
        } else if (data) {
          setDestinations(data);
        }
      } catch (err) {
        console.error('[Unexpected Destinations Error]:', err);
      } finally {
        setIsLoadingDestinations(false);
      }
    }

    fetchDestinations();
  }, []);

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
  // Task 9: Storage File Upload with Client-Side Compression
  // ----------------------------------------------------
  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    // Validate size limit (max 10MB raw)
    if (rawFile.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    setUploadError(null);
    setIsUploadingImage(true);
    setUploadStage('optimizing');

    try {
      // 1. Automatically compress & convert to efficient WebP (saves 80-95% storage)
      const {
        file: optimizedFile,
        originalSize,
        compressedSize,
        reductionPercentage,
      } = await compressImage(rawFile, 1920, 0.82);

      if (reductionPercentage > 0) {
        setOptimizationInfo({
          originalSize: formatBytes(originalSize),
          compressedSize: formatBytes(compressedSize),
          reductionPercentage,
        });
      }

      setUploadStage('uploading');

      // 2. Upload optimized WebP directly to Supabase Storage bucket
      const supabase = createClient();
      const fileExt = optimizedFile.name.split('.').pop() || 'webp';
      const cleanFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;
      const filePath = `covers/${cleanFileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('tour-images')
        .upload(filePath, optimizedFile, {
          cacheControl: '31536000', // 1 year cache
          contentType: optimizedFile.type,
          upsert: false,
        });

      if (uploadErr) {
        console.error('[Storage Upload Error]:', uploadErr);
        setUploadError(`Upload failed: ${uploadErr.message}`);
        setIsUploadingImage(false);
        setUploadStage(null);
        return;
      }

      // 3. Retrieve public URL from Supabase Storage
      const {
        data: { publicUrl },
      } = supabase.storage.from('tour-images').getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        cover_image: publicUrl,
      }));
    } catch (err: unknown) {
      console.error('[Unexpected Storage Error]:', err);
      setUploadError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during image upload.'
      );
    } finally {
      setIsUploadingImage(false);
      setUploadStage(null);
    }
  };

  const handleRemoveCoverImage = () => {
    setFormData((prev) => ({ ...prev, cover_image: '' }));
    setOptimizationInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ----------------------------------------------------
  // Task 9 (Part 2): Multi-Image Gallery Upload to 'tour-images'
  // ----------------------------------------------------
  const processGalleryFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setGalleryError(null);
    setIsUploadingGallery(true);
    setGalleryUploadStage(`Preparing ${fileList.length} image${fileList.length === 1 ? '' : 's'}...`);

    try {
      const supabase = createClient();
      const newUrls: string[] = [];
      let totalOriginalBytes = 0;
      let totalCompressedBytes = 0;

      for (let i = 0; i < fileList.length; i++) {
        const rawFile = fileList[i];
        if (!rawFile.type.startsWith('image/')) {
          continue;
        }

        setGalleryUploadStage(
          `Optimizing photo ${i + 1} of ${fileList.length} to WebP...`
        );

        // Compress & convert to WebP
        const {
          file: optimizedFile,
          originalSize,
          compressedSize,
        } = await compressImage(rawFile, 1920, 0.82);

        totalOriginalBytes += originalSize;
        totalCompressedBytes += compressedSize;

        setGalleryUploadStage(
          `Uploading photo ${i + 1} of ${fileList.length} to storage...`
        );

        const fileExt = optimizedFile.name.split('.').pop() || 'webp';
        const cleanFileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}.${fileExt}`;
        const filePath = `gallery/${cleanFileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('tour-images')
          .upload(filePath, optimizedFile, {
            cacheControl: '31536000',
            contentType: optimizedFile.type,
            upsert: false,
          });

        if (uploadErr) {
          console.error(`Gallery upload error for ${rawFile.name}:`, uploadErr);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('tour-images').getPublicUrl(filePath);

        if (publicUrl) {
          newUrls.push(publicUrl);
        }
      }

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          gallery_images: [...prev.gallery_images, ...newUrls],
        }));

        if (totalOriginalBytes > 0 && totalCompressedBytes < totalOriginalBytes) {
          const savings = Math.round(
            ((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100
          );
          setGalleryOptimizationSummary(
            `Added ${newUrls.length} high-resolution photo${newUrls.length === 1 ? '' : 's'} (auto-optimized)`
          );
        }
      } else {
        setGalleryError('Failed to upload selected images. Please check file format or try again.');
      }
    } catch (err: unknown) {
      console.error('[Gallery Upload Error]:', err);
      setGalleryError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during gallery upload.'
      );
    } finally {
      setIsUploadingGallery(false);
      setGalleryUploadStage(null);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processGalleryFiles(e.target.files);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== indexToRemove),
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
      .map((item, idx) => ({ ...item, day: idx + 1 }));
    setFormData((prev) => ({ ...prev, itinerary: filtered }));
  };

  // ----------------------------------------------------
  // Form Submit: Insert to Supabase public.tours
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

    if (isUploadingImage) {
      setErrorBanner('Please wait for the cover image upload to finish before saving.');
      return;
    }

    if (isUploadingGallery) {
      setErrorBanner('Please wait for gallery images to finish uploading before saving.');
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

      const cleanedLocations = formData.locations_input
        ? formData.locations_input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      // Prepare payload matching the public.tours table schema:
      const payload: TourInsert = {
        title: formData.title.trim(),
        category: formData.category || 'Cultural',
        tagline: formData.tagline.trim() || null,
        locations: cleanedLocations,
        display_order: Number(formData.display_order) || 0,
        destination_id: formData.destination_id ? formData.destination_id : null,
        duration_days: Number(formData.duration_days) || 0,
        duration_nights: Number(formData.duration_nights) || 0,
        price_usd: Number(formData.price_usd) || 0,
        price_lkr: Number(formData.price_lkr) || 0,
        min_guests: Math.max(1, Number(formData.min_guests) || 1),
        max_guests: formData.max_guests ? Math.max(Number(formData.min_guests) || 1, Number(formData.max_guests)) : null,
        guest_policy: formData.guest_policy || 'custom',
        description: formData.description.trim(),
        highlights: cleanedHighlights,
        included: cleanedIncluded,
        excluded: cleanedExcluded,
        itinerary: cleanedItinerary,
        cover_image: formData.cover_image ? formData.cover_image : null,
        gallery_images: formData.gallery_images || [],
        is_featured: Boolean(formData.is_featured),
        is_active: Boolean(formData.is_active),
      };

      const { error } = await supabase
        .from('tours')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('[Supabase Tour Insert Error]:', error);
        setErrorBanner(
          `Failed to save tour: ${error.message}${
            error.message.includes('relation "public.tours" does not exist')
              ? ' — Database table not yet initialized. Please check your system configuration.'
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

      // Brief delay so user sees success notification before redirect
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
            <span className="text-orange-600 font-bold">Create</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Tour Package
          </h1>
          <p className="text-xs text-slate-500">
            Configure destinations, travel highlights, day-by-day itinerary, pricing, and live storage media.
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
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage || isUploadingGallery}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Tour Package...</span>
              </>
            ) : isUploadingImage ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading Cover...</span>
              </>
            ) : isUploadingGallery ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading Gallery...</span>
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
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-slate-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">{successBanner}</div>
              <div className="text-slate-600 mt-0.5">
                Tour package saved and ready on your website catalog.
              </div>
            </div>
          </div>
          <Loader2 className="w-4 h-4 text-[#FF6B00] animate-spin" />
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

      {/* Main Two-Column Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Tour Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Basic Tour Information
                </h2>
                <p className="text-[11px] text-slate-500">
                  Primary title, region destination, and marketing overview
                </p>
              </div>
            </div>

            {/* Tour Title & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="tour-title"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Tour Title <span className="text-rose-500">*</span>
                  </label>
                  <AIContentHelper
                    topic={formData.title}
                    location={formData.locations_input || formData.title}
                    moduleType="tour"
                  />
                </div>
                <input
                  id="tour-title"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g. Classical Heritage & Wildlife Odyssey"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="tour-category"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Category Filter
                </label>
                <CustomSelect
                  options={TOUR_CATEGORY_OPTIONS}
                  value={formData.category}
                  onChange={(val) => handleFieldChange('category', val)}
                  disabled={isSubmitting}
                  placeholder="Select tour category..."
                  id="tour-category"
                />
              </div>
            </div>

            {/* Tagline & Locations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tour-tagline"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Marketing Tagline / Subtitle
                </label>
                <input
                  id="tour-tagline"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.tagline}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  placeholder="e.g. The definitive circuit blending ancient wonders with untamed wildlife."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="tour-locations"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Route Locations (Comma Separated)
                  </label>
                  <AIContentHelper
                    topic={formData.title}
                    location={formData.locations_input || formData.title}
                    moduleType="tour"
                  />
                </div>
                <input
                  id="tour-locations"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.locations_input}
                  onChange={(e) => handleFieldChange('locations_input', e.target.value)}
                  placeholder="e.g. Colombo, Sigiriya, Kandy, Yala, Galle"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Destination Select Dropdown (Task 8) */}
            <div>
              <label
                htmlFor="destination-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Primary Destination
                </span>
                {isLoadingDestinations && (
                  <span className="text-[11px] font-normal text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                    Fetching destinations...
                  </span>
                )}
              </label>
              <div className="relative">
                <DestinationSelect
                  destinations={destinations}
                  value={formData.destination_id}
                  onChange={(val) => handleFieldChange('destination_id', val)}
                  disabled={isSubmitting}
                  isLoading={isLoadingDestinations}
                  placeholder="-- Select a Destination (Optional) --"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Categorizes this itinerary under a featured Sri Lankan region.
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
                className="w-full p-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
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
                  Days, nights, and dual-currency rates (per person pricing)
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
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all font-semibold disabled:opacity-60"
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
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all font-semibold disabled:opacity-60"
                />
              </div>

              {/* Dual Price Input (Master USD + Live/Unlocked LKR) */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <DualPriceInput
                  priceUsd={formData.price_usd}
                  priceLkr={formData.price_lkr}
                  onChangeUsd={(val) => handleFieldChange('price_usd', val)}
                  onChangeLkr={(val) => handleFieldChange('price_lkr', val)}
                  disabled={isSubmitting}
                  usdRequired={true}
                />
              </div>
            </div>
          </div>

          {/* Section 2.5: Guest Capacity & Package Suitability */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Guest Capacity &amp; Package Policy
                </h2>
                <p className="text-[11px] text-slate-500">
                  Configure whether this tour is tailored for Solo travelers, Couples, Families, or Custom party sizes
                </p>
              </div>
            </div>

            {/* Quick Policy Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Package Guest Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Solo Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      guest_policy: 'solo',
                      min_guests: 1,
                      max_guests: 1,
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    formData.guest_policy === 'solo'
                      ? 'border-[#FF6B00] bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    {formData.guest_policy === 'solo' && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Solo Package</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Strictly 1 Person</div>
                  </div>
                </button>

                {/* Couple Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      guest_policy: 'couple',
                      min_guests: 2,
                      max_guests: 2,
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    formData.guest_policy === 'couple'
                      ? 'border-[#FF6B00] bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    {formData.guest_policy === 'couple' && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Couple Package</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Strictly 2 Persons</div>
                  </div>
                </button>

                {/* Family Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      guest_policy: 'family',
                      min_guests: Math.max(3, prev.min_guests),
                      max_guests: prev.max_guests && prev.max_guests >= 3 ? prev.max_guests : 8,
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    formData.guest_policy === 'family'
                      ? 'border-[#FF6B00] bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    {formData.guest_policy === 'family' && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Family / Group</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Min 3+ Configurable</div>
                  </div>
                </button>

                {/* Custom / Flexible Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      guest_policy: 'custom',
                      min_guests: 1,
                      max_guests: null,
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    formData.guest_policy === 'custom'
                      ? 'border-[#FF6B00] bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    {formData.guest_policy === 'custom' && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Custom / Open</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Any Traveler Count</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Min and Max Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label
                  htmlFor="min-guests"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Minimum Guests Required <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="min-guests"
                    type="number"
                    min={1}
                    max={formData.max_guests || 50}
                    required
                    disabled={isSubmitting || formData.guest_policy === 'solo' || formData.guest_policy === 'couple'}
                    value={formData.min_guests}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setFormData((prev) => ({
                        ...prev,
                        min_guests: val,
                        max_guests: prev.max_guests && prev.max_guests < val ? val : prev.max_guests,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all font-semibold disabled:opacity-60 disabled:bg-slate-100"
                  />
                  {(formData.guest_policy === 'solo' || formData.guest_policy === 'couple') && (
                    <span className="absolute right-3 top-2.5 text-[11px] font-medium text-slate-400">
                      Locked ({formData.min_guests})
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Customers cannot book this tour for fewer than this count.
                </p>
              </div>

              <div>
                <label
                  htmlFor="max-guests"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Maximum Guests Allowed
                </label>
                <div className="relative">
                  <input
                    id="max-guests"
                    type="number"
                    min={formData.min_guests}
                    max={50}
                    disabled={isSubmitting || formData.guest_policy === 'solo' || formData.guest_policy === 'couple'}
                    value={formData.max_guests ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Math.max(formData.min_guests, parseInt(e.target.value) || formData.min_guests);
                      setFormData((prev) => ({
                        ...prev,
                        max_guests: val,
                      }));
                    }}
                    placeholder="No upper limit (up to vehicle capacity)"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all font-semibold disabled:opacity-60 disabled:bg-slate-100"
                  />
                  {(formData.guest_policy === 'solo' || formData.guest_policy === 'couple') && (
                    <span className="absolute right-3 top-2.5 text-[11px] font-medium text-slate-400">
                      Locked ({formData.max_guests})
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Leave empty if party size is unrestricted.
                </p>
              </div>
            </div>

            {/* Live Explanation Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
              <Info className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Tourist Booking Behavior: </span>
                {formData.guest_policy === 'solo' && (
                  <span>This tour is strictly marked for <strong>1 solo traveler</strong>. In the booking flow, the traveler count is automatically locked to 1.</span>
                )}
                {formData.guest_policy === 'couple' && (
                  <span>This tour is strictly marked for <strong>2 travelers (Couple Package)</strong>. In the booking flow, the traveler count is automatically locked to 2.</span>
                )}
                {formData.guest_policy === 'family' && (
                  <span>This tour is configured for families/groups. Customers must select between <strong>{formData.min_guests}</strong> and <strong>{formData.max_guests || 'fleet maximum'}</strong> travelers.</span>
                )}
                {formData.guest_policy === 'custom' && (
                  <span>Flexible package. Customers can select from <strong>{formData.min_guests}</strong> {formData.max_guests ? `to ${formData.max_guests}` : 'or more'} travelers.</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Repeaters (Highlights, Included, Excluded) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Inclusions, Exclusions & Highlights
                </h2>
                <p className="text-[11px] text-slate-500">
                  Key travel highlights, amenities, and package inclusions
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:text-orange-700 cursor-pointer disabled:opacity-50"
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
                      className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                    What&apos;s Included ({formData.included.length})
                  </label>
                  <button
                    type="button"
                    onClick={addIncluded}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:text-[#EA580C] cursor-pointer disabled:opacity-50"
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
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
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
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition-all disabled:opacity-60"
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
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#FF6B00] text-white font-mono shadow-2xs">
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
                        className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all disabled:opacity-60"
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
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Multi-Image Tour Gallery Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Tour Gallery Images
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200/60">
                    {formData.gallery_images.length} {formData.gallery_images.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showcase multiple destinations, accommodations, activities, and scenic viewpoints (auto-optimized to WebP)
                </p>
              </div>

              {formData.gallery_images.length > 0 && (
                <button
                  type="button"
                  disabled={isSubmitting || isUploadingGallery}
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More Photos</span>
                </button>
              )}
            </div>

            {/* Gallery Upload Error Banner */}
            {galleryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{galleryError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGalleryError(null)}
                  className="text-rose-500 hover:text-rose-800 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Gallery Optimization Success Banner */}
            {galleryOptimizationSummary && (
              <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200/80 text-orange-950 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                  <span className="font-medium text-slate-800">{galleryOptimizationSummary}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGalleryOptimizationSummary(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Hidden multi-file input */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isSubmitting || isUploadingGallery}
              onChange={handleGalleryUpload}
              className="hidden"
              id="gallery-file-upload"
            />

            {/* Multi-Image Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsGalleryDragging(true);
              }}
              onDragLeave={() => setIsGalleryDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsGalleryDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  processGalleryFiles(e.dataTransfer.files);
                }
              }}
            >
              <label
                htmlFor="gallery-file-upload"
                className={`
                  rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3
                  ${isGalleryDragging ? 'border-orange-500 bg-orange-50/50 scale-[0.99]' : 'border-slate-300 hover:border-orange-500 hover:bg-orange-50/20'}
                  ${isUploadingGallery ? 'pointer-events-none opacity-80 bg-slate-50' : ''}
                `}
              >
                {isUploadingGallery ? (
                  <>
                    <Loader2 className="w-9 h-9 text-[#FF6B00] animate-spin" />
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-800 block">
                        {galleryUploadStage || 'Uploading gallery photos...'}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        Uploading high-resolution photos...
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100 shadow-sm">
                      <Images className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">
                        <span className="text-[#FF6B00] hover:underline">
                          Click to browse multiple photos
                        </span>{' '}
                        or drag and drop them here
                      </p>
                      <p className="text-xs text-slate-500">
                        Select multiple images at once (JPEG, PNG, WebP) • Up to 10MB per file
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                      <Sparkles className="w-3 h-3 text-orange-500" />
                      <span>Optimized for fast mobile loading</span>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Thumbnail Previews Grid */}
            {formData.gallery_images.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-bold">
                    Uploaded Gallery Thumbnails ({formData.gallery_images.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Remove all gallery photos?')) {
                        setFormData((prev) => ({ ...prev, gallery_images: [] }));
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer text-[11px]"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {formData.gallery_images.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs hover:shadow-md transition-shadow"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Gallery photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Photo Index Badge */}
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/70 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                        #{index + 1}
                      </div>

                      {/* Remove 'x' Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        disabled={isSubmitting || isUploadingGallery}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-700 shadow cursor-pointer transition-all hover:scale-110 disabled:opacity-50"
                        title="Remove photo"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Bottom Filename overlay on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate px-1">
                          {url.split('/').pop() || `Photo ${index + 1}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar for Quick Submissions */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
              <span>Ready to submit? All details will be validated and synced to your database.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Link
                href="/admin/tours"
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors text-center"
              >
                Cancel
              </Link>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploadingImage || isUploadingGallery}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Tour Package...</span>
                  </>
                ) : isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Cover...</span>
                  </>
                ) : isUploadingGallery ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Gallery...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Publish Tour Package</span>
                  </>
                )}
              </button>
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
                      formData.is_active ? 'bg-[#FF6B00]' : 'bg-slate-300'
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
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50
                  ${formData.is_active ? 'bg-[#FF6B00]' : 'bg-slate-300'}
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
                  Featured Tour ("Curated" Badge)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Displays a prominent Curated badge on the homepage card
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

            {/* Display Order Priority */}
            <div className="pt-3 border-t border-slate-100">
              <label
                htmlFor="tour-order"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Display Order Priority
              </label>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Lowest numbers (e.g. 1, 2, 3) appear first on the homepage tours list.
              </p>
              <input
                id="tour-order"
                type="number"
                min={0}
                disabled={isSubmitting}
                value={formData.display_order}
                onChange={(e) => handleFieldChange('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Task 9: Real Supabase Storage Upload for Cover Image */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tour Cover Image
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                Primary Display
              </span>
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-rose-500 hover:text-rose-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSubmitting || isUploadingImage}
              onChange={handleCoverImageUpload}
              className="hidden"
              id="cover-file-upload"
            />

            {formData.cover_image ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video relative bg-slate-100 group shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.cover_image}
                    alt="Tour cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-bold bg-white text-slate-900 rounded-lg shadow hover:bg-slate-100 transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      className="p-1.5 text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Optimization Savings Badge */}
                {optimizationInfo && optimizationInfo.reductionPercentage > 0 && (
                  <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80 text-slate-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Optimized ({optimizationInfo.reductionPercentage}% size reduced)</span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-mono">
                      {optimizationInfo.compressedSize} (WebP)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[200px]" title={formData.cover_image}>
                    {formData.cover_image.split('/').pop()}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="cover-file-upload"
                className={`
                  rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/20
                  p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5
                  ${isUploadingImage ? 'pointer-events-none opacity-70 bg-slate-50' : ''}
                `}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
                    <span className="text-xs font-bold text-slate-700">
                      {uploadStage === 'optimizing'
                        ? 'Optimizing image (WebP)...'
                        : 'Uploading to Supabase Storage...'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {uploadStage === 'optimizing'
                        ? 'Optimizing photo for fast mobile browsing...'
                        : 'Uploading image...'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-100 flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#FF6B00]">
                        Click to upload cover image
                      </span>
                      <span className="text-xs text-slate-500"> or drag and drop</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Recommended 1920×1080 • JPG, PNG or WebP
                    </span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Live Tour Card Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Card Summary Preview</span>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                Live Preview
              </span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              {formData.cover_image && (
                <div className="aspect-video w-full rounded-lg overflow-hidden relative bg-slate-200 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.cover_image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

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

              {formData.destination_id && (
                <div className="text-[11px] text-slate-700 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF6B00]" />
                  <span>
                    {destinations.find((d) => d.id === formData.destination_id)?.name ||
                      'Selected Destination'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  {formData.duration_days}D / {formData.duration_nights}N
                </span>
                <span className="font-black text-[#FF6B00]">
                  ${formData.price_usd} USD
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{formData.itinerary.length} Days Itinerary</span>
                <span>{formData.gallery_images.length} Gallery Photos</span>
              </div>

              {formData.gallery_images.length > 0 && (
                <div className="pt-2 flex items-center gap-1.5 overflow-hidden">
                  {formData.gallery_images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200 shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Mini preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {formData.gallery_images.length > 4 && (
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-900 flex items-center justify-center text-[11px] font-bold flex-shrink-0 border border-orange-200">
                      +{formData.gallery_images.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
