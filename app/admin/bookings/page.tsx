import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BookingsManager from '@/components/admin/bookings/BookingsManager';
import { AlertCircle, CalendarCheck, Terminal } from 'lucide-react';
import { Booking } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch all bookings with tour package details
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, tours(id, title, duration_days, duration_nights, price_usd, price_lkr, cover_image)')
    .order('created_at', { ascending: false });

  // If table does not exist in Supabase yet, show helpful setup instructions
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/80">
          <CalendarCheck className="w-6 h-6 text-[#FF6B00]" />
          <h1 className="text-2xl font-black text-slate-900">Bookings & Orders</h1>
        </div>

        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Database Setup Notice: Bookings Table Missing</h3>
              <p className="text-xs text-rose-700 mt-1">
                Supabase reported: <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">{error.message}</code>.
                The <code className="font-mono font-bold">bookings</code> table needs to be created in your Supabase SQL Editor.
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
              <li>Copy and paste Section 5 from <code className="font-mono text-[#FF6B00]">database.sql</code>.</li>
              <li>Click <strong>Run</strong>, then refresh this page.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <BookingsManager initialBookings={(bookings as unknown as Booking[]) || []} />;
}
