-- SafariKannadiga Gallery Schema Enhancements
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add featured/pinned columns to gallery_locations
ALTER TABLE gallery_locations
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT 0;

-- 2. Add focal point columns to gallery_covers
ALTER TABLE gallery_covers
ADD COLUMN IF NOT EXISTS focal_x INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS focal_y INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS zoom DECIMAL DEFAULT 1.0;

-- 3. Create index for fast featured lookups
CREATE INDEX IF NOT EXISTS idx_gallery_locations_featured
ON gallery_locations (is_featured, featured_order)
WHERE is_featured = TRUE;

-- Verify changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'gallery_locations'
AND column_name IN ('is_featured', 'featured_order');

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'gallery_covers'
AND column_name IN ('focal_x', 'focal_y', 'zoom');
