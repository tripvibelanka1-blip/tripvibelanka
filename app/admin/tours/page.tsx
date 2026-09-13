import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Plus, AlertCircle } from 'lucide-react';
import ToursTable from '@/components/admin/ToursTable';

export const dynamic = 'force-dynamic';

export default async function AdminToursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch all tours ordered by creation date
  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch destinations for map lookup
  const { data: destinations } = await supabase
    .from('destinations')
    .select('id, name');

  return (
    <div className="space-y-6">
      {/* Top Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tour Packages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your Sri Lanka tour itineraries, pricing, media galleries, and live website visibility
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tours/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Tour</span>
          </Link>
        </div>
      </div>

      {/* Database Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Error Loading Tours: </span>
            {error.message}
            <div className="mt-1 text-rose-700">
              Please refresh or check your internet connection.
            </div>
          </div>
        </div>
      )}

      {/* Interactive Tours Table with Edit & Delete */}
      <ToursTable
        initialTours={tours || []}
        destinations={destinations || []}
      />
    </div>
  );
}
