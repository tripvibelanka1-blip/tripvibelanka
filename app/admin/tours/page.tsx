import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  Compass,
  Plus,
  Sparkles,
  AlertCircle,
  Calendar,
  MapPin,
  ExternalLink,
  Layers,
} from 'lucide-react';
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

  // Fetch all tours ordered by creation date
  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch destinations for map lookup (safe against missing foreign key relations)
  const { data: destinations } = await supabase
    .from('destinations')
    .select('id, name');

  const destinationMap = new Map<string, string>();
  if (destinations) {
    destinations.forEach((d: { id: string; name: string }) => {
      destinationMap.set(d.id, d.name);
    });
  }

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
            <span className="font-bold">Database Query Error: </span>
            {error.message}
            <div className="mt-1 text-rose-700">
              Please ensure the <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">tours</code> table is created in your Supabase SQL Editor.
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {tours && tours.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3.5 pl-6 pr-3">
                    Cover
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Tour Package
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Duration
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Price (USD / LKR)
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Status
                  </th>
                  <th scope="col" className="py-3.5 pr-6 pl-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tours.map((tour: Tour) => {
                  const destinationName =
                    tour.destination_id && destinationMap.get(tour.destination_id);

                  return (
                    <tr
                      key={tour.id}
                      className="hover:bg-orange-50/20 transition-colors group"
                    >
                      {/* Cover Image Thumbnail */}
                      <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 relative shadow-2xs">
                          {tour.cover_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={tour.cover_image}
                              alt={tour.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Compass className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Destination */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm max-w-sm sm:max-w-md line-clamp-1 group-hover:text-orange-950 transition-colors">
                          {tour.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {destinationName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-lg">
                              <MapPin className="w-3 h-3 text-sky-600" />
                              {destinationName}
                            </span>
                          )}
                          {tour.is_featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              Featured
                            </span>
                          )}
                          {tour.gallery_images && Array.isArray(tour.gallery_images) && tour.gallery_images.length > 0 && (
                            <span className="text-[10px] font-medium text-slate-500">
                              {tour.gallery_images.length} photos
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {tour.duration_days}D / {tour.duration_nights}N
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {tour.itinerary ? tour.itinerary.length : 0} Day Schedule
                        </div>
                      </td>

                      {/* Price (USD / LKR) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 text-sm">
                          ${Number(tour.price_usd).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} <span className="text-[10px] font-bold text-slate-400">USD</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Rs. {Number(tour.price_lkr).toLocaleString('en-US')}
                        </div>
                      </td>

                      {/* Active Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {tour.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 whitespace-nowrap text-right">
                        <Link
                          href="/"
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#FF6B00] transition-colors"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{tours.length}</strong> tour package{tours.length === 1 ? '' : 's'}
            </span>
            <Link
              href="/admin/tours/create"
              className="font-bold text-[#FF6B00] hover:text-orange-700 transition-colors"
            >
              + Create Another Tour
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-sm">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Tour Packages Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            Get started by creating your first Sri Lanka luxury tour package with highlights, dual-currency pricing, and gallery photos.
          </p>
          <Link
            href="/admin/tours/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Tour</span>
          </Link>
        </div>
      )}
    </div>
  );
}
