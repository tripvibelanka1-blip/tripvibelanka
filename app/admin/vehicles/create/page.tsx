'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Images,
  Loader2,
  Car,
  UploadCloud,
  Users,
  Briefcase,
  Gauge,
  Fuel,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { VehicleInsert } from '@/types/database';
import { compressImage } from '@/utils/imageCompression';
import CustomSelect, { CustomSelectOption } from '@/components/admin/CustomSelect';
import TrustTooltip from '@/components/admin/TrustTooltip';
import AIContentHelper from '@/components/admin/AIContentHelper';
import { useCurrency } from '@/context/CurrencyContext';

interface VehicleFormData {
  name: string;
  category: string;
  license_plate: string;
  passenger_capacity: number;
  luggage_capacity: number;
  passengers_text: string;
  luggage_text: string;
  recommended_for: string;
  display_order: number;
  transmission: string;
  fuel_type: string;
  features: string[];
  description: string;
  cover_image: string;
  gallery_images: string[];
  price_per_day_usd: number;
  price_per_day_lkr: number;
  price_per_km_usd: number;
  price_per_km_lkr: number;
  is_active: boolean;
}

const CATEGORY_OPTIONS: CustomSelectOption[] = [
  { value: 'van', label: 'Passenger Van', description: 'Toyota HiAce, KDH (6-14 seats)', icon: <Car className="w-3.5 h-3.5" /> },
  { value: 'sedan', label: 'Sedan Car', description: 'Prius, Axio, Allion (3-4 seats)', icon: <Car className="w-3.5 h-3.5" /> },
  { value: 'luxury', label: 'Luxury VIP Chauffeur', description: 'Mercedes, Land Cruiser Prado', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { value: 'mini_bus', label: 'Mini Bus', description: 'Toyota Coaster, Rosa (15-22 seats)', icon: <Users className="w-3.5 h-3.5" /> },
  { value: 'bus', label: 'Large Tourist Coach', description: 'Scania, King Long (28-45 seats)', icon: <Users className="w-3.5 h-3.5" /> },
];

const TRANSMISSION_OPTIONS: CustomSelectOption[] = [
  { value: 'Automatic', label: 'Automatic', description: 'Smooth city & mountain cruise', icon: <Gauge className="w-3.5 h-3.5" /> },
  { value: 'Manual', label: 'Manual', description: 'Standard stick-shift gearbox', icon: <Gauge className="w-3.5 h-3.5" /> },
];

const FUEL_OPTIONS: CustomSelectOption[] = [
  { value: 'Diesel', label: 'Diesel', description: 'Economical high-torque fuel', icon: <Fuel className="w-3.5 h-3.5" /> },
  { value: 'Petrol', label: 'Petrol', description: 'Standard refined unleaded', icon: <Fuel className="w-3.5 h-3.5" /> },
  { value: 'Hybrid', label: 'Hybrid', description: 'Eco-friendly electric/petrol hybrid', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { value: 'Electric', label: 'Electric (EV)', description: 'Zero-emission electric vehicle', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

const initialFormData: VehicleFormData = {
  name: '',
  category: 'van',
  license_plate: '',
  passenger_capacity: 6,
  luggage_capacity: 4,
  passengers_text: '',
  luggage_text: '',
  recommended_for: '',
  display_order: 0,
  transmission: 'Automatic',
  fuel_type: 'Diesel',
  features: ['Dual AC', 'High-Speed Wi-Fi', 'USB Charging Ports', 'English Speaking Chauffeur'],
  description: '',
  cover_image: '',
  gallery_images: [],
  price_per_day_usd: 0,
  price_per_day_lkr: 0,
  price_per_km_usd: 0,
  price_per_km_lkr: 0,
  is_active: true,
};

const PRESET_FEATURES = [
  'Dual AC',
  'High-Speed Wi-Fi',
  'USB Charging Ports',
  'Reclining Seats',
  'Cool Box / Refrigerator',
  'English Speaking Chauffeur',
  'Luggage Trailer Available',
  'Microphone / PA System',
  'Mineral Water & Wet Wipes',
  'First Aid & Sanitizer',
];

export default function CreateVehiclePage() {
  const router = useRouter();
  const { exchangeRate, isFallback: isRateFallback } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // Upload states
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadStage, setCoverUploadStage] = useState<'optimizing' | 'uploading' | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadStage, setGalleryUploadStage] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleFieldChange = (field: keyof VehicleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle Feature Chip
  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      };
    });
  };

  const addCustomFeature = () => {
    const trimmed = customFeatureInput.trim();
    if (trimmed && !formData.features.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
      setCustomFeatureInput('');
    }
  };

  // Cover Image Upload with WebP Compression
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setCoverUploadStage('optimizing');
    setCoverError(null);

    try {
      const { file: optimizedFile } = await compressImage(file, 1920, 0.82);

      setCoverUploadStage('uploading');
      const supabase = createClient();
      const filename = `cover_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

      const { error } = await supabase.storage
        .from('vehicle-images')
        .upload(filename, optimizedFile, { contentType: 'image/webp', upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filename);

      handleFieldChange('cover_image', publicUrlData.publicUrl);
    } catch (err: any) {
      console.error('Failed to upload cover:', err);
      setCoverError(err.message || 'Failed to upload vehicle image.');
    } finally {
      setIsUploadingCover(false);
      setCoverUploadStage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Gallery Upload with WebP Compression
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    setGalleryError(null);
    const uploadedUrls: string[] = [];

    try {
      const supabase = createClient();
      for (let i = 0; i < files.length; i++) {
        setGalleryUploadStage(`Processing ${i + 1} of ${files.length}...`);
        const file = files[i];
        const { file: optimizedFile } = await compressImage(file, 1920, 0.82);

        const filename = `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
        const { error } = await supabase.storage
          .from('vehicle-images')
          .upload(filename, optimizedFile, { contentType: 'image/webp', upsert: false });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(filename);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setFormData((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, ...uploadedUrls],
      }));
    } catch (err: any) {
      console.error('Failed to upload gallery:', err);
      setGalleryError(err.message || 'Failed to upload vehicle gallery images.');
    } finally {
      setIsUploadingGallery(false);
      setGalleryUploadStage(null);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!formData.name.trim()) {
      setErrorBanner('Vehicle name/model is required.');
      return;
    }

    if (!formData.price_per_day_usd || formData.price_per_day_usd <= 0) {
      setErrorBanner('Daily Rental Rate in USD is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const insertPayload: VehicleInsert = {
        name: formData.name.trim(),
        category: formData.category,
        license_plate: formData.license_plate.trim() || null,
        passenger_capacity: Number(formData.passenger_capacity) || 4,
        luggage_capacity: Number(formData.luggage_capacity) || 3,
        passengers_text: formData.passengers_text.trim() || null,
        luggage_text: formData.luggage_text.trim() || null,
        recommended_for: formData.recommended_for.trim() || null,
        display_order: Number(formData.display_order) || 0,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        features: formData.features,
        description: formData.description.trim() || null,
        cover_image: formData.cover_image || null,
        gallery_images: formData.gallery_images,
        price_per_day_usd: Number(formData.price_per_day_usd) || 0,
        price_per_day_lkr: Number(formData.price_per_day_lkr) || 0,
        price_per_km_usd: Number(formData.price_per_km_usd) || 0,
        price_per_km_lkr: Number(formData.price_per_km_lkr) || 0,
        is_active: formData.is_active,
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      router.push('/admin/vehicles');
      router.refresh();
    } catch (err: any) {
      console.error('Failed to create vehicle:', err);
      setErrorBanner(err.message || 'Failed to create vehicle record. Please ensure the migration SQL was run.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/vehicles"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Car className="w-5 h-5 text-[#FF6B00]" />
              <span>Register New Fleet Vehicle</span>
            </h1>
            <p className="text-xs text-slate-500">
              Add private vans, luxury sedans, mini buses, or coaches with rate cards and features
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/vehicles"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Save Vehicle</span>
          </button>
        </div>
      </div>

      {errorBanner && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorBanner}</div>
        </div>
      )}

      {/* Main Grid: Inputs (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#FF6B00]" />
              <span>Vehicle Identification & Category</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Vehicle Model Name *
                  </label>
                  <AIContentHelper
                    topic={formData.name}
                    location={formData.name}
                    moduleType="vehicle"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="e.g. Toyota HiAce Super GL Luxury"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  options={CATEGORY_OPTIONS}
                  value={formData.category}
                  onChange={(val) => handleFieldChange('category', val)}
                  placeholder="Select category..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  License Plate Number
                </label>
                <input
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => handleFieldChange('license_plate', e.target.value)}
                  placeholder="e.g. WP NB-4421 (Internal dispatch)"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recommended For Subtitle
                </label>
                <input
                  type="text"
                  value={formData.recommended_for}
                  onChange={(e) => handleFieldChange('recommended_for', e.target.value)}
                  placeholder="e.g. Couples, solo travelers & executive business trips"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Displayed as the subtitle on the homepage vehicle card
                </span>
              </div>
            </div>
          </div>

          {/* Capacities & Mechanical Specs */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF6B00]" />
              <span>Capacities & Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Passenger Seats
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.passenger_capacity}
                  onChange={(e) => handleFieldChange('passenger_capacity', Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Luggage Capacity (Bags)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.luggage_capacity}
                  onChange={(e) => handleFieldChange('luggage_capacity', Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Passenger Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.passengers_text}
                  onChange={(e) => handleFieldChange('passengers_text', e.target.value)}
                  placeholder="e.g. 1 - 3 Passengers"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Luggage Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.luggage_text}
                  onChange={(e) => handleFieldChange('luggage_text', e.target.value)}
                  placeholder="e.g. 2 Large + 2 Carry-on Bags"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Transmission
                </label>
                <CustomSelect
                  options={TRANSMISSION_OPTIONS}
                  value={formData.transmission}
                  onChange={(val) => handleFieldChange('transmission', val)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Fuel Type
                </label>
                <CustomSelect
                  options={FUEL_OPTIONS}
                  value={formData.fuel_type}
                  onChange={(val) => handleFieldChange('fuel_type', val)}
                />
              </div>
            </div>
          </div>

          {/* Rate Card (Dual USD & LKR Pricing) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#FF6B00]" />
                  <span>Rental Rate Card (USD & LKR)</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  USD is the master billing anchor currency. Quoting local LKR rates is optional and provides transparency for cash-on-arrival settlements.
                </p>
              </div>

              {/* Live Conversion Helper Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200/80 text-[11px] text-orange-950 font-semibold self-start sm:self-auto shadow-2xs">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isRateFallback ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>1 USD ≈ {exchangeRate.toFixed(2)} LKR</span>
                </span>
                {formData.price_per_day_usd > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const calculatedLkr = Math.round(formData.price_per_day_usd * exchangeRate);
                      handleFieldChange('price_per_day_lkr', calculatedLkr);
                      if (formData.price_per_km_usd > 0) {
                        handleFieldChange('price_per_km_lkr', Math.round(formData.price_per_km_usd * exchangeRate));
                      }
                    }}
                    className="text-[10px] font-bold text-[#FF6B00] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-orange-200 shadow-2xs transition-all active:scale-95"
                    title={`Calculate LKR using cached real-time exchange rate: 1 USD = ${exchangeRate.toFixed(2)} LKR`}
                  >
                    ⚡ Auto-fill LKR
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Daily Rate USD (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Daily Rental Rate (USD / Day) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.price_per_day_usd || ''}
                    onChange={(e) => handleFieldChange('price_per_day_usd', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 60"
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Daily Rate LKR (Optional + Trust Tooltip) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Daily Rental Rate (LKR / Day)</span>
                    <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <TrustTooltip
                    title="Daily Hire in LKR"
                    message="Providing rates in Sri Lankan Rupees (LKR) guarantees transparency for local clients and chauffeurs, preventing currency exchange disputes on arrival."
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.price_per_day_lkr || ''}
                    onChange={(e) => handleFieldChange('price_per_day_lkr', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 18600"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Excess Distance USD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Excess Distance Rate (USD / KM) <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.05"
                    value={formData.price_per_km_usd || ''}
                    onChange={(e) => handleFieldChange('price_per_km_usd', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 0.30"
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Excess Distance LKR */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Excess Distance Rate (LKR / KM)</span>
                    <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <TrustTooltip
                    title="Per-Kilometer Overage"
                    message="Clear per-km rates in local currency avoid post-tour calculation conflicts when travelers exceed their included itinerary distance."
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={formData.price_per_km_lkr || ''}
                    onChange={(e) => handleFieldChange('price_per_km_lkr', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 95"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features Multi-Select Chips */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>Amenities, Comfort & Equipment</span>
            </h2>
            <p className="text-xs text-slate-500">
              Toggle onboard amenities and guest conveniences included with this vehicle:
            </p>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {PRESET_FEATURES.map((feat) => {
                const isSelected = formData.features.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 text-[#FF6B00] border border-orange-300 shadow-2xs font-bold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 text-[#FF6B00]" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{feat}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Feature Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
                placeholder="Add custom amenity (e.g. Leather Recliners)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                onClick={addCustomFeature}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF6B00]" />
              <span>Overview & Description</span>
            </h2>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe vehicle comfort, condition, best suited routes (e.g. Hill country curves, coastal highway)..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            />
          </div>

          {/* Media Uploads: Cover & Gallery */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Images className="w-4 h-4 text-[#FF6B00]" />
              <span>Vehicle Photos & Gallery</span>
            </h2>

            {/* Cover Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Cover Image (WebP auto-compression)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-[#FF6B00] rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-orange-50/20"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                {formData.cover_image ? (
                  <div className="space-y-2">
                    <div className="relative w-40 h-24 mx-auto rounded-xl overflow-hidden border border-slate-200">
                      <Image src={formData.cover_image} alt="Cover" fill className="object-cover" />
                    </div>
                    <p className="text-xs text-[#FF6B00] font-bold">Click to replace photo</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {isUploadingCover ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#FF6B00] animate-spin" />
                        <span className="text-xs text-slate-600 font-medium">
                          {coverUploadStage === 'optimizing' ? 'Compressing to WebP...' : 'Uploading...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">Upload vehicle photo</p>
                        <p className="text-[11px] text-slate-400">JPG, PNG, or WebP up to 10MB</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              {coverError && <p className="text-xs text-rose-600 mt-1">{coverError}</p>}
            </div>

            {/* Gallery Dropzone */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Gallery Photos ({formData.gallery_images.length})
                </label>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
                >
                  + Add Photos
                </button>
              </div>

              <input
                type="file"
                multiple
                ref={galleryInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleGalleryUpload}
                className="hidden"
              />

              {formData.gallery_images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-2">
                  {formData.gallery_images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-full h-20 rounded-xl overflow-hidden border border-slate-200 group"
                    >
                      <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isUploadingGallery && (
                <div className="p-3 bg-orange-50 rounded-xl text-xs text-[#FF6B00] font-bold flex items-center gap-2 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{galleryUploadStage}</span>
                </div>
              )}
              {galleryError && <p className="text-xs text-rose-600 mt-1">{galleryError}</p>}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Live Card Preview & Status */}
        <div className="space-y-6">
          {/* Active Status Switch */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Fleet Availability
            </h3>
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Available for Tours</span>
                <span className="text-[11px] text-slate-500">Enable in dispatch roster</span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                className="w-4 h-4 accent-[#FF6B00] rounded cursor-pointer"
              />
            </label>

            {/* Display Order */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Homepage Display Order
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.display_order}
                onChange={(e) => handleFieldChange('display_order', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Rank 1, 2, 3... controls order on the landing page
              </span>
            </div>
          </div>

          {/* Live Card Preview */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Live Fleet Preview
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <div className="relative w-full h-36 bg-slate-100">
                {formData.cover_image ? (
                  <Image src={formData.cover_image} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Car className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-900">
                  {formData.category.toUpperCase()}
                </span>
              </div>

              <div className="p-3.5 space-y-2">
                <div className="font-bold text-sm text-slate-900">
                  {formData.name || 'Vehicle Model Name'}
                </div>
                {formData.license_plate && (
                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {formData.license_plate}
                  </span>
                )}

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>{formData.passenger_capacity} Seats</span>
                  <span>&bull;</span>
                  <span>{formData.luggage_capacity} Bags</span>
                  <span>&bull;</span>
                  <span>{formData.transmission}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-0.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 text-[11px]">Daily Rate:</span>
                    <span className="font-black text-slate-900">
                      ${Number(formData.price_per_day_usd || 0).toFixed(2)} USD
                    </span>
                  </div>
                  {Number(formData.price_per_day_lkr) > 0 && (
                    <div className="text-right text-[11px] font-mono text-slate-500">
                      Rs. {Number(formData.price_per_day_lkr).toLocaleString()} LKR
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-between">
        <Link
          href="/admin/vehicles"
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Publish Fleet Vehicle</span>
        </button>
      </div>
    </form>
  );
}
