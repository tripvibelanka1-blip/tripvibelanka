'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Users,
  Briefcase,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Fuel,
  Sparkles,
  ArrowUpRight,
  BadgeCheck,
} from 'lucide-react';
import { Currency } from '@/types/tourism';
import { useCurrency } from '@/context/CurrencyContext';

export interface FleetVehicleDetail {
  id: string;
  name: string;
  category: string;
  license_plate?: string;
  passenger_capacity?: number;
  luggage_capacity?: number;
  passengers_text?: string;
  luggage_text?: string;
  transmission?: string;
  fuel_type?: string;
  features?: string[];
  description?: string;
  cover_image?: string;
  gallery_images?: string[];
  price_per_day_usd?: number;
  price_per_day_lkr?: number;
  price_per_km_usd?: number;
  price_per_km_lkr?: number;
  recommended_for?: string;
}

interface VehicleDetailDrawerProps {
  vehicle: FleetVehicleDetail | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onReserve: (vehicleId: string) => void;
}

export default function VehicleDetailDrawer({
  vehicle,
  isOpen,
  onClose,
  currency,
  onReserve,
}: VehicleDetailDrawerProps) {
  const { exchangeRate } = useCurrency();

  if (!isOpen || !vehicle) return null;

  const priceUsd = Number(vehicle.price_per_day_usd) || 0;
  const priceLkr =
    Number(vehicle.price_per_day_lkr) || Math.round(priceUsd * (exchangeRate || 310));

  const kmUsd = Number(vehicle.price_per_km_usd) || 0;
  const kmLkr =
    Number(vehicle.price_per_km_lkr) || (kmUsd > 0 ? Math.round(kmUsd * (exchangeRate || 310)) : 0);

  const formatDailyPrice = () => {
    if (currency === 'USD') return `$${priceUsd}`;
    return `Rs. ${priceLkr.toLocaleString()}`;
  };

  const formatKmPrice = () => {
    if (currency === 'USD') return `$${kmUsd.toFixed(2)}`;
    return `Rs. ${kmLkr.toLocaleString()}`;
  };

  const passText =
    vehicle.passengers_text?.trim() ||
    (vehicle.passenger_capacity ? `${vehicle.passenger_capacity} Passengers` : '3 Passengers');

  const lugText =
    vehicle.luggage_text?.trim() ||
    (vehicle.luggage_capacity ? `${vehicle.luggage_capacity} Luggage Bags` : '2 Bags');

  const features =
    Array.isArray(vehicle.features) && vehicle.features.length > 0
      ? vehicle.features
      : [
          'Dual-Zone Climate Control A/C',
          'High-Speed Onboard 4G Wi-Fi',
          'USB Fast-Charging Ports',
          'Licensed English Speaking Chauffeur',
        ];

  const standardInclusions = [
    'Government certified English speaking chauffeur guide',
    'Comprehensive passenger commercial travel insurance',
    'Chilled bottled mineral water and refreshing wet tissues',
    'High speed onboard 4G Wi-Fi hotspot throughout trip',
    'Fuel allowance and highway expressway tolls included',
    'Airport meet and greet with personalized name board',
  ];

  const whatsappMessage = encodeURIComponent(
    `Hello TripVibe Lanka! I am interested in hiring the ${vehicle.name} with private chauffeur for my Sri Lanka tour. Could you provide a quote and availability?`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#FAF9F6] shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header Bar */}
          <div className="sticky top-0 z-10 bg-[#FAF9F6]/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                {vehicle.category ? vehicle.category.toUpperCase() : 'EXECUTIVE FLEET'}
              </span>
              {vehicle.license_plate && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-stone-200 text-stone-700">
                  {vehicle.license_plate}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              aria-label="Close vehicle details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Vehicle Hero Image */}
            <div className="relative h-72 w-full rounded-2xl overflow-hidden bg-stone-200 shadow-md border border-stone-200">
              {vehicle.cover_image ? (
                <Image
                  src={vehicle.cover_image}
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  No vehicle image available
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl sm:text-3xl font-bold font-heading">{vehicle.name}</h2>
                {vehicle.recommended_for && (
                  <p className="text-xs sm:text-sm text-stone-200 mt-1">
                    {vehicle.recommended_for}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col items-center text-center">
                <Users className="w-5 h-5 text-[#FF6B00] mb-1" />
                <span className="text-[11px] text-stone-400 font-medium">Capacity</span>
                <span className="text-xs font-bold text-stone-900 mt-0.5">{passText}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col items-center text-center">
                <Briefcase className="w-5 h-5 text-stone-600 mb-1" />
                <span className="text-[11px] text-stone-400 font-medium">Luggage</span>
                <span className="text-xs font-bold text-stone-900 mt-0.5">{lugText}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col items-center text-center">
                <Sparkles className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-[11px] text-stone-400 font-medium">Transmission</span>
                <span className="text-xs font-bold text-stone-900 mt-0.5">
                  {vehicle.transmission || 'Automatic'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col items-center text-center">
                <Fuel className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[11px] text-stone-400 font-medium">Fuel</span>
                <span className="text-xs font-bold text-stone-900 mt-0.5">
                  {vehicle.fuel_type || 'Diesel'}
                </span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                  Chauffeured Daily Rate
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-extrabold text-stone-900 font-heading">
                    {formatDailyPrice()}
                  </span>
                  <span className="text-xs font-medium text-stone-500">/ day</span>
                </div>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Includes driver allowance, vehicle insurance, and fuel
                </span>
              </div>

              {kmUsd > 0 && (
                <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-stone-100 sm:pl-5 pt-3 sm:pt-0">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                    Per Km Extra Rate
                  </span>
                  <div className="flex sm:justify-end items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-stone-800 font-heading">
                      {formatKmPrice()}
                    </span>
                    <span className="text-xs font-medium text-stone-500">/ km</span>
                  </div>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    For journeys exceeding daily mileage limits
                  </span>
                </div>
              )}
            </div>

            {/* Vehicle Description */}
            {vehicle.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-heading">
                  Vehicle Overview
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed bg-white p-4 rounded-xl border border-stone-200">
                  {vehicle.description}
                </p>
              </div>
            )}

            {/* Comfort Features */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-heading">
                Interior Amenities & Comfort
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                    <span className="text-xs font-medium text-stone-700">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Standard Inclusions */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-heading flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>What Comes Included With Every Hire</span>
              </h3>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                {standardInclusions.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700">
                    <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct WhatsApp Concierge Help */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-900 block">
                  Have Custom Route Questions?
                </span>
                <span className="text-xs text-stone-600 block">
                  Our transport desk responds within minutes on WhatsApp.
                </span>
              </div>
              <a
                href={`https://wa.me/94770857319?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Chat Desk</span>
              </a>
            </div>
          </div>

          {/* Footer Action Sticky Bar */}
          <div className="sticky bottom-0 bg-[#FAF9F6]/95 backdrop-blur-md px-6 py-4 border-t border-stone-200 flex items-center gap-3">
            <Link
              href={`/booking?vehicle=${vehicle.id}`}
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Book This Vehicle in Journey</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/booking?vehicle=${vehicle.id}`}
              onClick={onClose}
              className="px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer text-center"
            >
              Quick Reserve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
