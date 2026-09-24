import { createClient } from '@/utils/supabase/server';
import HomeClient from './HomeClient';
import { HeroCardItem } from '@/components/home/Hero';

// Fetch data on the server to make initial load instant with zero layout shift
export const revalidate = 3600; // Cache the page for 1 hour

export default async function Page() {
  const supabase = await createClient();

  // Query active destinations ordered by display_order ASC, created_at DESC
  let queryRes = await supabase
    .from('destinations')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(4);

  if (queryRes.error) {
    queryRes = await supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4);
  }

  const data = queryRes.data;
  let initialHeroCards: HeroCardItem[] = [];

  if (data && data.length > 0) {
    initialHeroCards = data.map((dest: any) => {
      const cover =
        dest.cover_image && typeof dest.cover_image === 'string' && dest.cover_image.trim().length > 0
          ? dest.cover_image.trim()
          : 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80';

      const subtitleText =
        dest.tag?.trim() ||
        dest.district?.trim() ||
        (dest.description?.trim()
          ? dest.description.trim().slice(0, 52) + (dest.description.length > 52 ? '...' : '')
          : 'Luxury Private Destination');

      return {
        id: dest.id,
        title: dest.name,
        subtitle: subtitleText,
        image: cover,
        destinationName: dest.name,
      };
    });
  }

  return <HomeClient initialHeroCards={initialHeroCards} />;
}
