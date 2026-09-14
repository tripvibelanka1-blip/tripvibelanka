'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  Eye,
  Images,
} from 'lucide-react';
import { Activity } from '@/types/database';
import { createClient } from '@/utils/supabase/client';

interface ActivitiesTableProps {
  initialActivities: Activity[];
  destinations: { id: string; name: string }[];
}

export default function ActivitiesTable({
  initialActivities,
  destinations,
}: ActivitiesTableProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');

  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Map destination ID to name for fast lookup
  const destinationMap = new Map<string, string>();
  if (destinations) {
    destinations.forEach((d) => destinationMap.set(d.id, d.name));
  }

  // Handle activity deletion from Supabase
  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      // Optimistically remove from state
      setActivities((prev) => prev.filter((a) => a.id !== activityToDelete.id));
      setFeedbackToast({
        type: 'success',
        message: `"${activityToDelete.title}" activity has been deleted.`,
      });
      setActivityToDelete(null);

      // Auto-hide toast
      setTimeout(() => {
        setFeedbackToast(null);
      }, 4000);
    } catch (err: unknown) {
      console.error('[Delete Activity Error]:', err);
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete activity record.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    // Status filter
    if (statusFilter === 'active' && !activity.is_active) return false;
    if (statusFilter === 'inactive' && activity.is_active) return false;

    // Destination filter
    if (destinationFilter !== 'all' && activity.destination_id !== destinationFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const destName = activity.destination_id
        ? destinationMap.get(activity.destination_id)?.toLowerCase() || ''
        : '';
      const matchTitle = activity.title.toLowerCase().includes(q);
      const matchDesc = activity.description?.toLowerCase().includes(q) || false;
      const matchDest = destName.includes(q);
      const matchCat = activity.category?.toLowerCase().includes(q) || false;
      const matchLoc = activity.location?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchDest && !matchCat && !matchLoc) return false;
    }

    return true;
  });

  const activeCount = activities.filter((a) => a.is_active).length;
  const inactiveCount = activities.length - activeCount;

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

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities or regions..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Destination Dropdown Filter */}
          {destinations.length > 0 && (
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            >
              <option value="all">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({activities.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white text-orange-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Table or Empty State */}
      {filteredActivities.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3.5 pl-6 pr-3">
                    Cover
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Activity & Experience
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Destination
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Duration
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Price (USD)
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
                {filteredActivities.map((act) => {
                  const destName = act.destination_id
                    ? destinationMap.get(act.destination_id)
                    : null;
                  const priceNum = Number(act.price) || 0;
                  const isFreeOrEnquire = priceNum <= 0;

                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-orange-50/20 transition-colors group"
                    >
                      {/* Cover Image Thumbnail */}
                      <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 relative shadow-2xs">
                          {act.cover_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={act.cover_image}
                              alt={act.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Ticket className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Description Excerpt */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100/80 text-orange-950 border border-orange-200/80">
                            {act.category || 'Wildlife & Nature'}
                          </span>
                          {act.display_order !== null && act.display_order !== undefined && act.display_order > 0 && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Order #{act.display_order}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 text-sm max-w-sm sm:max-w-md line-clamp-1 group-hover:text-orange-950 transition-colors">
                          {act.title}
                        </div>
                        {act.description ? (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-sm">
                            {act.description}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic mt-0.5">
                            No description provided
                          </div>
                        )}
                        {act.gallery_images && act.gallery_images.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-1">
                            <Images className="w-3 h-3" />
                            <span>{act.gallery_images.length} photos</span>
                          </div>
                        )}
                      </td>

                      {/* Destination & Specific Location */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {act.location ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-lg">
                              <MapPin className="w-3 h-3 text-[#FF6B00]" />
                              {act.location}
                            </span>
                            {destName && (
                              <div className="text-[10px] text-slate-500 pl-1 font-medium">
                                Region: {destName}
                              </div>
                            )}
                          </div>
                        ) : destName ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-lg">
                            <MapPin className="w-3 h-3 text-[#FF6B00]" />
                            {destName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{act.duration || 'Flexible'}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isFreeOrEnquire ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Free / Enquire
                          </span>
                        ) : (
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">
                              ${priceNum.toFixed(2)}{' '}
                              <span className="text-[10px] font-bold text-slate-400">USD</span>
                            </div>
                            {act.price_lkr && Number(act.price_lkr) > 0 ? (
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                Rs. {Number(act.price_lkr).toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic">LKR on request</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {act.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-950 border border-orange-200/80 shadow-2xs">
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
                            onClick={() => setPreviewActivity(act)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Quick Preview"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden lg:inline">Preview</span>
                          </button>

                          {/* Edit Button */}
                          <Link
                            href={`/admin/activities/${act.id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-[#FF6B00] bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-lg transition-all"
                            title="Edit Activity"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setActivityToDelete(act);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Activity"
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
              Showing <strong className="text-slate-900">{filteredActivities.length}</strong> of{' '}
              <strong className="text-slate-900">{activities.length}</strong> activity experience{activities.length === 1 ? '' : 's'}
            </span>
            <Link
              href="/admin/activities/create"
              className="font-bold text-[#FF6B00] hover:text-orange-700 transition-colors"
            >
              + Create Another Activity
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-sm">
            <Ticket className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {searchQuery || statusFilter !== 'all' || destinationFilter !== 'all'
              ? 'No Matching Activities'
              : 'No Activities & Experiences Found'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            {searchQuery || statusFilter !== 'all' || destinationFilter !== 'all'
              ? 'Try changing your search keywords or resetting filters to view all experiences.'
              : 'Add modular micro-products like wildlife safaris, scenic hikes, surf lessons, or culinary workshops to drive ancillary revenue.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {(searchQuery || statusFilter !== 'all' || destinationFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDestinationFilter('all');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <Link
              href="/admin/activities/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <span>+ Add New Activity</span>
            </Link>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Delete &quot;{activityToDelete.title}&quot;?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete this activity? This will remove all image references and pricing configurations. This action cannot be undone.
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
                  setActivityToDelete(null);
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
                    <span>Deleting Activity...</span>
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
      {previewActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Activity Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewActivity(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewActivity.cover_image && (
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewActivity.cover_image}
                  alt={previewActivity.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-black text-slate-900">
                  {previewActivity.title}
                </h4>
                <div className="text-right">
                  <span className="font-black text-[#FF6B00] text-base block">
                    {Number(previewActivity.price) > 0
                      ? `$${Number(previewActivity.price).toFixed(2)} USD`
                      : 'Free / Enquire'}
                  </span>
                  {previewActivity.price_lkr && Number(previewActivity.price_lkr) > 0 && (
                    <span className="text-xs text-slate-500 font-mono block">
                      Rs. {Number(previewActivity.price_lkr).toLocaleString()} LKR
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {previewActivity.destination_id && destinationMap.get(previewActivity.destination_id) && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3 h-3 text-[#FF6B00]" />
                    {destinationMap.get(previewActivity.destination_id)}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {previewActivity.duration || 'Flexible'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-950 border border-orange-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                  {previewActivity.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>

            {previewActivity.description && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {previewActivity.description}
              </p>
            )}

            {previewActivity.gallery_images && previewActivity.gallery_images.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700">
                  Gallery Showcase ({previewActivity.gallery_images.length} photos)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {previewActivity.gallery_images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Gallery mini" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewActivity(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/admin/activities/${previewActivity.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Activity</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
