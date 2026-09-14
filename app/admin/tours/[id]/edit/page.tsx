'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
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
  Images,
  Loader2,
  MapPin,
  UploadCloud,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { TourUpdate, TourItineraryItem, DestinationRecord } from '@/types/database';
import { compressImage } from '@/utils/imageCompression';
import DestinationSelect from '@/components/admin/DestinationSelect';
import TrustTooltip from '@/components/admin/TrustTooltip';
import DualPriceInput from '@/components/admin/DualPriceInput';

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

const defaultFormData: TourFormData = {
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

export default function EditTourPage() {
  const router = useRouter();
  const params = useParams();
  const tourId = params?.id as string;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<TourFormData>(defaultFormData);
  const [destinations, setDestinations] = useState<DestinationRecord[]>([]);
  const [isLoadingTour, setIsLoadingTour] = useState<boolean>(true);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(true);
  const [tourNotFound, setTourNotFound] = useState<boolean>(false);

  // Cover Image upload states
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadStage, setUploadStage] = useState<'optimizing' | 'uploading' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Gallery upload states
  const [isUploadingGallery, setIsUploadingGallery] = useState<boolean>(false);
  const [isGalleryDragging, setIsGalleryDragging] = useState<boolean>(false);
  const [galleryUploadStage, setGalleryUploadStage] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteTour = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', tourId);

      if (error) {
        throw new Error(error.message);
      }

      router.push('/admin/tours');
    } catch (err: unknown) {
      console.error('[Delete Tour Error]:', err);
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to delete tour package.'
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ----------------------------------------------------
  // Load Tour and Destinations on Mount
  // ----------------------------------------------------
  useEffect(() => {
    async function loadData() {
      if (!tourId) return;

      const supabase = createClient();
      setIsLoadingTour(true);
      setIsLoadingDestinations(true);

      try {
        // Parallel fetch for speed
        const [tourRes, destRes] = await Promise.all([
          supabase.from('tours').select('*').eq('id', tourId).single(),
          supabase.from('destinations').select('*').order('name', { ascending: true }),
        ]);

        if (destRes.data) {
          setDestinations(destRes.data);
        }
        setIsLoadingDestinations(false);

        if (tourRes.error || !tourRes.data) {
          setTourNotFound(true);
          setIsLoadingTour(false);
          return;
        }

        const tour = tourRes.data;
        const locationsList = Array.isArray(tour.locations)
          ? (tour.locations as string[]).join(', ')
          : '';

        setFormData({
          title: tour.title || '',
          category: tour.category || 'Cultural',
          tagline: tour.tagline || '',
          locations_input: locationsList,
          display_order: tour.display_order ?? 1,
          destination_id: tour.destination_id || '',
          duration_days: tour.duration_days ?? 1,
          duration_nights: tour.duration_nights ?? 0,
          price_usd: Number(tour.price_usd) || 0,
          price_lkr: Number(tour.price_lkr) || 0,
          description: tour.description || '',
          highlights:
            tour.highlights && tour.highlights.length > 0
              ? tour.highlights
              : [''],
          included:
            tour.included && tour.included.length > 0 ? tour.included : [''],
          excluded:
            tour.excluded && tour.excluded.length > 0 ? tour.excluded : [''],
          itinerary:
            tour.itinerary && tour.itinerary.length > 0
              ? tour.itinerary
              : [{ day: 1, title: '', details: '' }],
          cover_image: tour.cover_image || '',
          gallery_images: tour.gallery_images || [],
          is_featured: Boolean(tour.is_featured),
          is_active: Boolean(tour.is_active),
        });
      } catch (err) {
        console.error('[Error loading tour]:', err);
        setTourNotFound(true);
      } finally {
        setIsLoadingTour(false);
      }
    }

    loadData();
  }, [tourId]);

  // Field change handler
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
  // Cover Image Upload Handler
  // ----------------------------------------------------
  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    if (rawFile.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    setUploadError(null);
    setIsUploadingImage(true);
    setUploadStage('optimizing');

    try {
      const { file: optimizedFile } = await compressImage(rawFile, 1920, 0.82);
      setUploadStage('uploading');

      const supabase = createClient();
      const fileExt = optimizedFile.name.split('.').pop() || 'webp';
      const cleanFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;
      const filePath = `covers/${cleanFileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('tour-images')
        .upload(filePath, optimizedFile, {
          cacheControl: '31536000',
          contentType: optimizedFile.type,
          upsert: false,
        });

      if (uploadErr) {
        setUploadError(`Upload failed: ${uploadErr.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('tour-images').getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        cover_image: publicUrl,
      }));
    } catch (err: unknown) {
      console.error('[Cover Upload Error]:', err);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ----------------------------------------------------
  // Gallery Multi-Image Upload
  // ----------------------------------------------------
  const processGalleryFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setGalleryError(null);
    setIsUploadingGallery(true);
    setGalleryUploadStage(`Optimizing ${fileList.length} photo${fileList.length === 1 ? '' : 's'}...`);

    try {
      const supabase = createClient();
      const newUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > 10 * 1024 * 1024) continue;

        setGalleryUploadStage(`Uploading photo ${i + 1} of ${fileList.length}...`);

        const { file: optimizedFile } = await compressImage(file, 1600, 0.8);
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

        if (!uploadErr) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('tour-images').getPublicUrl(filePath);
          newUrls.push(publicUrl);
        }
      }

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          gallery_images: [...prev.gallery_images, ...newUrls],
        }));
      }
    } catch (err: unknown) {
      console.error('[Gallery Upload Error]:', err);
      setGalleryError('Failed to upload some gallery photos. Please try again.');
    } finally {
      setIsUploadingGallery(false);
      setGalleryUploadStage(null);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processGalleryFiles(e.target.files);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // ----------------------------------------------------
  // Dynamic Repeaters Handlers
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
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day: prev.itinerary.length + 1,
          title: '',
          details: '',
        },
      ],
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData((prev) => {
      const filtered = prev.itinerary.filter((_, i) => i !== index);
      const reindexed = filtered.map((item, idx) => ({
        ...item,
        day: idx + 1,
      }));
      return {
        ...prev,
        itinerary: reindexed,
      };
    });
  };

  // ----------------------------------------------------
  // Form Update Submission
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessBanner(null);

    if (!formData.title.trim()) {
      setErrorBanner('Please enter a tour title.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.price_usd || formData.price_usd <= 0) {
      setErrorBanner('Price in USD is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.description.trim()) {
      setErrorBanner('Please provide a tour content description.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedHighlights = formData.highlights
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      const cleanedIncluded = formData.included
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const cleanedExcluded = formData.excluded
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const cleanedItinerary: TourItineraryItem[] = formData.itinerary
        .filter((item) => item.title.trim() || item.details.trim())
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

      const payload: TourUpdate = {
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

      const supabase = createClient();
      const { error } = await supabase
        .from('tours')
        .update(payload)
        .eq('id', tourId);

      if (error) {
        throw new Error(error.message);
      }

      setSuccessBanner(`Tour "${formData.title}" updated successfully! Redirecting...`);

      setTimeout(() => {
        router.push('/admin/tours');
      }, 1200);
    } catch (err: unknown) {
      console.error('[Update Tour Error]:', err);
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to update tour package.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State Skeleton
  if (isLoadingTour) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          Loading tour package details...
        </p>
      </div>
    );
  }

  // Not Found State
  if (tourNotFound) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Tour Package Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The tour you are trying to edit does not exist or has already been removed.
        </p>
        <Link
          href="/admin/tours"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tours Listing</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Edit Tour Package
          </h1>
          <p className="text-xs text-slate-500">
            Update itinerary, pricing, media gallery, and live website publishing status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/tours"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50/70 border border-rose-200/80 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
            title="Delete Tour Package"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage || isUploadingGallery}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Package...</span>
              </>
            ) : isUploadingImage ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading Cover...</span>
              </>
            ) : isUploadingGallery ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading Photos...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Update Tour</span>
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
                Changes saved and synced with your database catalog.
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
              <div className="font-bold text-rose-900">Update Error</div>
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
                <label
                  htmlFor="edit-tour-title"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Tour Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-tour-title"
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
                  htmlFor="edit-tour-category"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Category Filter
                </label>
                <select
                  id="edit-tour-category"
                  disabled={isSubmitting}
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60 font-medium text-slate-800"
                >
                  <option value="Cultural">Cultural</option>
                  <option value="Wildlife">Wildlife</option>
                  <option value="Coastal">Coastal</option>
                  <option value="Hill Country">Hill Country</option>
                  <option value="Signature">Signature</option>
                </select>
              </div>
            </div>

            {/* Tagline & Locations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-tour-tagline"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Marketing Tagline / Subtitle
                </label>
                <input
                  id="edit-tour-tagline"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.tagline}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  placeholder="e.g. The definitive circuit blending ancient wonders with untamed wildlife."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-tour-locations"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Route Locations (Comma Separated)
                </label>
                <input
                  id="edit-tour-locations"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.locations_input}
                  onChange={(e) => handleFieldChange('locations_input', e.target.value)}
                  placeholder="e.g. Colombo, Sigiriya, Kandy, Yala, Galle"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Custom Destination Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
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
                  htmlFor="edit-tour-description"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Content Description <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.description.length} characters
                </span>
              </div>
              <textarea
                id="edit-tour-description"
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
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="edit-duration-days"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Duration Days
                </label>
                <input
                  id="edit-duration-days"
                  type="number"
                  min={1}
                  disabled={isSubmitting}
                  value={formData.duration_days}
                  onChange={(e) =>
                    handleFieldChange('duration_days', parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-duration-nights"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Duration Nights
                </label>
                <input
                  id="edit-duration-nights"
                  type="number"
                  min={0}
                  disabled={isSubmitting}
                  value={formData.duration_nights}
                  onChange={(e) =>
                    handleFieldChange('duration_nights', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
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

          {/* Section 3: Highlights, Inclusions & Exclusions */}
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:text-[#EA580C] cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Highlight</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.highlights.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      disabled={isSubmitting}
                      value={item}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                      placeholder={`Highlight #${index + 1}`}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={formData.highlights.length <= 1 || isSubmitting}
                      onClick={() => removeHighlight(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Included */}
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

              {/* Excluded */}
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
                        placeholder={`Day ${item.day} Title (e.g. Scenic Hill Country Train)`}
                        className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all disabled:opacity-60"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={formData.itinerary.length <= 1 || isSubmitting}
                      onClick={() => removeItineraryDay(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete this day"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    disabled={isSubmitting}
                    value={item.details}
                    onChange={(e) =>
                      handleItineraryChange(index, 'details', e.target.value)
                    }
                    placeholder={`Describe the schedule, activities, meals, and hotels for Day ${item.day}...`}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all disabled:opacity-60"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Gallery Images */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
                  <Images className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Tour Gallery Images
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Showcase multiple viewpoints, activities, and accommodations
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-700">
                {formData.gallery_images.length} Photos
              </span>
            </div>

            {galleryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <span>{galleryError}</span>
                <button
                  type="button"
                  onClick={() => setGalleryError(null)}
                  className="text-rose-500 hover:text-rose-800 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isSubmitting || isUploadingGallery}
              onChange={handleGalleryUpload}
              className="hidden"
              id="edit-gallery-file-upload"
            />

            {/* Dropzone */}
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
                htmlFor="edit-gallery-file-upload"
                className={`
                  rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5
                  ${isGalleryDragging ? 'border-orange-500 bg-orange-50/50 scale-[0.99]' : 'border-slate-300 hover:border-orange-500 hover:bg-orange-50/20'}
                  ${isUploadingGallery ? 'pointer-events-none opacity-80 bg-slate-50' : ''}
                `}
              >
                {isUploadingGallery ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
                    <span className="text-xs font-bold text-slate-800 block">
                      {galleryUploadStage || 'Uploading gallery photos...'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100 shadow-xs">
                      <Images className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        <span className="text-[#FF6B00] hover:underline">
                          Click to browse photos
                        </span>{' '}
                        or drag and drop them here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        JPEG, PNG, WebP • Auto-optimized for web
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Thumbnails */}
            {formData.gallery_images.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-bold">
                    Gallery Thumbnails ({formData.gallery_images.length})
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {formData.gallery_images.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Gallery photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/70 text-white font-mono text-[10px] font-bold">
                        #{index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-700 shadow cursor-pointer transition-all hover:scale-110"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
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
              <span>Modify details and sync changes with your live tour catalog.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50/70 border border-rose-200/80 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                title="Delete Tour Package"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                <span>Delete</span>
              </button>

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
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Tour Package...</span>
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
                    <span>Update Tour Package</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100">
              Publishing & Visibility
            </h3>

            {/* Active Status */}
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

            {/* Featured Status */}
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
                htmlFor="edit-tour-order"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Display Order Priority
              </label>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Lowest numbers (e.g. 1, 2, 3) appear first on the homepage tours list.
              </p>
              <input
                id="edit-tour-order"
                type="number"
                min={0}
                disabled={isSubmitting}
                value={formData.display_order}
                onChange={(e) => handleFieldChange('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Cover Image Card */}
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSubmitting || isUploadingImage}
              onChange={handleCoverImageUpload}
              className="hidden"
              id="edit-cover-file-upload"
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
                      className="px-3 py-1.5 text-xs font-bold bg-white text-slate-900 rounded-lg shadow hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      className="p-1.5 text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

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
                htmlFor="edit-cover-file-upload"
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
                        ? 'Optimizing photo...'
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
                        Click to upload cover photo
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

          {/* Live Card Summary Preview */}
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
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Delete &quot;{formData.title}&quot;?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete this tour package? This will remove all associated itinerary data and pricing schedules. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTour}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Tour Package</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
