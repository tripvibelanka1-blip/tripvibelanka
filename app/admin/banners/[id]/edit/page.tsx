import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getBannerById } from '@/app/admin/banners/actions';
import BannerForm from '@/components/admin/banners/BannerForm';

export const metadata = {
  title: 'Edit Promotional Banner | TripVibe Lanka Operations Hub',
};

interface EditBannerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  const { id } = await params;
  const { data: banner, error } = await getBannerById(id);

  if (error || !banner) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Promotion Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The promotional banner you requested could not be retrieved. It may have been archived or removed from the database.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/banners"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Banners</span>
          </Link>
        </div>
      </div>
    );
  }

  return <BannerForm initialData={banner} isEdit={true} />;
}
