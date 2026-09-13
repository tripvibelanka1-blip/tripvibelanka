'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Tag,
  FileText,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Clock,
  Ticket,
} from 'lucide-react';
import { Banner, BannerInsert } from '@/types/database';
import { upsertBanner } from '@/app/admin/banners/actions';
import BannerCardPreview from '@/components/admin/banners/BannerCardPreview';

interface BannerFormProps {
  initialData?: Banner;
  isEdit?: boolean;
}

const ROUTE_PRESETS = [
  { label: 'All Tour Packages', value: '/#tours' },
  { label: 'Destinations Guide', value: '/#destinations' },
  { label: 'Experiences & Safari', value: '/#experiences' },
  { label: 'Vehicle Fleet', value: '/#fleet' },
  { label: 'Open Booking Modal', value: '#booking' },
];

export default function BannerForm({ initialData, isEdit = false }: BannerFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<BannerInsert>({
    badge_text: initialData?.badge_text || 'Limited Seasonal Offer',
    title: initialData?.title || '',
    description: initialData?.description || '',
    discount_type: initialData?.discount_type || 'percentage',
    discount_value: initialData?.discount_value ?? 15,
    coupon_code: initialData?.coupon_code || '',
    button_text: initialData?.button_text || 'Claim Seasonal Offer',
    button_link: initialData?.button_link || '/#tours',
    validity_text: initialData?.validity_text || 'Valid for bookings made this month',
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || '',
    is_active: initialData?.is_active ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleFieldChange = (field: keyof BannerInsert, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!formData.title.trim()) {
      setErrorBanner('Please enter a promotion title.');
      return;
    }
    if (!formData.button_text.trim()) {
      setErrorBanner('Please enter a button label.');
      return;
    }
    if (!formData.button_link.trim()) {
      setErrorBanner('Please specify a target link for the CTA button.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BannerInsert & { id?: string } = {
        ...formData,
        id: initialData?.id,
      };

      const res = await upsertBanner(payload);
      if (res.error) {
        throw new Error(res.error);
      }

      router.push('/admin/banners');
      router.refresh();
    } catch (err: any) {
      console.error('Failed to save banner:', err);
      setErrorBanner(err.message || 'An unexpected error occurred while saving the banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/banners"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B00]" />
              <span>{isEdit ? 'Edit Promotional Banner' : 'Create Promotional Banner'}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-7">
            Configure high-converting seasonal offer cards with coupon codes and date scheduling.
          </p>
        </div>

        {/* Top Save & Cancel Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/banners"
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Update Banner' : 'Publish Banner'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorBanner && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Save Error</span>
            <span>{errorBanner}</span>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Fields (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Offer Headline & Copy */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FF6B00]" />
              <span>Offer Headline & Copy</span>
            </h2>

            {/* Badge Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pill Badge Text <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.badge_text || ''}
                onChange={(e) => handleFieldChange('badge_text', e.target.value)}
                placeholder="e.g. Limited Seasonal Offer"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Displays inside the top outlined orange pill tag.
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Promotion Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Exclusive Summer Escape: 15% Off Private Tours"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all font-semibold text-slate-900"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supporting Description
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Highlight inclusions, discount highlights, or luxury tour benefits..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
              />
            </div>
          </div>

          {/* Section 2: Action & Coupon Offer */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#FF6B00]" />
              <span>Coupon Code & Action Link</span>
            </h2>

            {/* Discount Configuration & Coupon Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Coupon Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coupon Code <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.coupon_code || ''}
                  onChange={(e) => handleFieldChange('coupon_code', e.target.value.toUpperCase())}
                  placeholder="e.g. VIBELANKA15"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Promo code travelers apply in checkout.
                </p>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('discount_type', 'percentage')}
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      formData.discount_type === 'percentage'
                        ? 'bg-white text-[#FF6B00] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Percent (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('discount_type', 'fixed')}
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      formData.discount_type === 'fixed'
                        ? 'bg-white text-[#FF6B00] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Fixed ($)
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Percentage off subtotal or fixed USD amount.
                </p>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(USD $)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={formData.discount_type === 'percentage' ? 100 : 10000}
                    value={formData.discount_value ?? 15}
                    onChange={(e) => handleFieldChange('discount_value', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    {formData.discount_type === 'percentage' ? '%' : 'USD'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formData.discount_type === 'percentage'
                    ? `Deducts ${formData.discount_value || 0}% from the subtotal`
                    : `Deducts $${formData.discount_value || 0} USD from the subtotal`}
                </p>
              </div>
            </div>

            {/* Button Text & Target Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Button Text <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.button_text}
                  onChange={(e) => handleFieldChange('button_text', e.target.value)}
                  placeholder="e.g. Claim Seasonal Offer"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                />
              </div>

            {/* Target Route */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Button Target Link / Route <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.button_link}
                  onChange={(e) => handleFieldChange('button_link', e.target.value)}
                  placeholder="e.g. /#tours"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] font-mono transition-all"
                />
              </div>

              {/* Quick Route Presets */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[10px] text-slate-400 self-center mr-1">Quick presets:</span>
                {ROUTE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleFieldChange('button_link', preset.value)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      formData.button_link === preset.value
                        ? 'bg-orange-50 text-[#FF6B00] border-orange-200 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Defines where visitors are redirected when clicking the banner&apos;s call-to-action button (e.g. scroll to tour packages, safari experiences, or trigger the booking modal).
              </p>
            </div>
          </div>
        </div>

          {/* Section 3: Scheduling & Validity Note */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF6B00]" />
              <span>Schedule & Validity Window</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => handleFieldChange('start_date', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all font-mono"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Date <span className="text-[10px] font-normal text-slate-400">(Optional auto-expiry)</span>
                </label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => handleFieldChange('end_date', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all font-mono"
                />
              </div>
            </div>

            {/* Validity Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Validity Footnote Text
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.validity_text || ''}
                  onChange={(e) => handleFieldChange('validity_text', e.target.value)}
                  placeholder="e.g. Valid for bookings made this month"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Shown next to the clock icon in the promotional card.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Preview (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Active Status Switch Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Promotion Status
            </h3>
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Active on Public Site</span>
                <span className="text-[11px] text-slate-500">
                  {formData.is_active
                    ? 'Eligible to display in homepage promo banner section'
                    : 'Paused: Will not be shown to visitors'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                className="w-4 h-4 accent-[#FF6B00] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Live Card Preview */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <BannerCardPreview
              badge_text={formData.badge_text}
              title={formData.title}
              description={formData.description || undefined}
              discount_type={formData.discount_type}
              discount_value={formData.discount_value}
              coupon_code={formData.coupon_code || undefined}
              button_text={formData.button_text}
              button_link={formData.button_link}
              validity_text={formData.validity_text || undefined}
              start_date={formData.start_date || undefined}
              end_date={formData.end_date || undefined}
              is_active={formData.is_active}
            />
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-between">
        <Link
          href="/admin/banners"
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Promotion...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{isEdit ? 'Update Promotion' : 'Publish Promotional Banner'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
