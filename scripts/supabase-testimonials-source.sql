-- Add source column to testimonials
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website', -- 'website', 'google', 'facebook'
ADD COLUMN IF NOT EXISTS avatar_url TEXT; -- For external profile pictures

-- Update existing rows
UPDATE testimonials SET source = 'website' WHERE source IS NULL;
