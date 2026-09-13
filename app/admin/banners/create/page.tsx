import React from 'react';
import BannerForm from '@/components/admin/banners/BannerForm';

export const metadata = {
  title: 'Create Promotional Banner | TripVibe Lanka Operations Hub',
};

export default function CreateBannerPage() {
  return <BannerForm isEdit={false} />;
}
