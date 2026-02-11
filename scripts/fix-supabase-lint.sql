-- Fix Supabase Linter Warnings

-- 1. Fix Function Search Path Mutable for public.get_likes_counts
-- The linter warns that the search_path is not set, which can be a security risk.
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

-- 2. Fix Overly Permissive RLS Policies (DELETE/UPDATE/INSERT with TRUE)
-- These policies allow anyone to delete or update rows, which is dangerous.

-- Gallery Locations (Remove insecure policies)
DROP POLICY IF EXISTS "public_delete" ON gallery_locations;
DROP POLICY IF EXISTS "public_update" ON gallery_locations;
DROP POLICY IF EXISTS "public_insert" ON gallery_locations;
DROP POLICY IF EXISTS "Allow anon delete" ON gallery_locations;
DROP POLICY IF EXISTS "Allow anon update" ON gallery_locations;
DROP POLICY IF EXISTS "Allow anon insert" ON gallery_locations;

-- Gallery Covers (Remove insecure policies)
DROP POLICY IF EXISTS "public_delete" ON gallery_covers;
DROP POLICY IF EXISTS "public_update" ON gallery_covers;
DROP POLICY IF EXISTS "public_insert" ON gallery_covers;
DROP POLICY IF EXISTS "Allow anon delete" ON gallery_covers;
DROP POLICY IF EXISTS "Allow anon update" ON gallery_covers;
DROP POLICY IF EXISTS "Allow anon insert" ON gallery_covers;

-- Note: The valid public policies (e.g., READ) should remain.
-- If you need admin access, ensure you run scripts/supabase-setup-secure.sql to set up secure policies.

-- 3. Subscribers and Testimonials
-- The linter warns about "Public can subscribe" and "public_submit_testimonials" using WITH CHECK (true).
-- These are intentional for public forms, but to be more secure/explicit, you can restrict them to anon/authenticated roles strictly if desired.
-- For now, we leave them as they validly allow public submission, but ensure no DELETE/UPDATE is public.

-- Ensure Subscribers table is secure (no public delete/update)
DROP POLICY IF EXISTS "public_delete" ON subscribers;
DROP POLICY IF EXISTS "public_update" ON subscribers;

-- Ensure Testimonials table is secure (no public delete/update)
DROP POLICY IF EXISTS "public_delete" ON testimonials;
DROP POLICY IF EXISTS "public_update" ON testimonials;
