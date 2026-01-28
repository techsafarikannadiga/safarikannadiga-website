-- Supabase SQL Setup for SafariKannadiga Gallery
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- Gallery Locations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS gallery_locations (
    id TEXT PRIMARY KEY,
    continent_slug TEXT NOT NULL,
    continent_name TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT,
    wildlife TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_locations_continent ON gallery_locations(continent_slug);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery_locations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON gallery_locations
    FOR SELECT USING (true);

-- Allow authenticated write access (or use anon for simpler setup)
CREATE POLICY "Allow anon insert" ON gallery_locations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon delete" ON gallery_locations
    FOR DELETE USING (true);

CREATE POLICY "Allow anon update" ON gallery_locations
    FOR UPDATE USING (true);

-- ============================================================================
-- Gallery Covers Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS gallery_covers (
    id SERIAL PRIMARY KEY,
    location_key TEXT UNIQUE NOT NULL, -- format: "Africa/Masai Mara"
    cover_url TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery_covers ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON gallery_covers
    FOR SELECT USING (true);

-- Allow authenticated write access
CREATE POLICY "Allow anon insert" ON gallery_covers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon delete" ON gallery_covers
    FOR DELETE USING (true);

CREATE POLICY "Allow anon update" ON gallery_covers
    FOR UPDATE USING (true);

-- ============================================================================
-- Seed Initial Data (Africa Locations)
-- ============================================================================
INSERT INTO gallery_locations (id, continent_slug, continent_name, name, slug, country, description, wildlife)
VALUES 
    ('africa-masai-mara', 'africa', 'Africa', 'Masai Mara', 'masai-mara', 'Kenya', 'Experience the iconic Great Migration and witness the circle of life unfold in Africa''s most famous game reserve.', ARRAY['Lions', 'Elephants', 'Wildebeest', 'Zebras', 'Cheetahs', 'Hippos']),
    ('africa-amboseli', 'africa', 'Africa', 'Amboseli', 'amboseli', 'Kenya', 'Marvel at massive elephant herds against the backdrop of Mount Kilimanjaro.', ARRAY['Elephants', 'Lions', 'Cheetahs', 'Hippos']),
    ('africa-samburu', 'africa', 'Africa', 'Samburu', 'samburu', 'Kenya', 'Discover unique northern species including reticulated giraffes and Grevy''s zebras.', ARRAY['Reticulated Giraffe', 'Grevy''s Zebra', 'Gerenuk', 'Somali Ostrich']),
    ('africa-lake-nakuru', 'africa', 'Africa', 'Lake Nakuru', 'lake-nakuru', 'Kenya', 'Witness thousands of flamingos painting the lake pink and spot rhinos.', ARRAY['Flamingos', 'Rhinos', 'Baboons', 'Waterbuck']),
    ('africa-nairobi-national-park', 'africa', 'Africa', 'Nairobi National Park', 'nairobi-national-park', 'Kenya', 'Experience wildlife against the Nairobi city skyline.', ARRAY['Lions', 'Giraffes', 'Rhinos', 'Buffalo']),
    ('africa-lake-naivasha', 'africa', 'Africa', 'Lake Naivasha', 'lake-naivasha', 'Kenya', 'Explore this freshwater lake teeming with hippos and over 400 bird species.', ARRAY['Hippos', 'Fish Eagles', 'Pelicans', 'Cormorants']),
    ('africa-lake-elementaita', 'africa', 'Africa', 'Lake Elementaita', 'lake-elementaita', 'Kenya', 'A serene soda lake known for flamingos and pelicans.', ARRAY['Flamingos', 'Pelicans', 'Zebras']),
    ('africa-olpejeta', 'africa', 'Africa', 'Olpejeta', 'olpejeta', 'Kenya', 'Home to the largest black rhino sanctuary in East Africa.', ARRAY['Black Rhinos', 'White Rhinos', 'Chimpanzees', 'Lions']),
    ('africa-tsavo', 'africa', 'Africa', 'Tsavo', 'tsavo', 'Kenya', 'Kenya''s largest national park, famous for its red elephants.', ARRAY['Red Elephants', 'Lions', 'Leopards', 'Hippos'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Seed Initial Data (Asia Locations)
-- ============================================================================
INSERT INTO gallery_locations (id, continent_slug, continent_name, name, slug, country, description, wildlife)
VALUES 
    ('asia-ranthambore', 'asia', 'Asia', 'Ranthambore', 'ranthambore', 'India', 'One of the best places in India to spot Bengal tigers in the wild.', ARRAY['Bengal Tigers', 'Leopards', 'Sloth Bears', 'Crocodiles']),
    ('asia-kaziranga', 'asia', 'Asia', 'Kaziranga', 'kaziranga', 'India', 'Home to two-thirds of the world''s one-horned rhinos.', ARRAY['One-Horned Rhinos', 'Tigers', 'Elephants', 'Wild Buffalo']),
    ('asia-bandhavgarh', 'asia', 'Asia', 'Bandhavgarh', 'bandhavgarh', 'India', 'Known for the highest density of tigers in India.', ARRAY['Bengal Tigers', 'Leopards', 'Deer', 'Wild Boar'])
ON CONFLICT (id) DO NOTHING;
