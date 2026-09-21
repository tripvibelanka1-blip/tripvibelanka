-- ==========================================================
-- TripVibe Lanka: Database Schema & Storage Configuration
-- ==========================================================

-- 1. Create Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT,
  tag TEXT,
  best_time_to_visit TEXT,
  display_order INTEGER DEFAULT 0,
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  popular_attractions JSONB DEFAULT '[]'::jsonb, -- Array of attraction strings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure newly added columns exist if table was already created earlier
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS popular_attractions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Enable RLS & Allow authenticated admin access to destinations
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full access to destinations" ON destinations;
CREATE POLICY "Allow authenticated full access to destinations" 
  ON destinations 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Allow public read access to active destinations so visitors can see destination details
DROP POLICY IF EXISTS "Allow public read access to destinations" ON destinations;
CREATE POLICY "Allow public read access to destinations"
  ON destinations
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Seed destinations if not already present
INSERT INTO destinations (name, description, popular_attractions) VALUES 
('Colombo', 'Vibrant commercial capital blending colonial charm with modern cosmopolitan nightlife', '["Galle Face Green", "National Museum", "Gangaramaya Temple", "Pettah Market"]'::jsonb),
('Kandy', 'Sacred royal hill capital surrounded by lush misty mountains and tea estates', '["Temple of the Sacred Tooth Relic", "Royal Botanical Gardens", "Kandy Lake", "Bahirawakanda Buddha"]'::jsonb),
('Ella', 'Charming highland village famous for iconic train tracks, misty peaks, and hiking trails', '["Nine Arches Bridge", "Little Adam''s Peak", "Ella Rock", "Ravana Falls"]'::jsonb),
('Yala', 'Premier wildlife sanctuary home to the world''s highest density of leopards and wild elephants', '["Yala National Park Safari", "Sithulpawwa Rock Temple", "Patanangala Beach", "Kumana Bird Sanctuary"]'::jsonb)
ON CONFLICT DO NOTHING;

-- 2. Create Tours Table
CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Cultural',
  tagline TEXT,
  locations JSONB DEFAULT '[]'::jsonb, -- Array of string route locations e.g. ["Colombo", "Sigiriya", "Kandy"]
  display_order INTEGER DEFAULT 0,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_nights INTEGER NOT NULL DEFAULT 0,
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  price_lkr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  min_guests INTEGER NOT NULL DEFAULT 1,
  max_guests INTEGER,
  guest_policy TEXT DEFAULT 'custom',
  description TEXT,
  highlights JSONB DEFAULT '[]'::jsonb, -- Array of strings
  included JSONB DEFAULT '[]'::jsonb,   -- Array of strings
  excluded JSONB DEFAULT '[]'::jsonb,   -- Array of strings
  itinerary JSONB DEFAULT '[]'::jsonb,  -- Array of { day: number, title: string, details: string }
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure newly added columns exist if table was already created earlier
ALTER TABLE tours ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Cultural';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS locations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS min_guests INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS max_guests INTEGER;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS guest_policy TEXT DEFAULT 'custom';

-- Enable Row Level Security (RLS) on Tours
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins full CRUD access
DROP POLICY IF EXISTS "Allow authenticated users full access to tours" ON tours;
CREATE POLICY "Allow authenticated users full access to tours"
  ON tours
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public read access for active tours
DROP POLICY IF EXISTS "Allow public read access to active tours" ON tours;
CREATE POLICY "Allow public read access to active tours"
  ON tours
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- 3. Storage Bucket for Tour Media with Strict Security Controls
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'tour-images', 
  'tour-images', 
  true, 
  10485760, -- 10MB strict limit per upload
  ARRAY['image/jpeg', 'image/png', 'image/webp'] -- Server-side MIME validation (blocks SVG XSS, scripts, executables)
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Clean up storage policies to avoid duplicates
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- Allow public read access (so images load on public website)
CREATE POLICY "Public Read Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'tour-images' );

-- Allow authenticated admins to upload images
CREATE POLICY "Admin Upload Access"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'tour-images' );

-- Allow authenticated admins to update images
CREATE POLICY "Admin Update Access"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'tour-images' );

-- Allow authenticated admins to delete images
CREATE POLICY "Admin Delete Access"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'tour-images' );

-- ==========================================================
-- 4. Storage Bucket for Destination Media
-- ==========================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'destination-images', 
  'destination-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies for destination-images
DROP POLICY IF EXISTS "Public Read Access (Destinations)" ON storage.objects;
CREATE POLICY "Public Read Access (Destinations)"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'destination-images' );

DROP POLICY IF EXISTS "Admin Upload Access (Destinations)" ON storage.objects;
CREATE POLICY "Admin Upload Access (Destinations)"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'destination-images' );

DROP POLICY IF EXISTS "Admin Update Access (Destinations)" ON storage.objects;
CREATE POLICY "Admin Update Access (Destinations)"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'destination-images' );

DROP POLICY IF EXISTS "Admin Delete Access (Destinations)" ON storage.objects;
CREATE POLICY "Admin Delete Access (Destinations)"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'destination-images' );

-- 1. Extend destinations table columns safely
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS popular_attractions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Create destination-images storage bucket with 10MB limit & MIME whitelist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'destination-images', 
  'destination-images', 
  true, 
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 3. Storage Policies for destination-images
DROP POLICY IF EXISTS "Public Read Access (Destinations)" ON storage.objects;
CREATE POLICY "Public Read Access (Destinations)" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'destination-images');

DROP POLICY IF EXISTS "Admin Upload Access (Destinations)" ON storage.objects;
CREATE POLICY "Admin Upload Access (Destinations)" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'destination-images');

DROP POLICY IF EXISTS "Admin Update Access (Destinations)" ON storage.objects;
CREATE POLICY "Admin Update Access (Destinations)" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'destination-images');

DROP POLICY IF EXISTS "Admin Delete Access (Destinations)" ON storage.objects;
CREATE POLICY "Admin Delete Access (Destinations)" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'destination-images');


-- ----------------------------------------------------
-- 4. ACTIVITIES & EXPERIENCES MODULE
-- ----------------------------------------------------

-- Table: public.activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Wildlife & Nature',
  location TEXT,
  display_order INTEGER DEFAULT 0,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  duration TEXT,
  price NUMERIC(10, 2) DEFAULT 0.00, -- Primary Price in USD
  price_lkr NUMERIC(12, 2) DEFAULT 0.00, -- Optional Price in LKR (Domestic Trust)
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure newly added columns exist if table was already created
ALTER TABLE activities ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Wildlife & Nature';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS price_lkr NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS: Public Read Access (for visitor-facing catalog & destination views)
DROP POLICY IF EXISTS "Public Read Access (Activities)" ON activities;
CREATE POLICY "Public Read Access (Activities)" 
ON activities FOR SELECT 
TO public 
USING (true);

-- RLS: Full Authenticated Admin Access
DROP POLICY IF EXISTS "Allow authenticated full access to activities" ON activities;
CREATE POLICY "Allow authenticated full access to activities" 
ON activities FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ----------------------------------------------------
-- Storage Bucket for Activities Media (10MB limit + WebP/PNG/JPG whitelist)
-- ----------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'activity-images', 
  'activity-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies for 'activity-images'
DROP POLICY IF EXISTS "Public Read Access (Activities Bucket)" ON storage.objects;
CREATE POLICY "Public Read Access (Activities Bucket)" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'activity-images');

DROP POLICY IF EXISTS "Admin Upload Access (Activities Bucket)" ON storage.objects;
CREATE POLICY "Admin Upload Access (Activities Bucket)" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'activity-images');

DROP POLICY IF EXISTS "Admin Update Access (Activities Bucket)" ON storage.objects;
CREATE POLICY "Admin Update Access (Activities Bucket)" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'activity-images');

DROP POLICY IF EXISTS "Admin Delete Access (Activities Bucket)" ON storage.objects;
CREATE POLICY "Admin Delete Access (Activities Bucket)" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'activity-images');

-- ----------------------------------------------------
-- 5. BOOKINGS & ORDERS MODULE
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_no TEXT UNIQUE NOT NULL, -- Format: TVL-YYYY-XXXXX
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  
  -- Customer Details
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_country TEXT,
  pickup_location TEXT,
  special_requests TEXT,
  
  -- Tour Schedule
  travel_date DATE NOT NULL,
  travelers_count INTEGER NOT NULL DEFAULT 1,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  
  -- Optional Activity Add-ons Snapshot (Stores array of { activity_id, title, price_per_person, quantity, total })
  selected_activities JSONB DEFAULT '[]'::jsonb,
  
  -- Financial Tracking
  currency TEXT NOT NULL DEFAULT 'LKR' CHECK (currency IN ('LKR', 'USD')),
  applied_exchange_rate NUMERIC(10, 4) DEFAULT 1.0000, -- Locked exchange rate snapshot at checkout
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  advance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
  advance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  remaining_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  
  -- Lifecycles
  payment_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'advance_paid', 'fully_paid', 'failed', 'refunded')),
  booking_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    
  -- Payment Gateway Tracking
  payhere_payment_id TEXT,
  payment_method TEXT,
  
  -- Operations & Logistics
  admin_notes TEXT,
  assigned_driver_guide TEXT,
  balance_settled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure newly added columns exist if table was already created
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'LKR';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS applied_exchange_rate NUMERIC(10, 4) DEFAULT 1.0000;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS selected_activities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_driver_guide TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS balance_settled_at TIMESTAMP WITH TIME ZONE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference_no);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON bookings(travel_date);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow authenticated full access to bookings" ON bookings;
CREATE POLICY "Allow authenticated full access to bookings" 
  ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert bookings" ON bookings;
CREATE POLICY "Allow public insert bookings" 
  ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public view own booking by reference" ON bookings;
CREATE POLICY "Allow public view own booking by reference" 
  ON bookings FOR SELECT TO anon, authenticated USING (true);


-- ----------------------------------------------------
-- 6. VEHICLES & FLEET MANAGEMENT MODULE
-- ----------------------------------------------------

-- 1. Create Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                         -- e.g. "Toyota HiAce Super GL Luxury"
  category TEXT NOT NULL,                     -- 'sedan', 'van', 'mini_bus', 'bus', 'luxury'
  license_plate TEXT,                         -- e.g. "WP NB-4421" (Internal dispatch use)
  passenger_capacity INTEGER NOT NULL DEFAULT 4,
  luggage_capacity INTEGER NOT NULL DEFAULT 3,
  transmission TEXT DEFAULT 'Automatic',      -- 'Automatic', 'Manual'
  fuel_type TEXT DEFAULT 'Diesel',            -- 'Petrol', 'Diesel', 'Hybrid', 'Electric'
  features JSONB DEFAULT '[]'::jsonb,         -- ["Dual AC", "Wi-Fi", "USB Charging", "Reclining Seats", "English Speaking Chauffeur"]
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  price_per_day_usd NUMERIC(8, 2) DEFAULT 0.00,  -- Primary Daily Rate (USD)
  price_per_day_lkr NUMERIC(10, 2) DEFAULT 0.00, -- Optional Daily Rate (LKR for Trust)
  price_per_km_usd NUMERIC(8, 2) DEFAULT 0.00,   -- Optional Excess KM Rate (USD)
  price_per_km_lkr NUMERIC(8, 2) DEFAULT 0.00,   -- Optional Excess KM Rate (LKR)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure newly added columns exist if table was already created
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS license_plate TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission TEXT DEFAULT 'Automatic';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'Diesel';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_per_day_usd NUMERIC(8, 2) DEFAULT 0.00;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_per_day_lkr NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_per_km_usd NUMERIC(8, 2) DEFAULT 0.00;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_per_km_lkr NUMERIC(8, 2) DEFAULT 0.00;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access to vehicles" ON vehicles;
CREATE POLICY "Allow authenticated full access to vehicles"
  ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to active vehicles" ON vehicles;
CREATE POLICY "Allow public read access to active vehicles"
  ON vehicles FOR SELECT TO public USING (is_active = true);

-- 2. Storage Bucket for Vehicle Media with Strict MIME & Size Controls
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'vehicle-images', 
  'vehicle-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Public Read Access (Vehicle Bucket)" ON storage.objects;
CREATE POLICY "Public Read Access (Vehicle Bucket)" 
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Admin Upload Access (Vehicle Bucket)" ON storage.objects;
CREATE POLICY "Admin Upload Access (Vehicle Bucket)" 
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Admin Update Access (Vehicle Bucket)" ON storage.objects;
CREATE POLICY "Admin Update Access (Vehicle Bucket)" 
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Admin Delete Access (Vehicle Bucket)" ON storage.objects;
CREATE POLICY "Admin Delete Access (Vehicle Bucket)" 
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-images');

-- ==========================================================
-- 6. Create Banners Table (Text-First Promotional Cards)
-- ==========================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_text TEXT DEFAULT 'Limited Seasonal Offer',
  title TEXT NOT NULL,
  description TEXT,
  coupon_code TEXT, -- e.g. VIBELANKA15
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) DEFAULT 15.00,
  button_text TEXT NOT NULL DEFAULT 'Claim Seasonal Offer',
  button_link TEXT NOT NULL DEFAULT '/#tours',
  validity_text TEXT DEFAULT 'Valid for bookings made this month',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already created
ALTER TABLE banners ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percentage';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10, 2) DEFAULT 15.00;

-- Ensure coupon tracking columns exist in bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0.00;

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active, currently valid banners
DROP POLICY IF EXISTS "Public Read Active Banners" ON banners;
CREATE POLICY "Public Read Active Banners" ON banners
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= CURRENT_DATE)
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  );

-- Full authenticated admin access
DROP POLICY IF EXISTS "Admin Full Access Banners" ON banners;
CREATE POLICY "Admin Full Access Banners" ON banners
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Seed initial promotional banner if empty
INSERT INTO banners (
  badge_text,
  title,
  description,
  coupon_code,
  discount_type,
  discount_value,
  button_text,
  button_link,
  validity_text,
  start_date,
  end_date,
  is_active
) 
SELECT 
  'Limited Seasonal Offer',
  'Exclusive Summer Escape: 15% Off Private Tours',
  'Enjoy 15% off bespoke private chauffeured tours across the cultural triangle and southern coast.',
  'VIBELANKA15',
  'percentage',
  15.00,
  'Claim Seasonal Offer',
  '#booking',
  'Valid for private bookings reserved this month',
  CURRENT_DATE,
  (CURRENT_DATE + INTERVAL '30 days')::date,
  true
WHERE NOT EXISTS (SELECT 1 FROM banners LIMIT 1);


-- ==========================================================
-- 7. CUSTOMER ENQUIRIES CRM MODULE
-- ==========================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT, -- Primary contact or WhatsApp number
  enquiry_type TEXT NOT NULL DEFAULT 'General' CHECK (enquiry_type IN ('General', 'Tour', 'Activity', 'Vehicle')),
  reference_title TEXT, -- e.g. "7-Day Cultural Classic Tour" or "Yala Safari Experience"
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'in_progress', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON enquiries(enquiry_type);

-- Enable RLS
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public to INSERT enquiries from website forms
DROP POLICY IF EXISTS "Allow public insert enquiries" ON enquiries;
CREATE POLICY "Allow public insert enquiries" ON enquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated admin full access (select, update, delete)
DROP POLICY IF EXISTS "Allow admin full access enquiries" ON enquiries;
CREATE POLICY "Allow admin full access enquiries" ON enquiries
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Seed initial enquiries for testing CRM inbox if empty
INSERT INTO enquiries (
  name,
  email,
  phone,
  enquiry_type,
  reference_title,
  message,
  status,
  admin_notes,
  created_at
)
SELECT 
  'Elena Rostova',
  'elena.rostova@example.com',
  '+447911123456',
  'Tour',
  '7-Day Cultural Classic Circuit',
  'Hello! We are planning a honeymoon trip for 2 people in November. Can we add a luxury treehouse stay in Ella and upgrade to a chauffeured Mercedes van?',
  'unread',
  NULL,
  now() - interval '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM enquiries LIMIT 1);

INSERT INTO enquiries (
  name,
  email,
  phone,
  enquiry_type,
  reference_title,
  message,
  status,
  admin_notes,
  created_at
)
SELECT 
  'David Miller',
  'dmiller@travelcorp.au',
  '+61412345678',
  'Activity',
  'Yala National Park Leopard Safari',
  'Hi there, we want to book a private afternoon safari jeep for 4 adults. Does the price include national park entrance fees and tracker guide?',
  'in_progress',
  'Messaged on WhatsApp. Provided inclusion breakdown. Awaiting date confirmation.',
  now() - interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM enquiries WHERE email = 'dmiller@travelcorp.au');

INSERT INTO enquiries (
  name,
  email,
  phone,
  enquiry_type,
  reference_title,
  message,
  status,
  admin_notes,
  created_at
)
SELECT 
  'Sarah Jenkins',
  'sarah.j@outlook.com',
  '+12025550199',
  'General',
  'Custom 14-Day Wildlife & Coast Itinerary',
  'Inquiring about customized private chauffeur driver rates for two weeks starting from Colombo Airport. Looking forward to your itinerary suggestions.',
  'resolved',
  'Custom itinerary created and booked as TVL-2026-18920.',
  now() - interval '3 days'
WHERE NOT EXISTS (SELECT 1 FROM enquiries WHERE email = 'sarah.j@outlook.com');

-- ==========================================================
-- 8. GLOBAL SITE SETTINGS (Singleton Pattern)
-- ==========================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  
  -- Financials & Bookings (Section 7)
  advance_percentage NUMERIC(5, 2) DEFAULT 20.00 NOT NULL,
  currency_buffer_percentage NUMERIC(4, 2) DEFAULT 2.00 NOT NULL,
  manual_exchange_rate NUMERIC(10, 2) DEFAULT NULL,
  is_manual_rate_enabled BOOLEAN DEFAULT false,
  min_lead_time_days INTEGER DEFAULT 1 NOT NULL,
  
  -- Company Contacts (Section 2 & 18)
  company_name TEXT DEFAULT 'TripVibe Lanka',
  company_email TEXT DEFAULT 'info@tripvibelanka.com',
  company_phone TEXT DEFAULT '+94 77 536 8357',
  whatsapp_number TEXT DEFAULT '+94775368357',
  office_address TEXT DEFAULT 'Colombo, Sri Lanka',
  
  -- Social Media URLs (Section 2 & 18)
  facebook_url TEXT DEFAULT 'https://facebook.com/tripvibelanka',
  instagram_url TEXT DEFAULT 'https://instagram.com/tripvibelanka',
  tiktok_url TEXT DEFAULT 'https://tiktok.com/@tripvibelanka',
  tripadvisor_url TEXT DEFAULT 'https://tripadvisor.com',
  
  -- Policies (Section 18)
  cancellation_policy TEXT DEFAULT 'Free cancellation up to 7 days before tour departure. 50% refund between 3 to 7 days. Non-refundable within 48 hours of scheduled departure.',
  terms_conditions TEXT DEFAULT 'All bookings require an advance deposit to secure chauffeured vehicles and licensed guides. Remaining balance is payable in cash (USD / LKR) or card upon arrival.',
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default singleton row if not exists
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for checkout deposit, floating WhatsApp widget, footer contacts)
DROP POLICY IF EXISTS "Allow public read site settings" ON site_settings;
CREATE POLICY "Allow public read site settings" 
ON site_settings FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow authenticated admin full access (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Allow authenticated update site settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated all site settings" ON site_settings;
CREATE POLICY "Allow authenticated all site settings" 
ON site_settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Explicitly ensure INSERT is permitted for UPSERT operations
DROP POLICY IF EXISTS "Allow authenticated insert site settings" ON site_settings;
CREATE POLICY "Allow authenticated insert site settings" 
ON site_settings FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- ==========================================================
-- 19. Migration: Destinations Extra Fields & Top 4 Seed
-- ==========================================================
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Optional: Seed/Update top 4 destinations if desired
INSERT INTO destinations (name, district, tag, best_time_to_visit, display_order, description, cover_image, popular_attractions, is_active)
VALUES
(
  'Sigiriya & Cultural Triangle',
  'Matale District',
  '8th Wonder of the World',
  'Dec – Apr & Jul – Sep',
  1,
  'Marvel at the ancient sky citadel carved into a 200m monolithic rock, surrounded by terraced water gardens, lion claw staircases, and historic frescoes.',
  'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
  '["Lion Rock Citadel", "Pidurangala Sunrise", "Dambulla Cave Temple", "Minneriya Elephant Gathering"]'::jsonb,
  true
),
(
  'Ella & The Central Highlands',
  'Badulla District',
  'Misty Alpine Escapes',
  'Jan – May',
  2,
  'Immerse in dramatic mountain passes, the iconic Nine Arch Demodara viaduct, cascading Ravana Falls, and lush tea factory estates.',
  'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1000&q=80',
  '["Nine Arch Bridge", "Little Adam''s Peak", "Ravana Waterfalls", "Ceylon Tea Tasting"]'::jsonb,
  true
),
(
  'Kandy Kingdom',
  'Central Province',
  'Sacred Heritage & Royalty',
  'Year-round (Esala Perahera in Aug)',
  3,
  'Sri Lanka''s last royal kingdom nestled beside serene Kandy Lake, home to the Sacred Relic of the Tooth and Peradeniya Botanical Gardens.',
  'https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=1000&q=80',
  '["Temple of the Tooth", "Royal Botanical Gardens", "Kandy Lake Walk", "Traditional Fire Dance"]'::jsonb,
  true
),
(
  'Mirissa & Southern Coast',
  'Matara District',
  'Turquoise Seas & Palm Hills',
  'Nov – Apr',
  4,
  'Famed for iconic Coconut Tree Hill, serene crescent beaches, vibrant beachside seafood dining, and ethical blue whale watching charters.',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
  '["Coconut Tree Hill", "Blue Whale Watching", "Secret Beach Cove", "Galle Dutch Fort Nearby"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 20. Migration: Tours Extra Fields & Signature Tours Seed
-- ==========================================================
ALTER TABLE tours ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Cultural';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS locations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Optional: Seed top signature tours if desired
INSERT INTO tours (
  title,
  category,
  tagline,
  locations,
  duration_days,
  duration_nights,
  price_usd,
  price_lkr,
  description,
  highlights,
  cover_image,
  is_featured,
  is_active,
  display_order
)
VALUES
(
  'Classical Heritage & Wildlife Odyssey',
  'Cultural',
  'The definitive Sri Lankan circuit blending ancient wonders with untamed wildlife.',
  '["Colombo", "Sigiriya", "Kandy", "Yala", "Galle"]'::jsonb,
  7,
  6,
  890.00,
  275900.00,
  'Experience Sri Lanka''s timeless highlights from ancient rock citadels to wild elephant and leopard safaris.',
  '["Private sunrise ascent of Sigiriya Rock Fortress", "VIP blessings at Kandy Temple of the Sacred Tooth", "Private 4x4 open-top jeep safari in Yala National Park", "Sunset stroll along the cobblestones of UNESCO Galle Fort"]'::jsonb,
  'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
  true,
  true,
  1
),
(
  'The Grand Sri Lanka Private Discovery',
  'Signature',
  'An all-encompassing private chauffeur expedition spanning mountains, coastlines, and history.',
  '["Sigiriya", "Polonnaruwa", "Kandy", "Nuwara Eliya", "Ella", "Yala", "Mirissa"]'::jsonb,
  10,
  9,
  1420.00,
  440200.00,
  'Our most prestigious bespoke voyage across the Pearl of the Indian Ocean in executive vehicle comfort.',
  '["First-class observation carriage train through cloud forests", "Private tea masterclass at an active colonial plantation", "Two safari game drives in Yala and Udawalawe", "Exclusive sunset yacht charter along the southern coast"]'::jsonb,
  'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
  true,
  true,
  2
),
(
  'Highland Mist & Ceylon Tea Trails',
  'Hill Country',
  'Indulge in cool mountain air, emerald estates, and colonial elegance.',
  '["Kandy", "Nuwara Eliya", "Ella", "Haputale"]'::jsonb,
  5,
  4,
  680.00,
  210800.00,
  'Traverse the verdant peaks of Sri Lanka''s tea heartland with visits to cascading waterfalls and colonial estates.',
  '["Heritage luxury bungalow stay in the tea hills", "Scenic train ride over Nine Arch Demodara Bridge", "Trek to Little Adam''s Peak & Ravana Falls", "Authentic artisanal Ceylon tea tasting experience"]'::jsonb,
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
  false,
  true,
  3
),
(
  'Southern Sands, Whales & Coastal Forts',
  'Coastal',
  'Turquoise Indian Ocean waters, golden palms, and historic ramparts.',
  '["Bentota", "Mirissa", "Weligama", "Galle"]'::jsonb,
  4,
  3,
  560.00,
  173600.00,
  'A coastal getaway featuring whale watching, surfing bays, and the atmospheric lanes of Galle Fort.',
  '["Private blue whale watching excursion at dawn", "Sunset cocktails at Coconut Tree Hill", "Guided heritage walk through Galle Dutch Fort", "Relaxation at secluded boutique beach clubs"]'::jsonb,
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
  false,
  true,
  4
),
(
  'Wild Big Four: Leopards, Elephants & Whales',
  'Wildlife',
  'Encounter Sri Lanka''s majestic biodiversity on land and sea.',
  '["Wilpattu", "Minneriya", "Yala", "Mirissa"]'::jsonb,
  6,
  5,
  820.00,
  254200.00,
  'An action-packed safari circuit for nature lovers guided by expert naturalists.',
  '["Jeep safari in Yala National Park for leopard tracking", "The Great Elephant Gathering at Minneriya", "Bird watching safari in Bundala wetlands", "Ocean safari charter for dolphins and whales"]'::jsonb,
  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80',
  false,
  true,
  5
)
ON CONFLICT DO NOTHING;
 
-- ==========================================================
-- 21. Activities & Experiences Migration & Seed Data
-- Run this in Supabase SQL Editor to populate live Island Experiences
-- ==========================================================

ALTER TABLE activities ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Wildlife & Nature';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS price_lkr NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Seed Signature Experiences if activities table is empty or for initial setup
INSERT INTO activities (
  title,
  category,
  location,
  duration,
  price,
  price_lkr,
  description,
  cover_image,
  display_order,
  is_active
) VALUES 
(
  'Private 4x4 Leopard Safari',
  'Wildlife & Nature',
  'Yala National Park',
  '4 - 6 Hours',
  95.00,
  29450.00,
  'Track leopards and wild elephants with a seasoned tracker in customized open-air Toyota Land Cruisers.',
  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=800&q=80',
  1,
  true
),
(
  'Ella Rock & Little Adam''s Peak Trek',
  'Adventure & Trekking',
  'Ella Highlands',
  '3 - 5 Hours',
  45.00,
  13950.00,
  'Hike through tea plantations, pine forests, and rocky cliffs to catch sunrise over Ella Gap.',
  'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
  2,
  true
),
(
  'Temple of the Tooth & Fire Dance',
  'Cultural & Sacred',
  'Kandy City',
  '3 Hours',
  50.00,
  15500.00,
  'Participate in the evening Pooja drum ceremony and witness historic Kandyan fire-walking performances.',
  'https://images.unsplash.com/photo-1588598198321-9735fd52455b?auto=format&fit=crop&w=800&q=80',
  3,
  true
),
(
  'High-Altitude Ceylon Tea Masterclass',
  'Culinary & Heritage',
  'Nuwara Eliya',
  '2.5 Hours',
  35.00,
  10850.00,
  'Pick tea leaves alongside tea pluckers, tour an 1890s factory, and taste award-winning Orange Pekoe grades.',
  'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80',
  4,
  true
),
(
  'Mirissa Blue Whale & Dolphin Yachting',
  'Marine Adventure',
  'Mirissa Marina',
  '4 Hours',
  85.00,
  26350.00,
  'Sail into the Indian Ocean aboard an ethical yacht charter with marine biologists to watch majestic blue whales.',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
  5,
  true
)
ON CONFLICT DO NOTHING;

-- ==========================================================
-- 22. Vehicles & Fleet Management Module & Seed Data
-- Run this in Supabase SQL Editor to manage vehicles and populate live fleet
-- ==========================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'van',
  license_plate TEXT,
  passenger_capacity INTEGER NOT NULL DEFAULT 4,
  luggage_capacity INTEGER NOT NULL DEFAULT 2,
  passengers_text TEXT,
  luggage_text TEXT,
  recommended_for TEXT,
  display_order INTEGER DEFAULT 0,
  transmission TEXT DEFAULT 'Automatic',
  fuel_type TEXT DEFAULT 'Diesel',
  features JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  price_per_day_usd NUMERIC(10, 2) DEFAULT 0.00,
  price_per_day_lkr NUMERIC(12, 2) DEFAULT 0.00,
  price_per_km_usd NUMERIC(10, 2) DEFAULT 0.00,
  price_per_km_lkr NUMERIC(12, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure newly added columns exist if table was created earlier
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS passengers_text TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS luggage_text TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS recommended_for TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_per_day_lkr NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_per_km_lkr NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enable RLS on vehicles
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active vehicles
DROP POLICY IF EXISTS "Public Read Access (Vehicles)" ON vehicles;
CREATE POLICY "Public Read Access (Vehicles)"
ON vehicles FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated admin full access to vehicles
DROP POLICY IF EXISTS "Allow authenticated full access to vehicles" ON vehicles;
CREATE POLICY "Allow authenticated full access to vehicles"
ON vehicles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies for 'vehicle-images'
DROP POLICY IF EXISTS "Public Read Access (Vehicle Images Bucket)" ON storage.objects;
CREATE POLICY "Public Read Access (Vehicle Images Bucket)"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Admin Upload Access (Vehicle Images Bucket)" ON storage.objects;
CREATE POLICY "Admin Upload Access (Vehicle Images Bucket)"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Admin Update Access (Vehicle Images Bucket)" ON storage.objects;
CREATE POLICY "Admin Update Access (Vehicle Images Bucket)"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Admin Delete Access (Vehicle Images Bucket)" ON storage.objects;
CREATE POLICY "Admin Delete Access (Vehicle Images Bucket)"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vehicle-images');

-- Seed Signature Fleet Vehicles
INSERT INTO vehicles (
  name,
  category,
  passenger_capacity,
  luggage_capacity,
  passengers_text,
  luggage_text,
  recommended_for,
  display_order,
  transmission,
  fuel_type,
  features,
  price_per_day_usd,
  price_per_day_lkr,
  cover_image,
  is_active
) VALUES 
(
  'Mercedes-Benz E-Class & Toyota Premio',
  'sedan',
  3,
  3,
  '1 - 3 Passengers',
  '2 Large + 2 Carry-on Bags',
  'Couples, solo travelers & executive business trips',
  1,
  'Automatic',
  'Petrol',
  '["Dual-Zone Climate A/C", "Complimentary 4G Wi-Fi", "Leather Ergonomic Seats", "Bottled Mineral Water"]'::jsonb,
  75.00,
  23250.00,
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'Toyota HiAce Super GL Luxury Coach',
  'van',
  7,
  6,
  '4 - 7 Passengers',
  '6 Large Suitcases',
  'Families, small groups & travelers with bulky luggage',
  2,
  'Automatic',
  'Diesel',
  '["Reclining Captain Chairs", "Individual Rear A/C Vents", "High-Roof Panoramic Windows", "USB Fast Chargers at Every Seat"]'::jsonb,
  95.00,
  29450.00,
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'Toyota Coaster Executive Mini Coach',
  'mini_bus',
  18,
  16,
  '8 - 18 Passengers',
  '16+ Suitcases & Gear',
  'Extended families, tour groups & retreat parties',
  3,
  'Manual',
  'Diesel',
  '["Touring PA Audio System", "Heavy-Duty Chilled A/C", "Deep Recline Seats", "Overhead Luggage Compartments"]'::jsonb,
  140.00,
  43400.00,
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  true
)
ON CONFLICT DO NOTHING;

-- Migration: Update site_settings primary contact & WhatsApp numbers
UPDATE site_settings 
SET whatsapp_number = '+94775368357',
    company_phone = '+94 77 536 8357'
WHERE id = 1;
ALTER TABLE site_settings ALTER COLUMN whatsapp_number SET DEFAULT '+94775368357';
ALTER TABLE site_settings ALTER COLUMN company_phone SET DEFAULT '+94 77 536 8357';
