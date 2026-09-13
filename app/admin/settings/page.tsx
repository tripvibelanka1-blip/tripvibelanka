import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSiteSettings } from '@/app/admin/settings/actions';
import SettingsForm from '@/components/admin/settings/SettingsForm';
import { Sliders } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch singleton settings from database
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Global Site Settings
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              <Sliders className="w-3 h-3 text-[#FF6B00]" />
              <span>Live System Config</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure checkout deposit policies, currency forex buffers, contact channels, and customer legal terms.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
