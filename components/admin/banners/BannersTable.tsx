'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Tag,
  Copy,
  Check,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  ExternalLink,
  Eye,
  X,
  Loader2,
} from 'lucide-react';
import { Banner } from '@/types/database';
import { toggleBannerStatus, deleteBanner } from '@/app/admin/banners/actions';
import BannerCardPreview from '@/components/admin/banners/BannerCardPreview';

interface BannersTableProps {
  initialBanners: Banner[];
}

export default function BannersTable({ initialBanners }: BannersTableProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Transition for non-blocking toggles
  const [isPending, startTransition] = useTransition();

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Delete Modal
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Preview Modal
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);

  // Filter logic
  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.badge_text && b.badge_text.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.coupon_code && b.coupon_code.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? b.is_active
        : !b.is_active;

    return matchesSearch && matchesStatus;
  });

  // Handle Instant Status Toggle
  const handleToggleStatus = (banner: Banner) => {
    const nextStatus = !banner.is_active;

    // Optimistic local update
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, is_active: nextStatus } : b))
    );

    startTransition(async () => {
      const res = await toggleBannerStatus(banner.id, banner.is_active);
      if (res.error) {
        // Rollback
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, is_active: banner.is_active } : b))
        );
        setFeedbackToast({
          type: 'error',
          message: `Failed to update status: ${res.error}`,
        });
        setTimeout(() => setFeedbackToast(null), 4000);
      } else {
        setFeedbackToast({
          type: 'success',
          message: `Banner "${banner.title}" is now ${nextStatus ? 'active' : 'paused'}.`,
        });
        setTimeout(() => setFeedbackToast(null), 3000);
      }
    });
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteBanner(bannerToDelete.id);
      if (res.error) throw new Error(res.error);

      setBanners((prev) => prev.filter((b) => b.id !== bannerToDelete.id));
      setBannerToDelete(null);
      setFeedbackToast({
        type: 'success',
        message: `Promotion "${bannerToDelete.title}" deleted successfully.`,
      });
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to delete promotional banner.',
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy Coupon Code
  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to determine date window status
  const getScheduleBadge = (banner: Banner) => {
    const today = new Date().toISOString().split('T')[0];

    if (!banner.is_active) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          ● Paused
        </span>
      );
    }

    if (banner.start_date && banner.start_date > today) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          ⏳ Scheduled
        </span>
      );
    }

    if (banner.end_date && banner.end_date < today) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          ✕ Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Now</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            feedbackToast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-200" />
          )}
          <span>{feedbackToast.message}</span>
          <button
            onClick={() => setFeedbackToast(null)}
            className="p-1 hover:opacity-75 cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Filter & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, badge, or coupon code..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Create Action Button */}
        <Link
          href="/admin/banners/create"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-sm shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Promotion</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Promotion & Badge</th>
                <th className="px-4 py-3.5">Coupon</th>
                <th className="px-4 py-3.5">Schedule & Validity</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No promotional banners found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery ? 'Try adjusting your search query' : 'Create your first seasonal offer card'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title & Badge */}
                    <td className="px-5 py-4 min-w-[240px]">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200/70 text-[#FF6B00] text-[10px] font-bold">
                          <Tag className="w-3 h-3" />
                          <span>{banner.badge_text}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {banner.title}
                        </div>
                        {banner.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {banner.description}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Coupon & Discount */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {banner.coupon_code ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 shadow-2xs">
                            <span>{banner.coupon_code}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(banner.id, banner.coupon_code!)}
                              className="p-1 hover:bg-slate-200/60 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Copy Code"
                            >
                              {copiedId === banner.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div>
                            <span className="inline-flex items-center text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {banner.discount_type === 'percentage'
                                ? `${banner.discount_value ?? 15}% OFF`
                                : `$${banner.discount_value ?? 50} OFF`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No code</span>
                      )}
                    </td>

                    {/* Schedule & Validity */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div>{getScheduleBadge(banner)}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {banner.start_date || 'Anytime'}
                            {banner.end_date ? ` → ${banner.end_date}` : ' (No expiry)'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={banner.is_active}
                          onChange={() => handleToggleStatus(banner)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                      </label>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Live Card Preview Trigger */}
                        <button
                          type="button"
                          onClick={() => setPreviewBanner(banner)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Preview Card Modal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <Link
                          href={`/admin/banners/${banner.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors"
                          title="Edit Promotion"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setBannerToDelete(banner)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Promotion"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span>Card Preview: {previewBanner.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <BannerCardPreview
              badge_text={previewBanner.badge_text}
              title={previewBanner.title}
              description={previewBanner.description || undefined}
              discount_type={previewBanner.discount_type}
              discount_value={previewBanner.discount_value}
              coupon_code={previewBanner.coupon_code || undefined}
              button_text={previewBanner.button_text}
              button_link={previewBanner.button_link}
              validity_text={previewBanner.validity_text || undefined}
              start_date={previewBanner.start_date || undefined}
              end_date={previewBanner.end_date || undefined}
              is_active={previewBanner.is_active}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Promotion</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to remove &quot;{bannerToDelete.title}&quot;?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              This action will permanently delete this promotional card from the database. It will immediately cease displaying on the public website.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setBannerToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete Promotion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
