/**
 * Database TypeScript Definitions for Supabase
 * Schema: public.tours
 */

export interface TourItineraryItem {
  day: number;
  title: string;
  details: string;
}

export interface Tour {
  id: string;
  title: string;
  destination_id: string | null;
  duration_days: number;
  duration_nights: number;
  price_usd: number;
  price_lkr: number;
  description: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: { day: number; title: string; details: string }[];
  cover_image: string | null;
  gallery_images: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type TourInsert = Omit<Tour, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TourUpdate = Partial<TourInsert>;

export interface Database {
  public: {
    Tables: {
      tours: {
        Row: Tour;
        Insert: TourInsert;
        Update: TourUpdate;
      };
    };
  };
}
