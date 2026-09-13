'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  id?: string;
  showDescriptionInTrigger?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
  icon,
  id,
  showDescriptionInTrigger = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on outside click
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
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const activeIcon = selectedOption?.icon || icon;

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full px-3.5 py-2.5 text-xs rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none
          ${
            disabled
              ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
              : isOpen
              ? 'bg-white border-[#FF6B00] ring-2 ring-orange-500/20 shadow-xs text-slate-900'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-800'
          }
          ${className}
        `}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {activeIcon && (
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedOption
                  ? 'bg-orange-50 text-[#FF6B00] border border-orange-200/80'
                  : 'bg-slate-200/60 text-slate-400'
              }`}
            >
              {activeIcon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            {selectedOption ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-900 truncate">
                  {selectedOption.label}
                </span>
                {selectedOption.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100 text-[#FF6B00] shrink-0">
                    {selectedOption.badge}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400 truncate">{placeholder}</span>
            )}

            {showDescriptionInTrigger && selectedOption?.description && (
              <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                {selectedOption.description}
              </div>
            )}
          </div>
        </div>

        <div className="text-slate-400 pl-1 shrink-0">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#FF6B00]' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 p-1.5 space-y-1 animate-in fade-in zoom-in-98 duration-150 max-h-72 overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2.5 cursor-pointer transition-all
                  ${
                    isSelected
                      ? 'bg-orange-50/90 text-orange-950 font-bold border border-orange-200/80 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {option.icon && (
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#FF6B00] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {option.icon}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={isSelected ? 'text-orange-950' : 'text-slate-800'}>
                        {option.label}
                      </span>
                      {option.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100/70 text-[#FF6B00]">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    {option.description && (
                      <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {option.description}
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
        </div>
      )}
    </div>
  );
}
