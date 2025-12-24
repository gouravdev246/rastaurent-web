-- =============================================
-- Custom Branding Feature Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create branding table (single-row for restaurant settings)
CREATE TABLE IF NOT EXISTS branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_name TEXT DEFAULT 'My Restaurant',
    logo_url TEXT,
    primary_color TEXT DEFAULT '35 92% 52%',       -- HSL format (amber/orange)
    accent_color TEXT DEFAULT '210 40% 96.1%',     -- HSL format (slate)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default row if none exists
INSERT INTO branding (restaurant_name)
SELECT 'My Restaurant'
WHERE NOT EXISTS (SELECT 1 FROM branding);

-- 2. Create offers table (for promotional banners)
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_text TEXT,                            -- e.g. "40% OFF"
    gradient_from TEXT DEFAULT '#ef4444',          -- Hex color for gradient start
    gradient_to TEXT DEFAULT '#f97316',            -- Hex color for gradient end
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (admins) to manage branding
CREATE POLICY "Admins can manage branding"
ON branding
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users (admins) to manage offers
CREATE POLICY "Admins can manage offers"
ON offers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow public read access to branding (for customer app)
CREATE POLICY "Public can read branding"
ON branding
FOR SELECT
TO anon
USING (true);

-- Policy: Allow public read access to active offers (for customer app)
CREATE POLICY "Public can read active offers"
ON offers
FOR SELECT
TO anon
USING (is_active = true);

-- Create updated_at trigger for branding table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_branding_updated_at
    BEFORE UPDATE ON branding
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();