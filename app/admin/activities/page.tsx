import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Plus, AlertCircle, Ticket } from 'lucide-react';
import ActivitiesTable from '@/components/admin/ActivitiesTable';

export const dynamic = 'force-dynamic';

export default async function AdminActivitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Parallel fetch: Activities and Destinations
  const [activitiesRes, destinationsRes] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('destinations')
      .select('id, name')
      .order('name', { ascending: true }),
  ]);

  const activities = activitiesRes.data || [];
  const destinations = destinationsRes.data || [];
  const error = activitiesRes.error;

  return (
    <div className="space-y-6">
      {/* Top Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-[#FF6B00]" />
            <span>Activities & Experiences</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage modular travel micro-products, wildlife safaris, scenic hikes, and cultural excursions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/activities/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Activity</span>
          </Link>
        </div>
      </div>

      {/* Database Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Error Loading Activities: </span>
            {error.message}
            <div className="mt-1 text-rose-700">
              Please check if the &quot;activities&quot; table has been created in your Supabase SQL Editor.
            </div>
          </div>
        </div>
      )}

      {/* Interactive Activities Table */}
      <ActivitiesTable
        initialActivities={activities}
        destinations={destinations}
      />

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs font-bold text-slate-800">
            Expand Your Ancillary Experiences
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Offer your travelers tailored day-trips, wildlife excursions, and unique Sri Lankan adventures.
          </p>
        </div>
        <Link
          href="/admin/activities/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Activity</span>
        </Link>
      </div>
    </div>
  );
}
