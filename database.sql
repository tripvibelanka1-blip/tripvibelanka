-- Create Tours Table
CREATE TABLE tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  destination_id UUID, -- Setup as UUID to link to a future 'destinations' table
  duration_days INTEGER NOT NULL DEFAULT 0,
  duration_nights INTEGER NOT NULL DEFAULT 0,
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  price_lkr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  highlights JSONB DEFAULT '[]'::jsonb, -- Expected: Array of strings
  included JSONB DEFAULT '[]'::jsonb, -- Expected: Array of strings
  excluded JSONB DEFAULT '[]'::jsonb, -- Expected: Array of strings
  itinerary JSONB DEFAULT '[]'::jsonb, -- Expected: [{ day: 1, title: '...', details: '...' }]
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb, -- Expected: Array of image URLs
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins full CRUD access
CREATE POLICY "Allow authenticated users full access to tours"
  ON tours
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 1. Create Destinations Table
CREATE TABLE destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Allow authenticated admin access to destinations
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to destinations" ON destinations FOR ALL TO authenticated USING (true);

-- Insert dummy data so our UI dropdown has options to fetch
INSERT INTO destinations (name, description) VALUES 
('Colombo', 'Commercial capital'),
('Kandy', 'Hill capital'),
('Ella', 'Mountain village'),
('Yala', 'Wildlife sanctuary');

-- 2. Setup Storage Bucket for Tour Images
INSERT INTO storage.buckets (id, name, public) VALUES ('tour-images', 'tour-images', true);

-- Allow public read access to images (so they display on the website)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'tour-images');

-- Allow authenticated admins to upload/modify images
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tour-images');
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'tour-images');
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'tour-images');