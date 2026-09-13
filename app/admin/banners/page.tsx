import React from 'react';
import Link from 'next/link';
import { Tag, Sparkles, Plus, CheckCircle2, Clock, Megaphone } from 'lucide-react';
import { getAdminBanners } from '@/app/admin/banners/actions';
import BannersTable from '@/components/admin/banners/BannersTable';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const { data: banners, error } = await getAdminBanners();
  const bannerList = banners || [];

  const today = new Date().toISOString().split('T')[0];
  const activeCount = bannerList.filter(
    (b) =>
      b.is_active &&
      (!b.start_date || b.start_date <= today) &&
      (!b.end_date || b.end_date >= today)
  ).length;

  const scheduledCount = bannerList.filter(
    (b) => b.is_active && b.start_date && b.start_date > today
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#FF6B00]" />
            <span>Promotional Banners & Offers</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage high-converting seasonal offer cards, coupon codes, and scheduled discounts.
          </p>
        </div>

        <Link
          href="/admin/banners/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promotion</span>
        </Link>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Promotions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-200/60 shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Offers
            </span>
            <span className="text-xl font-black text-slate-900">{bannerList.length}</span>
          </div>
        </div>

        {/* Live Active */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Live on Site Now
            </span>
            <span className="text-xl font-black text-slate-900">{activeCount}</span>
          </div>
        </div>

        {/* Scheduled / Upcoming */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Scheduled Ahead
            </span>
            <span className="text-xl font-black text-slate-900">{scheduledCount}</span>
          </div>
        </div>
      </div>

      {/* Error Notice if fetch failed */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <span className="font-bold">Database Error: </span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Listing Table */}
      <BannersTable initialBanners={bannerList} />
    </div>
  );
}
