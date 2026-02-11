-- SafariKannadiga - Tours & Testimonials Tables Setup
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- UPCOMING TOURS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS upcoming_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    spots_total INTEGER NOT NULL DEFAULT 12,
    spots_left INTEGER NOT NULL DEFAULT 12,
    image_url TEXT,                    -- Hero image from ImageKit
    brochure_url TEXT,                 -- PDF/link to brochure
    highlights TEXT[] DEFAULT '{}',    -- Array of highlight strings
    description TEXT,                  -- Optional long description
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'sold-out', 'completed')),
    featured BOOLEAN DEFAULT true,     -- Show on homepage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_upcoming_tours_dates ON upcoming_tours(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_upcoming_tours_status ON upcoming_tours(status);

-- Enable RLS
ALTER TABLE upcoming_tours ENABLE ROW LEVEL SECURITY;

-- Public can read all tours
CREATE POLICY "public_read_tours" ON upcoming_tours
    FOR SELECT USING (true);

-- Admin operations use service role (bypasses RLS)
-- No INSERT/UPDATE/DELETE policies needed since we use service role key

-- ============================================================================
-- TESTIMONIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    safari TEXT NOT NULL,              -- Which safari they went on
    visit_date TEXT,                   -- e.g., "2025-01"
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    story TEXT NOT NULL,
    highlights TEXT,                   -- Wildlife sightings
    photos TEXT[] DEFAULT '{}',        -- Array of ImageKit URLs (max 5)
    approved BOOLEAN DEFAULT false,    -- Admin approval flag
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at DESC);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can only read APPROVED testimonials
CREATE POLICY "public_read_approved_testimonials" ON testimonials
    FOR SELECT USING (approved = true);

-- Public can submit testimonials (INSERT) with basic validation
-- We allow this via anon key so users can submit without authentication
CREATE POLICY "public_submit_testimonials" ON testimonials
    FOR INSERT 
    WITH CHECK (
        length(name) >= 2 AND 
        rating >= 1 AND 
        rating <= 5 AND 
        length(story) > 10
    );

-- Admin operations (UPDATE/DELETE) use service role (bypasses RLS)

-- ============================================================================
-- SEED SAMPLE DATA (Optional - remove in production)
-- ============================================================================

-- Sample upcoming tour
INSERT INTO upcoming_tours (title, destination, start_date, end_date, spots_total, spots_left, highlights, status, featured)
VALUES (
    'Kenya Safari Adventure',
    'Masai Mara, Kenya',
    '2026-06-15',
    '2026-06-25',
    10,
    8,
    ARRAY['Great Migration', 'Big Five Sightings', 'Luxury Tented Camps', 'Expert Guides'],
    'upcoming',
    true
)
ON CONFLICT DO NOTHING;

-- Sample approved testimonial
INSERT INTO testimonials (name, email, safari, visit_date, rating, story, highlights, approved)
VALUES (
    'John Smith',
    'john@example.com',
    'Masai Mara, Kenya',
    '2025-09',
    5,
    'An absolutely incredible experience! We saw the Big Five in just two days. Our guide was extremely knowledgeable and made sure we had the best viewing positions. The accommodations were luxurious beyond expectation. Highly recommend SafariKannadiga!',
    'Lions, Elephants, Leopards, Great Migration',
    true
)
ON CONFLICT DO NOTHING;
