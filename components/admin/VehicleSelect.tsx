'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Vehicle } from '@/types/database';
import { ChevronDown, Check, X, Search, Sparkles, Car } from 'lucide-react';
import Image from 'next/image';

interface VehicleSelectProps {
  vehicles: Vehicle[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export default function VehicleSelect({
  vehicles,
  value,
  onChange,
  disabled = false,
  isLoading = false,
  placeholder = '-- Select a Vehicle (Optional) --',
}: VehicleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opened if more than 4 items
      if (vehicles.length > 4 && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, vehicles.length]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredVehicles = vehicles.filter((v) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(query) ||
      (v.description && v.description.toLowerCase().includes(query))
    );
  });

  const handleSelect = (vehicleId: string) => {
    onChange(vehicleId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const renderVehicleImage = (vehicle: Vehicle, size: 'small' | 'large' = 'small') => {
    const imageUrl = vehicle.cover_image || (vehicle.gallery_images && vehicle.gallery_images.length > 0 ? vehicle.gallery_images[0] : null);
    
    if (imageUrl) {
      return (
        <div className={`rounded-lg overflow-hidden flex-shrink-0 relative bg-slate-100 ${size === 'small' ? 'w-7 h-7' : 'w-10 h-10'}`}>
          <img src={imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    return (
      <div
        className={`rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          size === 'small' ? 'w-7 h-7' : 'w-10 h-10'
        } ${
          selectedVehicle?.id === vehicle.id
            ? 'bg-orange-50 text-[#FF6B00] border border-orange-200/80'
            : 'bg-slate-200/60 text-slate-400'
        }`}
      >
        <Car className={size === 'small' ? "w-3.5 h-3.5" : "w-5 h-5"} />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full px-3.5 py-2.5 text-sm rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer
          ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200' : ''}
          ${
            isOpen
              ? 'bg-white border-[#FF6B00] ring-2 ring-orange-500/25 shadow-xs'
              : 'bg-slate-50 border-slate-300 hover:border-slate-400 hover:bg-white'
          }
        `}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedVehicle ? (
            renderVehicleImage(selectedVehicle, 'small')
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors bg-slate-200/60 text-slate-400">
              <Car className="w-3.5 h-3.5" />
            </div>
          )}

          {selectedVehicle ? (
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                {selectedVehicle.name} <span className="font-normal text-slate-500 text-[11px]">({selectedVehicle.passenger_capacity} pax)</span>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-xs sm:text-sm truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selectedVehicle && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange('');
                }
              }}
              title="Clear selection"
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}

          <div className="text-slate-400 pl-0.5">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#FF6B00]' : ''
              }`}
            />
          </div>
        </div>
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-2 space-y-1.5 animate-in fade-in zoom-in-98 duration-150 max-h-80 flex flex-col">
          {/* Optional Search bar if more than 4 items */}
          {vehicles.length > 4 && (
            <div className="p-1 pb-2 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vehicle..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Options Scroll List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-0.5 max-h-60">
            {/* None / Optional option */}
            <div
              onClick={() => handleSelect('')}
              className={`
                px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors
                ${!value ? 'bg-orange-50 text-orange-950 font-bold border border-orange-200/60' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">—</span>
                <span>No Vehicle (Unspecified)</span>
              </div>
              {!value && <Check className="w-3.5 h-3.5 text-[#FF6B00]" />}
            </div>

            {/* List of Real Vehicles */}
            {filteredVehicles.map((vehicle) => {
              const isSelected = vehicle.id === value;
              return (
                <div
                  key={vehicle.id}
                  onClick={() => handleSelect(vehicle.id)}
                  className={`
                    px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 cursor-pointer transition-all
                    ${
                      isSelected
                        ? 'bg-orange-50/90 text-orange-950 border border-orange-200 shadow-2xs font-semibold'
                        : 'hover:bg-orange-50/40 text-slate-700 hover:text-slate-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {renderVehicleImage(vehicle, 'large')}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {vehicle.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 flex gap-2">
                         <span>{vehicle.passenger_capacity} Passengers</span>
                         <span className="text-slate-300">•</span>
                         <span className="capitalize">{vehicle.category}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              );
            })}

            {filteredVehicles.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                No vehicles match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* Clean footer hint */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>{vehicles.length} vehicles available</span>
            </span>
            <span>Press ESC to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
