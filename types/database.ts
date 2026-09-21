/**
 * Database TypeScript Definitions for Supabase
 * Schema: public.tours
 */

export interface TourItineraryItem {
  day: number;
  title: string;
  details: string;
}

export type GuestPolicyType = 'solo' | 'couple' | 'family' | 'custom';

export interface Tour {
  id: string;
  title: string;
  category?: string | null;
  tagline?: string | null;
  locations?: string[];
  display_order?: number | null;
  destination_id: string | null;
  duration_days: number;
  duration_nights: number;
  price_usd: number;
  price_lkr: number;
  min_guests?: number;
  max_guests?: number | null;
  guest_policy?: GuestPolicyType | null;
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

export interface Destination {
  id: string;
  name: string;
  district?: string | null;
  tag?: string | null;
  best_time_to_visit?: string | null;
  display_order?: number | null;
  description: string | null;
  cover_image: string | null;
  gallery_images: string[];
  popular_attractions: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Backwards-compatible alias for existing imports
export type DestinationRecord = Destination;

export type DestinationInsert = Omit<Destination, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DestinationUpdate = Partial<DestinationInsert>;

export interface Activity {
  id: string;
  title: string;
  category?: string | null;
  location?: string | null;
  display_order?: number | null;
  destination_id: string | null;
  duration: string | null;
  price: number;
  price_lkr?: number;
  description: string | null;
  cover_image: string | null;
  gallery_images: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ActivityInsert = Omit<Activity, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ActivityUpdate = Partial<ActivityInsert>;

export type PaymentStatus = 'pending' | 'advance_paid' | 'fully_paid' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface SelectedActivityItem {
  activity_id: string;
  title: string;
  price_per_person: number;
  quantity: number;
  total: number;
}

export interface Booking {
  id: string;
  reference_no: string;
  tour_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country?: string;
  pickup_location?: string | null;
  special_requests?: string | null;
  travel_date: string;
  travelers_count: number;
  adults: number;
  children: number;
  selected_activities?: SelectedActivityItem[];
  currency: 'USD' | 'LKR';
  applied_exchange_rate?: number;
  total_amount: number;
  coupon_code?: string | null;
  discount_amount?: number;
  advance_percentage: number;
  advance_amount: number;
  remaining_balance: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  payhere_payment_id?: string | null;
  payment_method?: string;
  assigned_driver_guide?: string | null;
  admin_notes?: string | null;
  balance_settled_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined relation for display
  tours?: {
    id: string;
    title: string;
    duration_days: number;
    duration_nights: number;
    price_usd: number;
    price_lkr: number;
    cover_image: string | null;
    min_guests?: number;
    max_guests?: number | null;
    guest_policy?: string | null;
  } | null;
}

export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'tours'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type BookingUpdate = Partial<BookingInsert>;

export type VehicleCategory = 'sedan' | 'van' | 'mini_bus' | 'bus' | 'luxury';

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory | string;
  license_plate?: string | null;
  passenger_capacity: number;
  luggage_capacity: number;
  passengers_text?: string | null;
  luggage_text?: string | null;
  recommended_for?: string | null;
  display_order?: number | null;
  transmission?: string;
  fuel_type?: string;
  features: string[];
  description?: string | null;
  cover_image?: string | null;
  gallery_images: string[];
  price_per_day_usd?: number;
  price_per_day_lkr?: number;
  price_per_km_usd?: number;
  price_per_km_lkr?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type VehicleUpdate = Partial<VehicleInsert>;

// ------------------------------------------------------------------
// Promotional Banners
// ------------------------------------------------------------------
export interface Banner {
  id: string;
  badge_text: string;
  title: string;
  description?: string | null;
  coupon_code?: string | null;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  button_text: string;
  button_link: string;
  validity_text?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type BannerInsert = Omit<Banner, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type BannerUpdate = Partial<BannerInsert>;

// ==========================================
// 7. ENQUIRIES CRM MODULE TYPES
// ==========================================
export type EnquiryStatus = 'unread' | 'in_progress' | 'resolved';
export type EnquiryType = 'General' | 'Tour' | 'Activity' | 'Vehicle';

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  enquiry_type: EnquiryType;
  reference_title?: string | null;
  message: string;
  status: EnquiryStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type EnquiryInsert = Omit<Enquiry, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type EnquiryUpdate = Partial<EnquiryInsert>;

// ==========================================
// 8. SITE SETTINGS MODULE TYPES (Singleton)
// ==========================================
export interface SiteSettings {
  id: number;
  // Financials & Bookings
  advance_percentage: number;
  currency_buffer_percentage: number;
  manual_exchange_rate: number | null;
  is_manual_rate_enabled: boolean;
  min_lead_time_days: number;

  // Company Contacts
  company_name: string;
  company_email: string;
  company_phone: string;
  whatsapp_number: string;
  office_address: string;

  // Social Links
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  tripadvisor_url: string;

  // Policies
  cancellation_policy: string;
  terms_conditions: string;

  updated_at?: string;
}

export type SiteSettingsUpdate = Partial<Omit<SiteSettings, 'id' | 'updated_at'>>;

export interface Database {
  public: {
    Tables: {
      tours: {
        Row: Tour;
        Insert: TourInsert;
        Update: TourUpdate;
      };
      destinations: {
        Row: Destination;
        Insert: DestinationInsert;
        Update: DestinationUpdate;
      };
      activities: {
        Row: Activity;
        Insert: ActivityInsert;
        Update: ActivityUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      vehicles: {
        Row: Vehicle;
        Insert: VehicleInsert;
        Update: VehicleUpdate;
      };
      banners: {
        Row: Banner;
        Insert: BannerInsert;
        Update: BannerUpdate;
      };
      enquiries: {
        Row: Enquiry;
        Insert: EnquiryInsert;
        Update: EnquiryUpdate;
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: SiteSettingsUpdate;
      };
    };
  };
}





