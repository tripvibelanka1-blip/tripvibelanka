import React from 'react';
import {
  MessageSquareText,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { getEnquiries } from '@/app/admin/enquiries/actions';
import EnquiriesList from '@/components/admin/enquiries/EnquiriesList';

export const dynamic = 'force-dynamic';

export default async function AdminEnquiriesPage() {
  const { data: enquiries, error } = await getEnquiries('all');
  const enquiryList = enquiries || [];

  const unreadCount = enquiryList.filter((e) => e.status === 'unread').length;
  const inProgressCount = enquiryList.filter((e) => e.status === 'in_progress').length;
  const resolvedCount = enquiryList.filter((e) => e.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquareText className="w-6 h-6 text-[#FF6B00]" />
            <span>Customer Enquiries & Leads</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            CRM inbox for triage, tracking, and replying to traveler leads from tour, activity, and website forms.
          </p>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Enquiries */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Total Inquiries
            </span>
            <span className="text-xl font-black text-slate-900">{enquiryList.length}</span>
          </div>
        </div>

        {/* Unread / Attention Needed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0 relative">
            <Mail className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Unread Leads
            </span>
            <span className="text-xl font-black text-rose-600">{unreadCount}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              In Progress
            </span>
            <span className="text-xl font-black text-amber-800">{inProgressCount}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Resolved & Booked
            </span>
            <span className="text-xl font-black text-emerald-800">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Error Alert if fetch failed */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">Database Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main CRM Inbox List */}
      <EnquiriesList initialEnquiries={enquiryList} />
    </div>
  );
}
