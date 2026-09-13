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