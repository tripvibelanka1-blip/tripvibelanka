'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Compass,
  Tag,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Copy,
  Check,
  Send,
  Loader2,
  Save,
  MessageCircle,
  ExternalLink,
  Car,
  Ticket,
  Calendar,
} from 'lucide-react';
import { Enquiry, EnquiryStatus, EnquiryType } from '@/types/database';
import { updateEnquiryStatus, updateAdminNotes, deleteEnquiry } from '@/app/admin/enquiries/actions';

interface EnquiryDrawerProps {
  enquiry: Enquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onEnquiryUpdated: (updated: Enquiry) => void;
  onEnquiryDeleted?: (id: string) => void;
}

export default function EnquiryDrawer({
  enquiry,
  isOpen,
  onClose,
  onEnquiryUpdated,
  onEnquiryDeleted,
}: EnquiryDrawerProps) {
  const [currentStatus, setCurrentStatus] = useState<EnquiryStatus>('unread');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isUpdatingStatus, startStatusTransition] = useTransition();
  const [isSavingNotes, startNotesTransition] = useTransition();
  const [notesSaveFeedback, setNotesSaveFeedback] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy state
  const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);

  // Sync state whenever selected enquiry changes
  useEffect(() => {
    if (enquiry) {
      setCurrentStatus(enquiry.status);
      setAdminNotes(enquiry.admin_notes || '');
      setNotesSaveFeedback('idle');
      setShowDeleteModal(false);
    }
  }, [enquiry]);

  if (!isOpen || !enquiry) return null;

  // Format clean phone for WhatsApp
  const cleanPhone = enquiry.phone ? enquiry.phone.replace(/[^0-9]/g, '') : '';
  const whatsAppGreeting = encodeURIComponent(
    `Hi ${enquiry.name}, regarding your enquiry to TripVibe Lanka${
      enquiry.reference_title ? ` about "${enquiry.reference_title}"` : ''
    }: `
  );
  const whatsAppUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsAppGreeting}` : null;

  // Format mailto link
  const emailSubject = encodeURIComponent(
    `TripVibe Lanka Enquiry${enquiry.reference_title ? `: ${enquiry.reference_title}` : ''}`
  );
  const emailBody = encodeURIComponent(
    `Dear ${enquiry.name},\n\nThank you for reaching out to TripVibe Lanka regarding ${
      enquiry.reference_title || 'your Sri Lanka tour'
    }.\n\n`
  );
  const mailtoUrl = `mailto:${enquiry.email}?subject=${emailSubject}&body=${emailBody}`;

  const handleCopy = (text: string, field: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Status Change Handler
  const handleStatusChange = (newStatus: EnquiryStatus) => {
    setCurrentStatus(newStatus);
    startStatusTransition(async () => {
      const res = await updateEnquiryStatus(enquiry.id, newStatus);
      if (res.data) {
        onEnquiryUpdated(res.data);
      } else {
        // Rollback on error
        setCurrentStatus(enquiry.status);
      }
    });
  };

  // Save Admin Notes Handler
  const handleSaveNotes = () => {
    setNotesSaveFeedback('saving');
    startNotesTransition(async () => {
      const res = await updateAdminNotes(enquiry.id, adminNotes);
      if (res.data) {
        onEnquiryUpdated(res.data);
        setNotesSaveFeedback('saved');
        setTimeout(() => setNotesSaveFeedback('idle'), 3000);
      } else {
        setNotesSaveFeedback('error');
      }
    });
  };

  // Delete Handler
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteEnquiry(enquiry.id);
      if (res.data && onEnquiryDeleted) {
        onEnquiryDeleted(enquiry.id);
        setShowDeleteModal(false);
        onClose();
      }
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Category Icon helper
  const getTypeIcon = (type: EnquiryType) => {
    switch (type) {
      case 'Tour':
        return <Compass className="w-3.5 h-3.5 text-blue-500" />;
      case 'Activity':
        return <Ticket className="w-3.5 h-3.5 text-purple-500" />;
      case 'Vehicle':
        return <Car className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-[#FF6B00]" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200"
        aria-label="Enquiry Details Drawer"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/20">
              {enquiry.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {enquiry.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                  {getTypeIcon(enquiry.enquiry_type)}
                  <span>{enquiry.enquiry_type}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>
                  Received {new Date(enquiry.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Triage Status Selector Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                CRM Pipeline Stage:
              </label>
              {isUpdatingStatus && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-[#FF6B00]" />
                  <span>Updating...</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: 'unread', label: 'Unread / New', color: 'border-rose-300 text-rose-700 bg-rose-50' },
                  { value: 'in_progress', label: 'In Progress', color: 'border-amber-300 text-amber-800 bg-amber-50' },
                  { value: 'resolved', label: 'Resolved', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleStatusChange(tab.value)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    currentStatus === tab.value
                      ? `${tab.color} shadow-xs ring-2 ring-orange-500/20 font-black`
                      : 'border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context Banner (e.g. Specific Tour or Activity) */}
          {enquiry.reference_title && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50/30 border border-orange-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B00]">
                {getTypeIcon(enquiry.enquiry_type)}
                <span>Targeted {enquiry.enquiry_type} Lead</span>
              </div>
              <p className="text-sm font-black text-slate-900 font-heading">
                {enquiry.reference_title}
              </p>
              <p className="text-[11px] text-slate-500">
                Visitor submitted this enquiry while browsing this specific experience.
              </p>
            </div>
          )}

          {/* Contact Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Lead Contact Dossier
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Email */}
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="font-medium text-slate-800 hover:text-[#FF6B00] truncate"
                    title={enquiry.email}
                  >
                    {enquiry.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(enquiry.email, 'email')}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                  title="Copy email"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Phone */}
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">
                    {enquiry.phone || 'No phone provided'}
                  </span>
                </div>
                {enquiry.phone && (
                  <button
                    type="button"
                    onClick={() => handleCopy(enquiry.phone!, 'phone')}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                    title="Copy phone"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Dispatch Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* WhatsApp Button */}
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply via WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>No WhatsApp Phone</span>
                </button>
              )}

              {/* Email Button */}
              <a
                href={mailtoUrl}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs active:scale-[0.99] transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Reply via Email</span>
              </a>
            </div>
          </div>

          {/* Full Customer Message Payload */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Customer Message</span>
              <span className="text-[10px] text-slate-400 font-normal">Original submission</span>
            </h4>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {enquiry.message}
              </p>
            </div>
          </div>

          {/* Admin CRM Follow-up Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#FF6B00]" />
                <span>Internal Staff Notes & Log</span>
              </label>

              {notesSaveFeedback === 'saved' && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Notes saved</span>
                </span>
              )}
              {notesSaveFeedback === 'error' && (
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Failed to save</span>
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Log follow-up calls, custom quote details, passenger requests, or team notes..."
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
            />

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSavingNotes}
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingNotes ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Save Internal Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Lead</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Customer Enquiry</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete the enquiry from &quot;{enquiry.name}&quot;?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              This action will permanently remove this lead from the CRM inbox.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
