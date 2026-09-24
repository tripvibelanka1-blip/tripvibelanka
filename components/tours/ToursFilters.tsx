'use client';

import React from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';

export type DurationFilterKey = 'all' | '1-4' | '5-7' | '8-10' | '11+';
export type SortOptionKey = 'featured' | 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc';

interface ToursFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedDuration: DurationFilterKey;
  onSelectDuration: (dur: DurationFilterKey) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOptionKey;
  onSortChange: (sort: SortOptionKey) => void;
  totalResults: number;
  onResetFilters: () => void;
}

const DURATION_OPTIONS: { key: DurationFilterKey; label: string }[] = [
  { key: 'all', label: 'All Durations' },
  { key: '1-4', label: '1 to 4 Days (Short)' },
  { key: '5-7', label: '5 to 7 Days (Popular)' },
  { key: '8-10', label: '8 to 10 Days (Extended)' },
  { key: '11+', label: '11+ Days (Grand Circuit)' },
];

const SORT_OPTIONS: { key: SortOptionKey; label: string }[] = [
  { key: 'featured', label: 'Curated / Recommended' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'duration-asc', label: 'Duration: Short to Long' },
  { key: 'duration-desc', label: 'Duration: Long to Short' },
];

export default function ToursFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedDuration,
  onSelectDuration,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
  onResetFilters,
}: ToursFiltersProps) {
  const hasActiveFilters =
    selectedCategory !== 'All' || selectedDuration !== 'all' || searchQuery.trim().length > 0;

  return (
    <section className="w-full">
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4 sm:space-y-5">
        {/* Top Control Bar: Instant Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tours by destination (Sigiriya, Ella, Mirissa) or highlights..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Results Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs text-stone-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="text-stone-400 font-medium hidden md:inline">Sort:</span>
              <label htmlFor="tour-sort" className="sr-only">
                Sort tours by
              </label>
              <select
                id="tour-sort"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOptionKey)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer text-xs"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-3 py-2 sm:py-2.5 rounded-2xl bg-stone-100 text-stone-800 text-xs font-bold shrink-0">
              {totalResults} {totalResults === 1 ? 'Tour' : 'Tours'}
            </div>
          </div>
        </div>

        {/* Filter Rows Container */}
        <div className="space-y-3 pt-3 border-t border-stone-100">
          {/* Row 1: Tour Themes / Categories */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 min-w-[70px]">
              <Sparkles className="w-3.5 h-3.5 text-brand-text" />
              <span>Theme:</span>
            </div>

            <div className="overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1 flex-1">
              <div className="inline-flex items-center gap-1.5 min-w-max">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onSelectCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#FF6B00] text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Trip Duration */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 min-w-[70px]">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Duration:</span>
            </div>

            <div className="overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1 flex-1">
              <div className="inline-flex items-center gap-1.5 min-w-max">
                {DURATION_OPTIONS.map((dur) => {
                  const isSelected = selectedDuration === dur.key;
                  return (
                    <button
                      key={dur.key}
                      type="button"
                      onClick={() => onSelectDuration(dur.key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                      }`}
                    >
                      {dur.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Row (Only visible when filters are applied) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-400 font-medium">Active filters:</span>

              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-brand-text text-xs font-semibold">
                  <span>Theme: {selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory('All')}
                    className="hover:text-orange-950 cursor-pointer"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedDuration !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold">
                  <span>
                    Duration: {DURATION_OPTIONS.find((d) => d.key === selectedDuration)?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectDuration('all')}
                    className="hover:text-stone-950 cursor-pointer"
                    aria-label="Remove duration filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold">
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="hover:text-stone-950 cursor-pointer"
                    aria-label="Remove search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-text hover:text-[#e05e00] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
