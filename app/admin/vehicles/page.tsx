import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import VehiclesTable from '@/components/admin/VehiclesTable';
import { Plus, AlertCircle, Car, Terminal } from 'lucide-react';
import { Vehicle } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminVehiclesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch all vehicles
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Top Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Car className="w-6 h-6 text-[#FF6B00]" />
            <span>Vehicles & Fleet Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage private tour vans, luxury sedans, mini buses, and coaches for customer transfers and driver dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/vehicles/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF6B00] hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Vehicle</span>
          </Link>
        </div>
      </div>

      {/* Database Error Notice */}
      {error && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Database Setup Notice: Vehicles Table Missing</h3>
              <p className="text-xs text-rose-700 mt-1">
                Supabase reported: <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">{error.message}</code>.
                The <code className="font-mono font-bold">vehicles</code> table needs to be created in your Supabase SQL Editor.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-rose-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#FF6B00]" />
              <span>How to execute the migration:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Open your Supabase Project Dashboard &rarr; <strong>SQL Editor</strong>.</li>
              <li>Copy and paste Section 6 from <code className="font-mono text-[#FF6B00]">database.sql</code>.</li>
              <li>Click <strong>Run</strong>, then refresh this page.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Main Table */}
      {!error && <VehiclesTable initialVehicles={(vehicles as Vehicle[]) || []} />}
    </div>
  );
}
