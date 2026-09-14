'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Sparkles,
  ExternalLink,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  Compass,
  Ticket,
  Eye,
  Images,
} from 'lucide-react';
import { Destination } from '@/types/database';
import { createClient } from '@/utils/supabase/client';

interface DestinationsTableProps {
  initialDestinations: Destination[];
  linkedTours?: { id: string; destination_id: string | null }[];
  linkedActivities?: { id: string; destination_id: string | null }[];
}

export default function DestinationsTable({
  initialDestinations,
  linkedTours = [],
  linkedActivities = [],
}: DestinationsTableProps) {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [destToDelete, setDestToDelete] = useState<Destination | null>(null);
  const [previewDest, setPreviewDest] = useState<Destination | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Handle destination deletion from Supabase
  const handleDeleteConfirm = async () => {
    if (!destToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      // Optimistically remove from state
      setDestinations((prev) => prev.filter((d) => d.id !== destToDelete.id));
      setFeedbackToast({
        type: 'success',
        message: `"${destToDelete.name}" destination has been removed.`,
      });
      setDestToDelete(null);

      // Auto-hide toast
      setTimeout(() => {
        setFeedbackToast(null);
      }, 4000);
    } catch (err: unknown) {
      console.error('[Delete Destination Error]:', err);
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete destination.'
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
      {destinations.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3.5 pl-6 pr-3">
                    Cover
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Destination
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Popular Attractions
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Linked Products
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
                {destinations.map((dest) => {
                  const attractions = dest.popular_attractions || [];
                  const gallery = dest.gallery_images || [];
                  const toursCount = linkedTours.filter((t) => t.destination_id === dest.id).length;
                  const activitiesCount = linkedActivities.filter((a) => a.destination_id === dest.id).length;

                  return (
                    <tr
                      key={dest.id}
                      className="hover:bg-orange-50/20 transition-colors group"
                    >
                      {/* Cover Image Thumbnail */}
                      <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 relative shadow-2xs">
                          {dest.cover_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={dest.cover_image}
                              alt={dest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <MapPin className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Overview */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm max-w-sm sm:max-w-md line-clamp-1 group-hover:text-orange-950 transition-colors">
                            {dest.name}
                          </span>
                          {dest.display_order !== undefined && dest.display_order !== null && dest.display_order > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200" title={`Homepage Display Priority: #${dest.display_order}`}>
                              #{dest.display_order}
                            </span>
                          )}
                        </div>
                        {(dest.district || dest.tag) && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {dest.district && (
                              <span className="text-[11px] font-medium text-amber-600 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {dest.district}
                              </span>
                            )}
                            {dest.district && dest.tag && (
                              <span className="text-slate-300 text-[10px]">•</span>
                            )}
                            {dest.tag && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {dest.tag}
                              </span>
                            )}
                          </div>
                        )}
                        {dest.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-sm">
                            {dest.description}
                          </div>
                        )}
                        {gallery.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-1">
                            <Images className="w-3 h-3" />
                            <span>{gallery.length} gallery photos</span>
                          </div>
                        )}
                      </td>

                      {/* Popular Attractions */}
                      <td className="py-4 px-4">
                        {attractions.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-lg">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>{attractions.length} attraction{attractions.length === 1 ? '' : 's'}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                              {attractions.slice(0, 2).join(', ')}
                              {attractions.length > 2 ? '...' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            None listed
                          </span>
                        )}
                      </td>

                      {/* Linked Products (Tours & Activities) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                              toursCount > 0
                                ? 'bg-orange-50 text-orange-900 border-orange-200/70'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                            title={`${toursCount} Tours linked to ${dest.name}`}
                          >
                            <Compass className="w-3 h-3 text-[#FF6B00]" />
                            <span>{toursCount} Tour{toursCount === 1 ? '' : 's'}</span>
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                              activitiesCount > 0
                                ? 'bg-amber-50 text-amber-900 border-amber-200/70'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                            title={`${activitiesCount} Activities linked to ${dest.name}`}
                          >
                            <Ticket className="w-3 h-3 text-amber-600" />
                            <span>{activitiesCount} Act{activitiesCount === 1 ? '' : 's'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Active Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {dest.is_active !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-950 border border-orange-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Hidden
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit, Preview, Delete */}
                      <td className="py-4 pr-6 pl-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewDest(dest)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Quick Preview"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden lg:inline">Preview</span>
                          </button>

                          {/* Edit Button */}
                          <Link
                            href={`/admin/destinations/${dest.id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-[#FF6B00] bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-lg transition-all"
                            title="Edit Destination"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDestToDelete(dest);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Destination"
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
              Showing <strong className="text-slate-900">{destinations.length}</strong>{' '}
              destination{destinations.length === 1 ? '' : 's'}
            </span>
            <Link
              href="/admin/destinations/create"
              className="font-bold text-[#FF6B00] hover:text-orange-700 transition-colors"
            >
              + Create Another Destination
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-sm">
            <MapPin className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            No Destinations Found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            Create Sri Lankan travel regions (e.g. Ella, Kandy, Yala, Sigiriya) to categorize your tour packages.
          </p>
          <Link
            href="/admin/destinations/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <span>+ Add Destination</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {destToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Delete &quot;{destToDelete.name}&quot;?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete this destination? Tour packages and activities linked to this destination will have their destination unlinked (set to null). This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDestToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Destination...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Destination Overview
                </h3>
              </div>
              <button
                onClick={() => setPreviewDest(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewDest.cover_image && (
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewDest.cover_image}
                  alt={previewDest.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-black text-slate-900">
                  {previewDest.name}
                </h4>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-950 border border-orange-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                  {previewDest.is_active !== false ? 'Active' : 'Hidden'}
                </span>
              </div>

              {previewDest.description && (
                <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {previewDest.description}
                </p>
              )}
            </div>

            {/* Attractions */}
            {previewDest.popular_attractions && previewDest.popular_attractions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Popular Landmarks ({previewDest.popular_attractions.length})</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewDest.popular_attractions.map((att, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {att}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Relational Linked Products */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center flex-shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {linkedTours.filter((t) => t.destination_id === previewDest.id).length} Tours
                  </div>
                  <div className="text-[10px] text-slate-500">Linked packages</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {linkedActivities.filter((a) => a.destination_id === previewDest.id).length} Activities
                  </div>
                  <div className="text-[10px] text-slate-500">Linked experiences</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/admin/destinations/${previewDest.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Destination</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
