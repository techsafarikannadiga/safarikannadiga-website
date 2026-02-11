-- Gallery Likes System
-- Run this in Supabase SQL Editor

-- Table to track individual likes (to prevent spam)
CREATE TABLE IF NOT EXISTS image_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_path TEXT NOT NULL,
    user_hash TEXT, -- Minimal anonymous identifier (e.g. hash of IP + user agent)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster counting
CREATE INDEX IF NOT EXISTS idx_image_likes_path ON image_likes(image_path);
CREATE INDEX IF NOT EXISTS idx_image_likes_user ON image_likes(image_path, user_hash);

-- Enable RLS
ALTER TABLE image_likes ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public read access (though we'll mostly use RPC or server-side grouping)
CREATE POLICY "Likes are viewable by everyone" ON image_likes
    FOR SELECT USING (true);

-- Functions
-- RPC to get like counts for a list of images - efficient batching
CREATE OR REPLACE FUNCTION get_likes_counts(paths TEXT[])
RETURNS TABLE (image_path TEXT, count BIGINT) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT il.image_path, COUNT(*) as count
    FROM image_likes il
    WHERE il.image_path = ANY(paths)
    GROUP BY il.image_path;
END;
$$;
