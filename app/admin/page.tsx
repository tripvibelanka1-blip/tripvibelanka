import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import {
  Sparkles,
  Compass,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  Plus,
  ArrowRight,
  Database,
  ExternalLink,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Real-time server queries for live dashboard metrics
  const [
    { count: totalTours },
    { count: activeTours },
    { count: featuredTours },
    { count: totalDestinations },
  ] = await Promise.all([
    supabase.from('tours').select('*', { count: 'exact', head: true }),
    supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('destinations').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="space-y-6">
      {/* Session Notification Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/60 text-[#FF6B00] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              TripVibe Lanka Management Console
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Signed in as <span className="font-semibold text-slate-700">{user.email}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Supabase SSR
          </span>
        </div>
      </div>

      {/* Hero Welcome Card with TripVibe Sunset Ambient Glow */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white rounded-3xl shadow-xl shadow-slate-950/10 relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold backdrop-blur-sm mb-3 border border-orange-500/30">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Sri Lanka Tour Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Welcome to your Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            Create travel itineraries, manage dual-currency pricing (USD & LKR), upload auto-compressed WebP tour photos, and publish curated experiences in real time.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/tours/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Tour Package</span>
            </Link>
            <Link
              href="/admin/tours"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors backdrop-blur-sm border border-white/10 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>View All Tours ({totalTours ?? 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute -right-8 -bottom-8 text-orange-500/10 pointer-events-none">
          <Compass className="w-64 h-64" />
        </div>
      </div>

      {/* Real Live Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tours */}
        <Link
          href="/admin/tours"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-orange-300 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Packages
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalTours ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Configured in Supabase</span>
            <span className="text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform">Manage →</span>
          </p>
        </Link>

        {/* Card 2: Active Published Tours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Published Live
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {activeTours ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Visible on tripvibelanka.com
          </p>
        </div>

        {/* Card 3: Featured Highlights */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Curated Featured
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {featuredTours ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Homepage hero recommendations
          </p>
        </div>

        {/* Card 4: Destinations & Storage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Destinations
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-700">
            {totalDestinations ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Colombo, Kandy, Ella, Yala...
          </p>
        </div>
      </div>

      {/* Quick Launch & Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Tour Package Fast Creator */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tour Package Manager
              </h3>
              <p className="text-xs text-slate-500">
                Create or revise itineraries, pricing tables, and itineraries
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/admin/tours/create"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Tour</span>
            </Link>
            <Link
              href="/admin/tours"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              <span>Manage List</span>
            </Link>
          </div>
        </div>

        {/* Card: Media & Storage Bucket Status */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Media Storage Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Connected to <code className="font-mono text-slate-700 font-bold">tour-images</code> public bucket
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Image Compression:</span>
              <span className="font-bold text-emerald-700">Active (85%+ WebP savings)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Public CDN Read:</span>
              <span className="font-bold text-sky-700">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
