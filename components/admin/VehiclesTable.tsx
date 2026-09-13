'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Users,
  Briefcase,
  Fuel,
  Gauge,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Vehicle } from '@/types/database';
import { createClient } from '@/utils/supabase/client';

interface VehiclesTableProps {
  initialVehicles: Vehicle[];
}

export default function VehiclesTable({ initialVehicles }: VehiclesTableProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewVehicle, setPreviewVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: vehicles.length,
      van: vehicles.filter((v) => v.category?.toLowerCase() === 'van').length,
      sedan: vehicles.filter((v) => v.category?.toLowerCase() === 'sedan').length,
      mini_bus: vehicles.filter((v) => v.category?.toLowerCase() === 'mini_bus').length,
      luxury: vehicles.filter((v) => v.category?.toLowerCase() === 'luxury').length,
      bus: vehicles.filter((v) => v.category?.toLowerCase() === 'bus').length,
    };
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Category Filter
      if (categoryFilter !== 'all') {
        if (v.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.name?.toLowerCase().includes(q);
        const matchesPlate = v.license_plate?.toLowerCase().includes(q);
        const matchesCategory = v.category?.toLowerCase().includes(q);
        const matchesDesc = v.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesPlate && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [vehicles, categoryFilter, searchQuery]);

  // Toggle Active Status
  const handleToggleActive = async (vehicle: Vehicle) => {
    setUpdatingStatusId(vehicle.id);
    const updatedStatus = !vehicle.is_active;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('vehicles')
        .update({ is_active: updatedStatus, updated_at: new Date().toISOString() })
        .eq('id', vehicle.id);

      if (error) throw error;

      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, is_active: updatedStatus } : v))
      );
      setFeedbackToast({
        type: 'success',
        message: `${vehicle.name} is now ${updatedStatus ? 'Active' : 'Inactive'}.`,
      });
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to update vehicle status.',
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete Vehicle
  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleToDelete.id);

      if (error) throw error;

      setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
      setFeedbackToast({
        type: 'success',
        message: `"${vehicleToDelete.name}" has been removed from your fleet.`,
      });
      setVehicleToDelete(null);
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete vehicle:', err);
      setDeleteError(err.message || 'Failed to delete vehicle.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Category Badge Helper
  const renderCategoryBadge = (category: string) => {
    const cat = category?.toLowerCase();
    switch (cat) {
      case 'luxury':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/80 text-amber-900 border border-amber-300/70">
            Luxury VIP
          </span>
        );
      case 'van':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            Passenger Van
          </span>
        );
      case 'mini_bus':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Mini Bus
          </span>
        );
      case 'bus':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Large Coach
          </span>
        );
      case 'sedan':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Sedan Car
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm transition-all ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackToast.message}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model, license plate (e.g. WP NB-), category..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredVehicles.length}</strong> of{' '}
            <strong className="text-slate-900">{vehicles.length}</strong> fleet vehicles
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {[
            { id: 'all', label: 'All Fleet', count: categoryCounts.all },
            { id: 'van', label: 'Vans', count: categoryCounts.van },
            { id: 'sedan', label: 'Sedans', count: categoryCounts.sedan },
            { id: 'luxury', label: 'Luxury VIP', count: categoryCounts.luxury },
            { id: 'mini_bus', label: 'Mini Buses', count: categoryCounts.mini_bus },
            { id: 'bus', label: 'Coaches', count: categoryCounts.bus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-orange-50 text-[#FF6B00] border border-orange-200/80 shadow-2xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 text-[10px] opacity-75 font-mono">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Vehicle Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4">Rate Card (LKR)</th>
                <th className="py-3 px-4">Features</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredVehicles.map((vehicle) => {
                const featuresList = Array.isArray(vehicle.features) ? vehicle.features : [];

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Vehicle Thumbnail & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {vehicle.cover_image ? (
                            <Image
                              src={vehicle.cover_image}
                              alt={vehicle.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Car className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors">
                            {vehicle.name}
                          </div>
                          {vehicle.license_plate && (
                            <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              {vehicle.license_plate}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderCategoryBadge(vehicle.category)}
                    </td>

                    {/* Capacity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="inline-flex items-center gap-1 font-semibold" title="Passenger Seats">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vehicle.passenger_capacity} Seats</span>
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="inline-flex items-center gap-1 font-semibold" title="Luggage Bags">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vehicle.luggage_capacity} Bags</span>
                        </span>
                      </div>
                    </td>

                    {/* Specs: Transmission & Fuel */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-slate-400" />
                          <span>{vehicle.transmission || 'Automatic'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Fuel className="w-3 h-3 text-slate-400" />
                          <span>{vehicle.fuel_type || 'Diesel'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Rate Card */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ${Number(vehicle.price_per_day_usd || 0).toFixed(2)}{' '}
                        <span className="text-[10px] font-bold text-slate-400">USD / day</span>
                      </div>
                      {Number(vehicle.price_per_day_lkr) > 0 ? (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Rs. {Number(vehicle.price_per_day_lkr).toLocaleString()}{' '}
                          <span className="text-[10px] text-slate-400">/ day</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic">LKR on request</div>
                      )}
                      {(Number(vehicle.price_per_km_usd) > 0 || Number(vehicle.price_per_km_lkr) > 0) && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Extra:{' '}
                          {Number(vehicle.price_per_km_usd) > 0
                            ? `$${Number(vehicle.price_per_km_usd).toFixed(2)}`
                            : `Rs. ${Number(vehicle.price_per_km_lkr)}`}{' '}
                          / km
                        </div>
                      )}
                    </td>

                    {/* Features count */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {featuresList.length > 0 ? (
                        <button
                          onClick={() => setPreviewVehicle(vehicle)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#FF6B00] bg-slate-100 hover:bg-orange-50 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                          title="Click to view full features"
                        >
                          <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                          <span>{featuresList.length} Amenities</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Standard</span>
                      )}
                    </td>

                    {/* Active Status Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(vehicle)}
                        disabled={updatingStatusId === vehicle.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          vehicle.is_active
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {updatingStatusId === vehicle.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : vehicle.is_active ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        )}
                        <span>{vehicle.is_active ? 'Available' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewVehicle(vehicle)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Quick preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/vehicles/${vehicle.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors"
                          title="Edit vehicle"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setVehicleToDelete(vehicle)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No vehicles found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search query or category filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredVehicles.length} of {vehicles.length} fleet vehicles
        </span>
        <Link
          href="/admin/vehicles/create"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add New Vehicle</span>
        </Link>
      </div>

      {/* Quick Preview Modal */}
      {previewVehicle && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{previewVehicle.name}</h3>
                  {renderCategoryBadge(previewVehicle.category)}
                </div>
                {previewVehicle.license_plate && (
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {previewVehicle.license_plate}
                  </span>
                )}
              </div>
              <button
                onClick={() => setPreviewVehicle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cover Image */}
            {previewVehicle.cover_image && (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={previewVehicle.cover_image}
                  alt={previewVehicle.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Capacities & Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <div className="font-bold text-slate-900">{previewVehicle.passenger_capacity} Seats</div>
                <div className="text-[10px] text-slate-400">Passenger</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Briefcase className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <div className="font-bold text-slate-900">{previewVehicle.luggage_capacity} Bags</div>
                <div className="text-[10px] text-slate-400">Luggage</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Gauge className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <div className="font-bold text-slate-900">{previewVehicle.transmission}</div>
                <div className="text-[10px] text-slate-400">Gearbox</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Fuel className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <div className="font-bold text-slate-900">{previewVehicle.fuel_type}</div>
                <div className="text-[10px] text-slate-400">Fuel</div>
              </div>
            </div>

            {/* Rates */}
            <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/60 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Daily Rate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-extrabold text-slate-900 text-base">
                      ${Number(previewVehicle.price_per_day_usd || 0).toFixed(2)} USD
                    </span>
                    {Number(previewVehicle.price_per_day_lkr) > 0 && (
                      <span className="text-xs text-slate-600 font-mono">
                        (Rs. {Number(previewVehicle.price_per_day_lkr).toLocaleString()} LKR)
                      </span>
                    )}
                  </div>
                </div>

                {(Number(previewVehicle.price_per_km_usd) > 0 || Number(previewVehicle.price_per_km_lkr) > 0) && (
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Excess Distance</span>
                    <div className="font-bold text-slate-900">
                      {Number(previewVehicle.price_per_km_usd) > 0
                        ? `$${Number(previewVehicle.price_per_km_usd).toFixed(2)} / km`
                        : `Rs. ${Number(previewVehicle.price_per_km_lkr)} / km`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {Array.isArray(previewVehicle.features) && previewVehicle.features.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">Amenities & Comfort:</span>
                <div className="flex flex-wrap gap-1.5">
                  {previewVehicle.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
                    >
                      <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {previewVehicle.description && (
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                {previewVehicle.description}
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <Link
                href={`/admin/vehicles/${previewVehicle.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00]"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit This Vehicle</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Fleet Vehicle</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <strong className="text-slate-800">{vehicleToDelete.name}</strong> ({vehicleToDelete.license_plate || 'No Plate'}) from the active fleet?
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setVehicleToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Remove Vehicle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
