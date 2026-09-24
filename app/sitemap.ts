import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.tripvibelanka.com';
  const supabase = await createClient();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/experiences`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/fleet`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Fetch dynamic routes from Supabase
  let toursData: any[] = [];
  let destinationsData: any[] = [];
  let experiencesData: any[] = [];

  try {
    const [toursRes, destRes, expRes] = await Promise.all([
      supabase.from('tours').select('slug, updated_at'),
      supabase.from('destinations').select('slug, updated_at'),
      supabase.from('experiences').select('slug, updated_at'),
    ]);

    if (toursRes.data) toursData = toursRes.data;
    if (destRes.data) destinationsData = destRes.data;
    if (expRes.data) experiencesData = expRes.data;
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error);
  }

  const tourRoutes: MetadataRoute.Sitemap = toursData
    .filter((tour) => tour.slug)
    .map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: tour.updated_at ? new Date(tour.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

  const destinationRoutes: MetadataRoute.Sitemap = destinationsData
    .filter((dest) => dest.slug)
    .map((dest) => ({
      url: `${baseUrl}/destinations/${dest.slug}`,
      lastModified: dest.updated_at ? new Date(dest.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const experienceRoutes: MetadataRoute.Sitemap = experiencesData
    .filter((exp) => exp.slug)
    .map((exp) => ({
      url: `${baseUrl}/experiences/${exp.slug}`,
      lastModified: exp.updated_at ? new Date(exp.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...staticRoutes, ...tourRoutes, ...destinationRoutes, ...experienceRoutes];
}
