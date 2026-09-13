import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Compass, Plus, Sparkles, Filter } from 'lucide-react';
import { Tour } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminToursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Attempt to load existing tours from Supabase
  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tour Packages</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, update, and manage published Sri Lanka travel experiences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter</span>
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Tour</span>
          </button>
        </div>
      </div>

      {/* Database status banner */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <span className="font-bold">Database Notice: </span>
          {error.message}
          <div className="mt-1 text-amber-700">
            Run the provided SQL snippet in your Supabase SQL Editor if the <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">tours</code> table has not yet been executed.
          </div>
        </div>
      )}

      {/* Tours List or Empty State */}
      {tours && tours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tours.map((tour: Tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-200 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                  {tour.title}
                </h3>
                {tour.is_featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex-shrink-0">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                {tour.description || 'No description provided'}
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">
                  {tour.duration_days}D / {tour.duration_nights}N
                </span>
                <span className="text-emerald-700 font-bold">
                  ${tour.price_usd} USD
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Tours Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Once you execute the SQL table migration and add tours, they will be listed and managed here in real-time.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            public.tours schema connected
          </div>
        </div>
      )}
    </div>
  );
}
