'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Calendar,
  MapPin,
  Sparkles,
  ExternalLink,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Tour } from '@/types/database';
import { createClient } from '@/utils/supabase/client';

interface ToursTableProps {
  initialTours: Tour[];
  destinations: { id: string; name: string }[];
}

export default function ToursTable({
  initialTours,
  destinations,
}: ToursTableProps) {
  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Map destination ID to name for quick lookup
  const destinationMap = new Map<string, string>();
  if (destinations) {
    destinations.forEach((d) => destinationMap.set(d.id, d.name));
  }

  // Handle tour deletion from Supabase
  const handleDeleteConfirm = async () => {
    if (!tourToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', tourToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      // Optimistically remove from state
      setTours((prev) => prev.filter((t) => t.id !== tourToDelete.id));
      setFeedbackToast({
        type: 'success',
        message: `"${tourToDelete.title}" has been removed.`,
      });
      setTourToDelete(null);

      // Auto-hide toast
      setTimeout(() => {
        setFeedbackToast(null);
      }, 4000);
    } catch (err: unknown) {
      console.error('[Delete Tour Error]:', err);
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete tour package.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800">
              {feedbackToast.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Table or Empty State */}
      {tours.length > 0 ? (
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
                {tours.map((tour) => {
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
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-lg">
                              <MapPin className="w-3 h-3 text-[#FF6B00]" />
                              {destinationName}
                            </span>
                          )}
                          {tour.is_featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              Featured
                            </span>
                          )}
                          {tour.gallery_images &&
                            Array.isArray(tour.gallery_images) &&
                            tour.gallery_images.length > 0 && (
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
                          $
                          {Number(tour.price_usd).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          <span className="text-[10px] font-bold text-slate-400">
                            USD
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Rs. {Number(tour.price_lkr).toLocaleString('en-US')}
                        </div>
                      </td>

                      {/* Active Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {tour.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-950 border border-orange-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit, Preview, Delete */}
                      <td className="py-4 pr-6 pl-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <Link
                            href={`/admin/tours/${tour.id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-[#FF6B00] bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-lg transition-all"
                            title="Edit Tour Package"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </Link>

                          {/* Preview Button */}
                          <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Preview Tour"
                          >
                            <span>Preview</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setTourToDelete(tour);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Tour Package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              Showing <strong className="text-slate-900">{tours.length}</strong>{' '}
              tour package{tours.length === 1 ? '' : 's'}
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
          <h2 className="text-base font-bold text-slate-900">
            No Tour Packages Found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            All tours have been removed or none have been created yet. Create a new luxury tour package for your catalog.
          </p>
          <Link
            href="/admin/tours/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <span>+ Add Tour Package</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tourToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Tour Package?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <strong className="text-slate-800 font-semibold">
                    &ldquo;{tourToDelete.title}&rdquo;
                  </strong>
                  ? This action will permanently remove this itinerary from your database and live website.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {deleteError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setTourToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Tour</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
