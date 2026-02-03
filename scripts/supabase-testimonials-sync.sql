-- Add external synchronization columns
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS external_id TEXT, -- Unique ID from Google/FB to prevent duplicates
ADD COLUMN IF NOT EXISTS source_url TEXT; -- Link to the original review

-- Add unique constraint to prevent duplicate imports
ALTER TABLE testimonials ADD CONSTRAINT testimonials_external_id_key UNIQUE (external_id);
