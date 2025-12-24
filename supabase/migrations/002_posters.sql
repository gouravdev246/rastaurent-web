-- =============================================
-- Posters Feature Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create posters table for promotional banners/images
CREATE TABLE IF NOT EXISTS posters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admins) to manage posters
CREATE POLICY "Admins can manage posters"
ON posters
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow public read access to active posters (for customer app)
CREATE POLICY "Public can read active posters"
ON posters
FOR SELECT
TO anon
USING (is_active = true);

-- Create storage bucket for poster images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policy to allow authenticated users to upload
-- CREATE POLICY "Authenticated users can upload images"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'images');

-- Storage policy to allow public read access
-- CREATE POLICY "Public can view images"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'images');
