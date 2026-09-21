'use client';

import React, { useState, useTransition } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Percent,
  Phone,
  Globe,
  ShieldCheck,
  Building2,
  DollarSign,
  Clock,
  MessageCircle,
  Mail,
  MapPin,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { SiteSettings } from '@/types/database';
import { updateSiteSettings } from '@/app/admin/settings/actions';

interface SettingsFormProps {
  initialSettings: SiteSettings;
}

type SettingsTab = 'financials' | 'contacts' | 'socials' | 'policies';

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('financials');
  const [isPending, startTransition] = useTransition();

  // Toast feedback state
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Track if there are unsaved changes
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const showToast = (message: string, type: 'success' | 'error') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  const handleChange = (
    field: keyof SiteSettings,
    value: string | number | boolean | null
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setSettings(initialSettings);
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSiteSettings({
        advance_percentage: Number(settings.advance_percentage),
        currency_buffer_percentage: Number(settings.currency_buffer_percentage),
        manual_exchange_rate: settings.manual_exchange_rate
          ? Number(settings.manual_exchange_rate)
          : null,
        is_manual_rate_enabled: Boolean(settings.is_manual_rate_enabled),
        min_lead_time_days: Number(settings.min_lead_time_days),
        company_name: settings.company_name?.trim(),
        company_email: settings.company_email?.trim(),
        company_phone: settings.company_phone?.trim(),
        whatsapp_number: settings.whatsapp_number?.trim(),
        office_address: settings.office_address?.trim(),
        facebook_url: settings.facebook_url?.trim(),
        instagram_url: settings.instagram_url?.trim(),
        tiktok_url: settings.tiktok_url?.trim(),
        tripadvisor_url: settings.tripadvisor_url?.trim(),
        cancellation_policy: settings.cancellation_policy?.trim(),
        terms_conditions: settings.terms_conditions?.trim(),
      });

      if (res.success && res.data) {
        setSettings(res.data);
        showToast(res.message, 'success');
      } else {
        showToast(res.message || 'Failed to update settings', 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            feedbackToast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="p-1 hover:opacity-75 cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-2xs flex flex-wrap items-center gap-1">
        {[
          {
            id: 'financials' as const,
            label: 'Booking & Financials',
            icon: Percent,
            badge: `${settings.advance_percentage}% Adv`,
          },
          {
            id: 'contacts' as const,
            label: 'Company & Contacts',
            icon: Building2,
          },
          {
            id: 'socials' as const,
            label: 'Social Profiles',
            icon: Globe,
          },
          {
            id: 'policies' as const,
            label: 'Policies & Legal',
            icon: ShieldCheck,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: BOOKING & FINANCIALS                               */}
        {/* ========================================================= */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Booking Deposit & Currency Policies
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage advance collection rules for PayHere checkout, forex safety buffer, and lead time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Advance Payment Percentage */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Advance Payment Percentage</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#FF6B00]">
                    {settings.advance_percentage}%
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={5}
                    max={100}
                    step={1}
                    value={settings.advance_percentage}
                    onChange={(e) =>
                      handleChange('advance_percentage', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] font-mono"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                    %
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Traveler pays <strong>{settings.advance_percentage}%</strong> online via PayHere to secure reservation. The remaining <strong>{Math.max(0, 100 - settings.advance_percentage)}%</strong> balance is collected on arrival.
                </p>
              </div>

              {/* Currency Buffer Percentage */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Forex Buffer Markup</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    +{settings.currency_buffer_percentage}%
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.1}
                    value={settings.currency_buffer_percentage}
                    onChange={(e) =>
                      handleChange(
                        'currency_buffer_percentage',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] font-mono"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                    %
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Safety buffer added on top of the Central Bank live exchange rate to prevent losses on bank transfer spreads and processing fees.
                </p>
              </div>

              {/* Minimum Booking Lead Time */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Minimum Booking Lead Time</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {settings.min_lead_time_days} {settings.min_lead_time_days === 1 ? 'Day' : 'Days'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={1}
                    value={settings.min_lead_time_days}
                    onChange={(e) =>
                      handleChange('min_lead_time_days', parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] font-mono"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                    Days
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Prevents customers from making bookings starting within less than {settings.min_lead_time_days} days, giving operations time to assign vehicles and guides.
                </p>
              </div>

              {/* Manual Exchange Rate Override */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Manual Fixed Exchange Rate</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange('is_manual_rate_enabled', !settings.is_manual_rate_enabled)
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.is_manual_rate_enabled ? 'bg-[#FF6B00]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.is_manual_rate_enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {settings.is_manual_rate_enabled ? (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="number"
                        min={100}
                        max={1000}
                        step={0.5}
                        placeholder="e.g. 310.00"
                        value={settings.manual_exchange_rate ?? ''}
                        onChange={(e) =>
                          handleChange(
                            'manual_exchange_rate',
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">
                        LKR / 1 USD
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      ⚠️ Manual lock enabled. Live currency API updates are bypassed.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Disabled. The system automatically fetches daily live USD/LKR exchange rates from the Central Bank / Forex API.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COMPANY & CONTACTS                                 */}
        {/* ========================================================= */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Company & Official Contact Channels
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                These contact details power the website header, footer, floating WhatsApp button, and PDF vouchers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company Brand Name</span>
                </label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  placeholder="TripVibe Lanka"
                />
              </div>

              {/* Official Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Official Contact Email</span>
                </label>
                <input
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => handleChange('company_email', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  placeholder="info@tripvibelanka.com"
                />
                <p className="text-[10px] text-slate-400">
                  Customer enquiries and booking alerts are dispatched to this inbox.
                </p>
              </div>

              {/* Support Phone Hotline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Telephone Hotline</span>
                </label>
                <input
                  type="text"
                  value={settings.company_phone}
                  onChange={(e) => handleChange('company_phone', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  placeholder="+94 77 536 8357"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Primary WhatsApp Number (International Format)</span>
                </label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  placeholder="+94775368357"
                />
                <p className="text-[10px] text-slate-400">
                  Used by the floating WhatsApp chat widget. Include country code (+94).
                </p>
              </div>

              {/* Registered Office Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registered Business Address</span>
                </label>
                <input
                  type="text"
                  value={settings.office_address}
                  onChange={(e) => handleChange('office_address', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  placeholder="Colombo, Sri Lanka"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SOCIAL PROFILES                                    */}
        {/* ========================================================= */}
        {activeTab === 'socials' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Social Media Links
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Connected profiles displayed on the website header and footer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Instagram Profile URL</span>
                </label>
                <input
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  placeholder="https://instagram.com/tripvibelanka"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Facebook Page URL</span>
                </label>
                <input
                  type="url"
                  value={settings.facebook_url}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  placeholder="https://facebook.com/tripvibelanka"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>TikTok Profile URL</span>
                </label>
                <input
                  type="url"
                  value={settings.tiktok_url}
                  onChange={(e) => handleChange('tiktok_url', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  placeholder="https://tiktok.com/@tripvibelanka"
                />
              </div>

              {/* TripAdvisor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>TripAdvisor Page URL</span>
                </label>
                <input
                  type="url"
                  value={settings.tripadvisor_url}
                  onChange={(e) => handleChange('tripadvisor_url', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  placeholder="https://tripadvisor.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: POLICIES & TERMS                                   */}
        {/* ========================================================= */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Cancellation Policies & Legal Terms
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Displayed to travelers during checkout and printed on itinerary vouchers.
              </p>
            </div>

            <div className="space-y-5 pt-2">
              {/* Cancellation Policy */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cancellation & Refund Policy</span>
                </label>
                <textarea
                  rows={4}
                  value={settings.cancellation_policy}
                  onChange={(e) => handleChange('cancellation_policy', e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] leading-relaxed"
                  placeholder="Specify refund timelines and advance deposit conditions..."
                />
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Booking Terms & Conditions</span>
                </label>
                <textarea
                  rows={4}
                  value={settings.terms_conditions}
                  onChange={(e) => handleChange('terms_conditions', e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] leading-relaxed"
                  placeholder="Specify client responsibilities, baggage liability, and payment settlement..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {hasChanges ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved Changes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              All settings synced with database
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 justify-end">
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#e05e00] active:bg-[#c95400] rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
