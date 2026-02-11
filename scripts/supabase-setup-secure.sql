-- Supabase SQL Setup for SafariKannadiga Gallery
-- SECURE VERSION with proper RLS policies
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: Drop existing permissive policies
-- ============================================================================
DROP POLICY IF EXISTS "Allow anon insert" ON gallery_locations;
DROP POLICY IF EXISTS "Allow anon delete" ON gallery_locations;
DROP POLICY IF EXISTS "Allow anon update" ON gallery_locations;
DROP POLICY IF EXISTS "public_insert" ON gallery_locations;
DROP POLICY IF EXISTS "public_delete" ON gallery_locations;
DROP POLICY IF EXISTS "public_update" ON gallery_locations;

DROP POLICY IF EXISTS "Allow anon insert" ON gallery_covers;
DROP POLICY IF EXISTS "Allow anon delete" ON gallery_covers;
DROP POLICY IF EXISTS "Allow anon update" ON gallery_covers;
DROP POLICY IF EXISTS "public_insert" ON gallery_covers;
DROP POLICY IF EXISTS "public_delete" ON gallery_covers;
DROP POLICY IF EXISTS "public_update" ON gallery_covers;

-- ============================================================================
-- STEP 2: Create admin_users table for authentication
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add your admin email(s)
INSERT INTO admin_users (email) 
VALUES ('Safarikannadiga@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 3: Create secure RLS policies for gallery_locations
-- ============================================================================

-- Public can read (SELECT) - this is fine for a gallery
CREATE POLICY "public_read" ON gallery_locations
    FOR SELECT USING (true);

-- Only authenticated users with admin email can INSERT
CREATE POLICY "admin_insert" ON gallery_locations
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
    );

-- Only authenticated users with admin email can UPDATE
CREATE POLICY "admin_update" ON gallery_locations
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
    );

-- Only authenticated users with admin email can DELETE
CREATE POLICY "admin_delete" ON gallery_locations
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
    );

-- ============================================================================
-- STEP 4: Create secure RLS policies for gallery_covers
-- ============================================================================

-- Public can read (SELECT) - this is fine for displaying covers
CREATE POLICY "public_read" ON gallery_covers
    FOR SELECT USING (true);

-- Only authenticated users with admin email can INSERT
CREATE POLICY "admin_insert" ON gallery_covers
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
    );

-- Only authenticated users with admin email can UPDATE
CREATE POLICY "admin_update" ON gallery_covers
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
    );

-- Only authenticated users with admin email can DELETE
CREATE POLICY "admin_delete" ON gallery_covers
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
    );

-- ============================================================================
-- ALTERNATIVE: Simple API Key approach (if you don't want full auth)
-- ============================================================================
-- If you prefer a simpler approach without user authentication,
-- you can create a service role key in Supabase and use it only
-- in server-side API routes. This keeps your anon key safe for
-- public read access only.
--
-- Steps:
-- 1. Get your service_role key from Supabase Dashboard > Settings > API
-- 2. Add it to your .env.local as SUPABASE_SERVICE_ROLE_KEY
-- 3. Create a separate Supabase client for admin operations that uses
--    the service role key instead of the anon key
-- 4. Use the following simpler policies (public read, no write):

-- DROP POLICY "admin_insert" ON gallery_locations;
-- DROP POLICY "admin_update" ON gallery_locations;
-- DROP POLICY "admin_delete" ON gallery_locations;
-- The service role key bypasses RLS entirely, so no write policies needed

-- ============================================================================
-- NOTE: After running this script, your admin panel will need authentication
-- to work. You'll need to implement Supabase Auth in your admin routes.
-- ============================================================================
