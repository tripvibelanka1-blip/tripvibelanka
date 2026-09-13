-- ==========================================================
-- TripVibe Lanka: Database Schema & Storage Configuration
-- ==========================================================

-- 1. Create Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Allow authenticated admin access to destinations
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full access to destinations" ON destinations;
CREATE POLICY "Allow authenticated full access to destinations" 
  ON destinations 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Allow public read access to destinations so visitors can see destination names
DROP POLICY IF EXISTS "Allow public read access to destinations" ON destinations;
CREATE POLICY "Allow public read access to destinations"
  ON destinations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed destinations if not already present
INSERT INTO destinations (name, description) VALUES 
('Colombo', 'Commercial capital'),
('Kandy', 'Hill capital'),
('Ella', 'Mountain village'),
('Yala', 'Wildlife sanctuary')
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

-- 3. Storage Bucket for Tour Media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tour-images', 'tour-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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