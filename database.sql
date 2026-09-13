-- ==========================================================
-- TripVibe Lanka: Database Schema & Storage Configuration
-- ==========================================================

-- 1. Create Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  popular_attractions JSONB DEFAULT '[]'::jsonb, -- Array of attraction strings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure newly added columns exist if table was already created earlier
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
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_nights INTEGER NOT NULL DEFAULT 0,
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  price_lkr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
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
ALTER TABLE activities ADD COLUMN IF NOT EXISTS price_lkr NUMERIC(12, 2) DEFAULT 0.00;

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
  button_text TEXT NOT NULL DEFAULT 'Claim Seasonal Offer',
  button_link TEXT NOT NULL DEFAULT '/tours',
  validity_text TEXT DEFAULT 'Valid for bookings made this month',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
  button_text,
  button_link,
  validity_text,
  start_date,
  end_date,
  is_active
) 
SELECT 
  'Limited Seasonal Offer',
  'Exclusive Summer Escape',
  'Enjoy up to 15% off bespoke private chauffeured tours across the cultural triangle and southern coast.',
  'VIBELANKA15',
  'Claim Seasonal Offer',
  '#tours',
  'Valid for private bookings reserved this month',
  CURRENT_DATE,
  (CURRENT_DATE + INTERVAL '30 days')::date,
  true
WHERE NOT EXISTS (SELECT 1 FROM banners LIMIT 1);



