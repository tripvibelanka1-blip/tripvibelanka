'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Images,
  Loader2,
  MapPin,
  UploadCloud,
  Ticket,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { ActivityUpdate, DestinationRecord } from '@/types/database';
import { compressImage } from '@/utils/imageCompression';
import DestinationSelect from '@/components/admin/DestinationSelect';
import TrustTooltip from '@/components/admin/TrustTooltip';
import AIContentHelper from '@/components/admin/AIContentHelper';
import CustomSelect, { CustomSelectOption } from '@/components/admin/CustomSelect';
import { Compass as CompassIcon, Footprints, Landmark, Utensils, Anchor } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface ActivityFormData {
  title: string;
  category: string;
  location: string;
  display_order: number;
  destination_id: string;
  duration: string;
  price: number;
  price_lkr?: number;
  description: string;
  cover_image: string;
  gallery_images: string[];
  is_active: boolean;
}

const ACTIVITY_CATEGORY_OPTIONS: CustomSelectOption[] = [
  { value: 'Wildlife & Nature', label: 'Wildlife & Nature', description: 'National parks, leopard safaris & birding', icon: <CompassIcon className="w-3.5 h-3.5 text-emerald-600" /> },
  { value: 'Adventure & Trekking', label: 'Adventure & Trekking', description: 'Peak climbs, tea ridge hiking & ziplines', icon: <Footprints className="w-3.5 h-3.5 text-amber-600" /> },
  { value: 'Cultural & Sacred', label: 'Cultural & Sacred', description: 'Ancient ruins, sacred shrines & rituals', icon: <Landmark className="w-3.5 h-3.5 text-orange-600" /> },
  { value: 'Culinary & Heritage', label: 'Culinary & Heritage', description: 'Ceylon tea tasting, spice trails & cooking classes', icon: <Utensils className="w-3.5 h-3.5 text-rose-600" /> },
  { value: 'Marine Adventure', label: 'Marine Adventure', description: 'Whale watching, scuba diving & ocean surf', icon: <Anchor className="w-3.5 h-3.5 text-sky-600" /> },
];

const ACTIVITY_CATEGORIES = [
  ...ACTIVITY_CATEGORY_OPTIONS.map((c) => c.value),
  'Wellness & Ayurveda',
  'Scenic & Photography',
];

const initialFormData: ActivityFormData = {
  title: '',
  category: 'Wildlife & Nature',
  location: '',
  display_order: 0,
  destination_id: '',
  duration: '',
  price: 0,
  price_lkr: 0,
  description: '',
  cover_image: '',
  gallery_images: [],
  is_active: true,
};

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params?.id as string;
  const { exchangeRate, isFallback: isRateFallback } = useCurrency();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<ActivityFormData>(initialFormData);
  const [destinations, setDestinations] = useState<DestinationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activityNotFound, setActivityNotFound] = useState<boolean>(false);

  // Cover Image upload states
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [coverUploadStage, setCoverUploadStage] = useState<'optimizing' | 'uploading' | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

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

  // ----------------------------------------------------
  // Fetch Existing Activity and Destinations on Mount
  // ----------------------------------------------------
  useEffect(() => {
    async function loadData() {
      if (!activityId) return;

      const supabase = createClient();
      setIsLoading(true);
      setErrorBanner(null);

      try {
        const [activityRes, destinationsRes] = await Promise.all([
          supabase.from('activities').select('*').eq('id', activityId).single(),
          supabase.from('destinations').select('*').order('name', { ascending: true }),
        ]);

        if (destinationsRes.data) {
          setDestinations(destinationsRes.data);
        }

        if (activityRes.error || !activityRes.data) {
          setActivityNotFound(true);
          return;
        }

        const data = activityRes.data;
        let gallery: string[] = [];
        if (data.gallery_images && Array.isArray(data.gallery_images)) {
          gallery = data.gallery_images as string[];
        }

        setFormData({
          title: data.title || '',
          category: data.category || 'Wildlife & Nature',
          location: data.location || '',
          display_order: Number(data.display_order) || 0,
          destination_id: data.destination_id || '',
          duration: data.duration || '',
          price: Number(data.price) || 0,
          price_lkr: Number(data.price_lkr) || 0,
          description: data.description || '',
          cover_image: data.cover_image || '',
          gallery_images: gallery,
          is_active: data.is_active ?? true,
        });
      } catch (err: unknown) {
        console.error('[Error loading activity]:', err);
        setActivityNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [activityId]);

  // Field change handler
  const handleFieldChange = (
    field: keyof ActivityFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ----------------------------------------------------
  // Cover Image Upload to 'activity-images'
  // ----------------------------------------------------
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    if (rawFile.size > 10 * 1024 * 1024) {
      setCoverError('Image size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    setCoverError(null);
    setIsUploadingCover(true);
    setCoverUploadStage('optimizing');

    try {
      const { file: optimizedFile } = await compressImage(rawFile, 1920, 0.82);
      setCoverUploadStage('uploading');

      const supabase = createClient();
      const fileExt = optimizedFile.name.split('.').pop() || 'webp';
      const cleanFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;
      const filePath = `covers/${cleanFileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('activity-images')
        .upload(filePath, optimizedFile, {
          cacheControl: '31536000',
          contentType: optimizedFile.type,
          upsert: false,
        });

      if (uploadErr) {
        setCoverError(`Upload failed: ${uploadErr.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('activity-images').getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        cover_image: publicUrl,
      }));
    } catch (err: unknown) {
      console.error('[Activity Cover Upload Error]:', err);
      setCoverError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during image upload.'
      );
    } finally {
      setIsUploadingCover(false);
      setCoverUploadStage(null);
    }
  };

  const handleRemoveCover = () => {
    setFormData((prev) => ({ ...prev, cover_image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ----------------------------------------------------
  // Gallery Multi-Image Upload to 'activity-images'
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
          .from('activity-images')
          .upload(filePath, optimizedFile, {
            cacheControl: '31536000',
            contentType: optimizedFile.type,
            upsert: false,
          });

        if (!uploadErr) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('activity-images').getPublicUrl(filePath);
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
      console.error('[Activity Gallery Upload Error]:', err);
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
  // Form Submission (Update)
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessBanner(null);

    if (!formData.title.trim()) {
      setErrorBanner('Please provide an activity title (e.g. Yala National Park Safari).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: ActivityUpdate = {
        title: formData.title.trim(),
        category: formData.category.trim() || 'Wildlife & Nature',
        location: formData.location.trim() || null,
        display_order: Number(formData.display_order) || 0,
        destination_id: formData.destination_id || null,
        duration: formData.duration.trim() || null,
        price: Number(formData.price) || 0,
        price_lkr: Number(formData.price_lkr) || 0,
        description: formData.description.trim() || null,
        cover_image: formData.cover_image || null,
        gallery_images: formData.gallery_images || [],
        is_active: Boolean(formData.is_active),
        updated_at: new Date().toISOString(),
      };

      const supabase = createClient();
      const { error } = await supabase
        .from('activities')
        .update(payload)
        .eq('id', activityId);

      if (error) {
        throw new Error(error.message);
      }

      setSuccessBanner(`Activity "${formData.title}" updated successfully! Redirecting...`);

      setTimeout(() => {
        router.push('/admin/activities');
      }, 1000);
    } catch (err: unknown) {
      console.error('[Update Activity Error]:', err);
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to update activity.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Delete Activity Handler
  // ----------------------------------------------------
  const handleDeleteActivity = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        throw new Error(error.message);
      }

      router.push('/admin/activities');
    } catch (err: unknown) {
      console.error('[Delete Activity Error]:', err);
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to delete activity.'
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
            <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
            <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 404 State
  if (activityNotFound) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-200 flex items-center justify-center mx-auto shadow-sm">
          <Ticket className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Activity Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The activity or experience you are trying to edit does not exist or has been removed from the database.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/activities"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Activities</span>
          </Link>
        </div>
      </div>
    );
  }

  const selectedDestinationName =
    destinations.find((d) => d.id === formData.destination_id)?.name || '';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Edit Activity & Experience
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-950 border border-orange-200/70">
              {formData.title || 'Editing'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify day-trip itinerary highlights, pricing structure, duration, and photo gallery
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/activities"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50/70 border border-rose-200/80 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
            title="Delete Activity"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingCover || isUploadingGallery}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Activity...</span>
              </>
            ) : isUploadingCover ? (
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
                <span>Update Activity</span>
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
                Activity modifications synced with your database catalog.
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
          {/* Section 1: Basic Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Experience Details
                </h2>
                <p className="text-[11px] text-slate-500">
                  Activity title, location linking, duration, and pricing structure
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="act-title"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <AIContentHelper
                  topic={formData.title}
                  location={formData.location || formData.title}
                  moduleType="activity"
                />
              </div>
              <input
                id="act-title"
                type="text"
                required
                disabled={isSubmitting}
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Yala National Park Leopard Safari, Sigiriya Rock Fortress Climb"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>

            {/* Category & Specific Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label
                  htmlFor="act-category"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Category
                </label>
                <CustomSelect
                  options={ACTIVITY_CATEGORY_OPTIONS}
                  value={formData.category}
                  onChange={(val) => handleFieldChange('category', val)}
                  disabled={isSubmitting}
                  placeholder="Select activity category..."
                  id="act-category"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Shown as the category badge on the homepage card
                </p>
              </div>

              {/* Excursion Location Spot */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="act-location"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Location / Spot <span className="text-[10px] font-normal lowercase text-slate-400">(optional)</span>
                  </label>
                  <AIContentHelper
                    topic={formData.title}
                    location={formData.location || formData.title}
                    moduleType="activity"
                  />
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="act-location"
                    type="text"
                    disabled={isSubmitting}
                    value={formData.location}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    placeholder="e.g. Yala National Park, Mirissa Marina"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Defaults to selected destination region if left blank
                </p>
              </div>
            </div>

            {/* Destination Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Destination Region
              </label>
              <DestinationSelect
                destinations={destinations}
                value={formData.destination_id}
                onChange={(val) => handleFieldChange('destination_id', val)}
                disabled={isSubmitting}
                placeholder="-- Select Associated Destination Region --"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Links this activity directly to the selected destination page and tour filters.
              </p>
            </div>

            {/* Duration & Dual Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Duration */}
              <div>
                <label
                  htmlFor="act-duration"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Duration (e.g. 3 Hours / Half Day)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="act-duration"
                    type="text"
                    disabled={isSubmitting}
                    value={formData.duration}
                    onChange={(e) => handleFieldChange('duration', e.target.value)}
                    placeholder="e.g. 4-5 Hours, Full Day"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60 font-medium"
                  />
                </div>
              </div>

              {/* Price (USD) - Required (0 for Free) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="act-price"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Price (USD) <span className="text-rose-500">*</span>
                  </label>
                  {formData.price > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const calculatedLkr = Math.round(formData.price * exchangeRate);
                        handleFieldChange('price_lkr', calculatedLkr);
                      }}
                      className="text-[10px] font-bold text-[#FF6B00] hover:underline cursor-pointer bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-200/80 transition-all active:scale-95"
                      title={`Auto-convert USD to LKR using cached live rate (1 USD ≈ ${exchangeRate.toFixed(2)} LKR)`}
                    >
                      ⚡ Auto-fill ({exchangeRate.toFixed(0)})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="act-price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    disabled={isSubmitting}
                    value={formData.price || ''}
                    onChange={(e) =>
                      handleFieldChange('price', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00 ($0 = Free)"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all font-bold disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Price (LKR) - Optional + Trust Tooltip */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="act-price-lkr"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Price (LKR) <span className="text-[10px] font-normal lowercase text-slate-400">(optional)</span>
                  </label>
                  <TrustTooltip
                    title="Activity Rate in LKR"
                    message="Optional: Quoting activity or safari admission in LKR provides clarity for local guests and avoids foreign card surcharge disputes."
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rs.
                  </span>
                  <input
                    id="act-price-lkr"
                    type="number"
                    min="0"
                    step="any"
                    disabled={isSubmitting}
                    value={formData.price_lkr || ''}
                    onChange={(e) =>
                      handleFieldChange('price_lkr', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Optional (e.g. 15500)"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all font-bold disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="act-desc"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Overview & Experience Description
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.description.length} characters
                </span>
              </div>
              <textarea
                id="act-desc"
                rows={4}
                disabled={isSubmitting}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe what makes this experience memorable, what travelers will see, required fitness level, and inclusions..."
                className="w-full p-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Section 2: Gallery Multi-Image Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
                  <Images className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Activity Photo Gallery
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Upload vibrant action shots and scenic highlights
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
              id="act-gallery-file-upload"
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
                htmlFor="act-gallery-file-upload"
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
                        JPEG, PNG, WebP • Auto-optimized with WebP compression
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
                    Uploaded Gallery ({formData.gallery_images.length})
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
              <span>Modify details and sync changes with your live experiences catalog.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50/70 border border-rose-200/80 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                title="Delete Activity"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                <span>Delete</span>
              </button>

              <Link
                href="/admin/activities"
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors text-center"
              >
                Cancel
              </Link>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploadingCover || isUploadingGallery}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Activity...</span>
                  </>
                ) : isUploadingCover ? (
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
                    <span>Update Activity</span>
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
                  Visible to website visitors and tour package integrations
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

            {/* Display Order */}
            <div className="pt-3 border-t border-slate-100">
              <label
                htmlFor="act-display-order"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Homepage Display Order
              </label>
              <input
                id="act-display-order"
                type="number"
                min="0"
                step="1"
                disabled={isSubmitting}
                value={formData.display_order}
                onChange={(e) =>
                  handleFieldChange('display_order', parseInt(e.target.value, 10) || 0)
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all font-bold disabled:opacity-60"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Lower numbers appear first on the home page slider (1, 2, 3...)
              </p>
            </div>
          </div>

          {/* Primary Cover Image Dropzone */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Primary Cover Image
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                Main Thumbnail
              </span>
            </div>

            {coverError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <span>{coverError}</span>
                <button
                  type="button"
                  onClick={() => setCoverError(null)}
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
              disabled={isSubmitting || isUploadingCover}
              onChange={handleCoverUpload}
              className="hidden"
              id="act-cover-file-upload"
            />

            {formData.cover_image ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video relative bg-slate-100 group shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.cover_image}
                    alt="Activity cover preview"
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
                      onClick={handleRemoveCover}
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
                    onClick={handleRemoveCover}
                    className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="act-cover-file-upload"
                className={`
                  rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/20
                  p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5
                  ${isUploadingCover ? 'pointer-events-none opacity-70 bg-slate-50' : ''}
                `}
              >
                {isUploadingCover ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
                    <span className="text-xs font-bold text-slate-700">
                      {coverUploadStage === 'optimizing'
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

          {/* Live Card Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Card Summary Preview</span>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                Live Preview
              </span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              {formData.cover_image ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden relative bg-slate-200 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.cover_image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg bg-orange-50/60 border border-dashed border-orange-200 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <Ticket className="w-6 h-6 text-[#FF6B00]/40" />
                  <span className="text-[11px] font-medium">Cover Photo Preview</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {formData.title || 'Untitled Activity'}
                </span>
                <div className="text-right">
                  <span className="font-bold text-[#FF6B00] text-xs block">
                    {formData.price > 0 ? `$${formData.price.toFixed(2)} USD` : 'Free / Enquire'}
                  </span>
                  {Number(formData.price_lkr) > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Rs. {Number(formData.price_lkr).toLocaleString()} LKR
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedDestinationName && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-100 text-orange-900 px-2 py-0.5 rounded-full">
                    <MapPin className="w-2.5 h-2.5 text-[#FF6B00]" />
                    {selectedDestinationName}
                  </span>
                )}
                {formData.duration && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    {formData.duration}
                  </span>
                )}
              </div>

              {formData.description && (
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {formData.description}
                </p>
              )}

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{formData.gallery_images.length} Photos</span>
                <span className={formData.is_active ? 'text-[#FF6B00] font-semibold' : 'text-slate-400'}>
                  {formData.is_active ? 'Active' : 'Hidden'}
                </span>
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
                Are you sure you want to delete this activity? This will remove all image references and pricing configurations. This action cannot be undone.
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
                onClick={handleDeleteActivity}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Activity</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
