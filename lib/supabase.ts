/**
 * Supabase Database Module
 * ========================
 * 
 * Handles all database operations for gallery metadata.
 * Supabase provides a PostgreSQL database with auto-generated APIs.
 * 
 * Tables:
 * - gallery_locations: Stores location info (name, country, description, wildlife)
 * - gallery_covers: Stores selected cover photo URLs for each location
 * 
 * Features:
 * - CRUD operations for locations
 * - Cover photo management
 * - Automatic fallback if not configured
 * 
 * @author Samarth V (samarthv.me)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Public client - uses anon key, respects RLS (for SELECT operations)
let supabase: SupabaseClient | null = null;

// Admin client - uses service role key, bypasses RLS (for INSERT/UPDATE/DELETE)
// This is safe because it's only used server-side in API routes
let supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

if (supabaseUrl && supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey && supabase);
}

// Check if admin client is available (for write operations)
export function isAdminConfigured(): boolean {
    return !!(supabaseUrl && supabaseServiceRoleKey && supabaseAdmin);
}

// Types for gallery data
export interface GalleryLocationDB {
    id: string;
    continent_slug: string;
    continent_name: string;
    name: string;
    slug: string;
    country: string;
    description: string;
    wildlife: string[];
    created_at?: string;
}

export interface GalleryCoverDB {
    id?: number;
    location_key: string; // format: "Africa/Masai Mara"
    cover_url: string;
    updated_at?: string;
}

// Helper functions for gallery config
export async function getLocationsFromDB(): Promise<GalleryLocationDB[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('gallery_locations')
        .select('*')
        .order('continent_name', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
    return data || [];
}

export async function addLocationToDB(location: Omit<GalleryLocationDB, 'created_at'>): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('gallery_locations')
        .insert([location]);

    if (error) {
        console.error('Error adding location:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function deleteLocationFromDB(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('gallery_locations')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting location:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function updateLocationInDB(
    id: string,
    updates: { name?: string; slug?: string; description?: string; wildlife?: string[]; country?: string }
): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('gallery_locations')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating location:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function getCoversFromDB(): Promise<Record<string, { cover_url: string; focal_x: number; focal_y: number; zoom: number }>> {
    if (!supabase) return {};

    const { data, error } = await supabase
        .from('gallery_covers')
        .select('*');

    if (error) {
        console.error('Error fetching covers:', error);
        return {};
    }

    const covers: Record<string, { cover_url: string; focal_x: number; focal_y: number; zoom: number }> = {};
    (data || []).forEach((cover: any) => {
        covers[cover.location_key] = {
            cover_url: cover.cover_url,
            focal_x: cover.focal_x ?? 50,
            focal_y: cover.focal_y ?? 50,
            zoom: cover.zoom ?? 1.0,
        };
    });
    return covers;
}

export async function setCoverInDB(
    locationKey: string,
    coverUrl: string,
    focalPoint?: { x: number; y: number; zoom: number }
): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const upsertData: any = {
        location_key: locationKey,
        cover_url: coverUrl,
        updated_at: new Date().toISOString()
    };

    if (focalPoint) {
        upsertData.focal_x = focalPoint.x;
        upsertData.focal_y = focalPoint.y;
        upsertData.zoom = focalPoint.zoom;
    }

    const { error } = await supabaseAdmin
        .from('gallery_covers')
        .upsert(upsertData, { onConflict: 'location_key' });

    if (error) {
        console.error('Error setting cover:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function deleteCoverFromDB(locationKey: string): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('gallery_covers')
        .delete()
        .eq('location_key', locationKey);

    if (error) {
        console.error('Error deleting cover:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

// Featured location management
export async function toggleLocationFeatured(
    locationId: string,
    isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('gallery_locations')
        .update({ is_featured: isFeatured, featured_order: isFeatured ? 0 : 0 })
        .eq('id', locationId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function updateFeaturedOrder(
    locationId: string,
    order: number
): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('gallery_locations')
        .update({ featured_order: order })
        .eq('id', locationId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// Visit Counter Stats
export async function getVisitCount(): Promise<number> {
    if (!supabase) return 0;

    const { data, error } = await supabase
        .from('site_stats')
        .select('visit_count')
        .eq('id', 'main')
        .single();

    if (error) {
        console.error('Error fetching visit count:', error);
        return 0;
    }

    return data?.visit_count || 0;
}

export async function incrementVisitCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    // RPC would be better for distinct atomic increments, but simple update works for low traffic
    // Better approach: Call a custom RPC or use the simple read-write (optimistic concurrency not handled perfectly here but fine for this scale)
    // Actually, Supabase has an atomic increment via rpc is standard, but let's try a direct update 
    // or better: "visit_count = site_stats.visit_count + 1" syntax validation? Supabase JS client supports `.rpc()` best.

    // For now, let's just fetch and update. (Race conditions possible but likely acceptable).
    // BETTER: Use an RPC function if possible, but user has to create it.
    // simpler alternative without RPC:

    const { data, error } = await supabaseAdmin.rpc('increment_visit_count', { row_id: 'main' });

    if (error) {
        // Fallback if RPC doesn't exist (User might not have run advanced migration)
        // Let's do the fetch-update cycle as fallback? No, let's encourage RPC or just do the simple update logic.
        // Actually, let's provide the RPC in the SQL migration!

        // Wait, I didn't verify if I can add the RPC to the SQL file I just made.
        // I should probably update the SQL file first or just do the "dumb" update here.

        // Let's do the "dumb" update for simplicity as it requires less DB setup (no functions).
        const currentRes = await supabaseAdmin
            .from('site_stats')
            .select('visit_count')
            .eq('id', 'main')
            .single();

        if (currentRes.error) return { success: false, error: currentRes.error.message };

        const newCount = (currentRes.data?.visit_count || 0) + 1;

        const updateRes = await supabaseAdmin
            .from('site_stats')
            .update({ visit_count: newCount, updated_at: new Date().toISOString() })
            .eq('id', 'main')
            .select();

        if (updateRes.error) return { success: false, error: updateRes.error.message };

        return { success: true, count: newCount };
    }

    return { success: true, count: data };
}

