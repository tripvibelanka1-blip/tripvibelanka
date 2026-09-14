'use client';

import React, { useState, useMemo, useTransition } from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  Compass,
  Ticket,
  Car,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  MessageCircle,
  Mail,
  ChevronRight,
  Sparkles,
  Inbox,
  User,
  X,
  Phone,
} from 'lucide-react';
import { Enquiry, EnquiryStatus, EnquiryType } from '@/types/database';
import CustomSelect, { CustomSelectOption } from '@/components/admin/CustomSelect';
import { Layers, Footprints } from 'lucide-react';

const ENQUIRY_TYPE_OPTIONS: CustomSelectOption[] = [
  { value: 'all', label: 'All Categories', icon: <Layers className="w-3.5 h-3.5 text-slate-400" /> },
  { value: 'Tour', label: 'Tours', icon: <Compass className="w-3.5 h-3.5 text-amber-600" /> },
  { value: 'Activity', label: 'Activities & Safari', icon: <Footprints className="w-3.5 h-3.5 text-emerald-600" /> },
  { value: 'Vehicle', label: 'Vehicle Fleet', icon: <Car className="w-3.5 h-3.5 text-blue-600" /> },
  { value: 'General', label: 'General Inquiries', icon: <Mail className="w-3.5 h-3.5 text-purple-600" /> },
];
import EnquiryDrawer from '@/components/admin/enquiries/EnquiryDrawer';
import { updateEnquiryStatus, deleteEnquiry } from '@/app/admin/enquiries/actions';

interface EnquiriesListProps {
  initialEnquiries: Enquiry[];
}

export default function EnquiriesList({ initialEnquiries }: EnquiriesListProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [activeTab, setActiveTab] = useState<'all' | EnquiryStatus>('all');
  const [selectedType, setSelectedType] = useState<'all' | EnquiryType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected enquiry for slide-over drawer
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Dynamic status counts
  const counts = useMemo(() => {
    return {
      all: enquiries.length,
      unread: enquiries.filter((e) => e.status === 'unread').length,
      in_progress: enquiries.filter((e) => e.status === 'in_progress').length,
      resolved: enquiries.filter((e) => e.status === 'resolved').length,
    };
  }, [enquiries]);

  // Filtered list
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      // Status tab filter
      if (activeTab !== 'all' && enquiry.status !== activeTab) {
        return false;
      }

      // Type category filter
      if (selectedType !== 'all' && enquiry.enquiry_type !== selectedType) {
        return false;
      }

      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = enquiry.name.toLowerCase().includes(query);
        const matchesEmail = enquiry.email.toLowerCase().includes(query);
        const matchesPhone = enquiry.phone ? enquiry.phone.toLowerCase().includes(query) : false;
        const matchesRef = enquiry.reference_title
          ? enquiry.reference_title.toLowerCase().includes(query)
          : false;
        const matchesMessage = enquiry.message.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesPhone || matchesRef || matchesMessage;
      }

      return true;
    });
  }, [enquiries, activeTab, selectedType, searchQuery]);

  // Open Drawer Handler
  const handleOpenDrawer = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsDrawerOpen(true);
  };

  // Update enquiry in local state (from drawer interactions)
  const handleEnquiryUpdated = (updated: Enquiry) => {
    setEnquiries((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    if (selectedEnquiry?.id === updated.id) {
      setSelectedEnquiry(updated);
    }
  };

  // Delete enquiry in local state
  const handleEnquiryDeleted = (id: string) => {
    setEnquiries((prev) => prev.filter((item) => item.id !== id));
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry(null);
      setIsDrawerOpen(false);
    }
  };

  // Category Icon helper
  const getTypeBadge = (type: EnquiryType) => {
    switch (type) {
      case 'Tour':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            <Compass className="w-3 h-3 text-blue-500" />
            <span>Tour</span>
          </span>
        );
      case 'Activity':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            <Ticket className="w-3 h-3 text-purple-500" />
            <span>Activity</span>
          </span>
        );
      case 'Vehicle':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            <Car className="w-3 h-3 text-amber-600" />
            <span>Vehicle</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-[#FF6B00] border border-orange-200/70">
            <MessageSquare className="w-3 h-3 text-[#FF6B00]" />
            <span>General</span>
          </span>
        );
    }
  };

  // Status Pill helper
  const getStatusPill = (status: EnquiryStatus) => {
    switch (status) {
      case 'unread':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Unread</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>In Progress</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  // Time format helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {[
            { key: 'all' as const, label: 'All Enquiries', count: counts.all, highlight: false },
            {
              key: 'unread' as const,
              label: 'Unread',
              count: counts.unread,
              highlight: counts.unread > 0,
            },
            {
              key: 'in_progress' as const,
              label: 'In Progress',
              count: counts.in_progress,
              highlight: false,
            },
            {
              key: 'resolved' as const,
              label: 'Resolved',
              count: counts.resolved,
              highlight: false,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.key
                    ? tab.highlight
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-200 text-slate-800'
                    : tab.highlight
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Category Filter */}
        <div className="flex items-center gap-2">
          <CustomSelect
            size="sm"
            containerClassName="w-auto min-w-[160px]"
            align="right"
            options={ENQUIRY_TYPE_OPTIONS}
            value={selectedType}
            onChange={(val) => setSelectedType(val as EnquiryType | 'all')}
          />
        </div>
      </div>

      {/* Search & Meta Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, tour name, or message keywords..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">
          Showing <strong className="text-slate-800">{filteredEnquiries.length}</strong> of{' '}
          {enquiries.length}
        </span>
      </div>

      {/* Enquiries Inbox Table / Pipeline */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Lead / Sender</th>
                <th className="px-4 py-3.5">Target & Type</th>
                <th className="px-4 py-3.5">Message Preview</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Time</th>
                <th className="px-5 py-3.5 text-right">Quick Dispatch</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <Inbox className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No customer enquiries found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || activeTab !== 'all' || selectedType !== 'all'
                        ? 'Try adjusting your filters or search terms'
                        : 'New enquiries submitted from website pages will appear here'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => {
                  const isUnread = enquiry.status === 'unread';
                  const cleanPhone = enquiry.phone ? enquiry.phone.replace(/[^0-9]/g, '') : '';
                  const whatsAppUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hi ${enquiry.name}, regarding your enquiry to TripVibe Lanka: `
                      )}`
                    : null;

                  return (
                    <tr
                      key={enquiry.id}
                      onClick={() => handleOpenDrawer(enquiry)}
                      className={`group transition-colors cursor-pointer ${
                        isUnread
                          ? 'bg-amber-50/30 hover:bg-amber-100/40 font-medium'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Sender Details */}
                      <td className="px-5 py-4 whitespace-nowrap min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isUnread
                                ? 'bg-[#FF6B00] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                            }`}
                          >
                            {enquiry.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div
                              className={`text-xs sm:text-sm truncate ${
                                isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'
                              }`}
                            >
                              {enquiry.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <span>{enquiry.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Targeted Reference */}
                      <td className="px-4 py-4 whitespace-nowrap min-w-[170px]">
                        <div className="space-y-1">
                          <div>{getTypeBadge(enquiry.enquiry_type)}</div>
                          {enquiry.reference_title ? (
                            <div className="text-[11px] font-bold text-slate-800 line-clamp-1 max-w-[200px]">
                              {enquiry.reference_title}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">General Website</span>
                          )}
                        </div>
                      </td>

                      {/* Message Preview */}
                      <td className="px-4 py-4 max-w-xs sm:max-w-md">
                        <p className="line-clamp-2 text-xs text-slate-600 leading-relaxed font-sans">
                          {enquiry.message}
                        </p>
                        {enquiry.admin_notes && (
                          <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-flex items-center gap-1 border border-amber-200/60">
                            <span>Note: {enquiry.admin_notes}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {getStatusPill(enquiry.status)}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(enquiry.created_at)}</span>
                        </div>
                      </td>

                      {/* Quick Dispatch Actions */}
                      <td
                        className="px-5 py-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp Direct Action */}
                          {whatsAppUrl && (
                            <a
                              href={whatsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Chat WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {/* Email Direct Action */}
                          <a
                            href={`mailto:${enquiry.email}?subject=TripVibe Lanka Enquiry`}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Reply via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>

                          {/* Open Drawer */}
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(enquiry)}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors cursor-pointer"
                            title="Open Details Drawer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <EnquiryDrawer
        enquiry={selectedEnquiry}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEnquiry(null);
        }}
        onEnquiryUpdated={handleEnquiryUpdated}
        onEnquiryDeleted={handleEnquiryDeleted}
      />
    </div>
  );
}
