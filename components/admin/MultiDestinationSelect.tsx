'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DestinationRecord } from '@/types/database';
import { MapPin, ChevronDown, Check, X, Search, Sparkles } from 'lucide-react';

interface MultiDestinationSelectProps {
  destinations: DestinationRecord[];
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export default function MultiDestinationSelect({
  destinations,
  values = [],
  onChange,
  disabled = false,
  isLoading = false,
  placeholder = '-- Select Destinations --',
}: MultiDestinationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedDestinations = destinations.filter((d) => values.includes(d.id));

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
      if (destinations.length > 4 && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, destinations.length]);

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

  const filteredDestinations = destinations.filter((dest) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      dest.name.toLowerCase().includes(query) ||
      (dest.description && dest.description.toLowerCase().includes(query))
    );
  });

  const handleSelect = (destId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (values.includes(destId)) {
      onChange(values.filter((id) => id !== destId));
    } else {
      onChange([...values, destId]);
    }
  };

  const handleRemove = (destId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((id) => id !== destId));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled && !isLoading) setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`
          w-full min-h-[46px] p-2 text-sm rounded-xl border text-left transition-all flex flex-wrap items-center gap-2 cursor-pointer
          ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200' : ''}
          ${
            isOpen
              ? 'bg-white border-[#FF6B00] ring-2 ring-orange-500/25 shadow-xs'
              : 'bg-slate-50 border-slate-300 hover:border-slate-400 hover:bg-white'
          }
        `}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
          {selectedDestinations.length > 0 ? (
            selectedDestinations.map((dest) => (
              <span
                key={dest.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF6B00] border border-orange-200/80 text-xs font-bold"
              >
                <MapPin className="w-3 h-3" />
                {dest.name}
                <button
                  type="button"
                  onClick={(e) => handleRemove(dest.id, e)}
                  className="p-0.5 rounded-full hover:bg-orange-200 hover:text-orange-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-sm px-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 self-start mt-1">
          {selectedDestinations.length > 0 && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange([]);
                }
              }}
              title="Clear all"
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
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
      </div>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-2 space-y-1.5 animate-in fade-in zoom-in-98 duration-150 max-h-80 flex flex-col">
          {/* Optional Search bar if more than 4 items */}
          {destinations.length > 4 && (
            <div className="p-1 pb-2 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destination..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Options Scroll List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-0.5 max-h-60">
            {/* List of Real Destinations */}
            {filteredDestinations.map((dest) => {
              const isSelected = values.includes(dest.id);
              return (
                <div
                  key={dest.id}
                  onClick={(e) => handleSelect(dest.id, e)}
                  className={`
                    px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 cursor-pointer transition-all
                    ${
                      isSelected
                        ? 'bg-orange-50/90 text-orange-950 border border-orange-200 shadow-2xs font-semibold'
                        : 'hover:bg-orange-50/40 text-slate-700 hover:text-slate-900'
                    }
                  `}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#FF6B00] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {dest.name}
                      </div>
                      {dest.description && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {dest.description}
                        </div>
                      )}
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

            {filteredDestinations.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                No destinations match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* Clean footer hint */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>{destinations.length} destinations available</span>
            </span>
            <span>Click to toggle</span>
          </div>
        </div>
      )}
    </div>
  );
}
