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

// Only create client if configured
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey && supabase);
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
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    const { error } = await supabase
        .from('gallery_locations')
        .insert([location]);
    
    if (error) {
        console.error('Error adding location:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function deleteLocationFromDB(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    const { error } = await supabase
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
    updates: { description?: string; wildlife?: string[]; country?: string }
): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    const { error } = await supabase
        .from('gallery_locations')
        .update(updates)
        .eq('id', id);
    
    if (error) {
        console.error('Error updating location:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function getCoversFromDB(): Promise<Record<string, string>> {
    if (!supabase) return {};
    
    const { data, error } = await supabase
        .from('gallery_covers')
        .select('*');
    
    if (error) {
        console.error('Error fetching covers:', error);
        return {};
    }
    
    const covers: Record<string, string> = {};
    (data || []).forEach((cover: GalleryCoverDB) => {
        covers[cover.location_key] = cover.cover_url;
    });
    return covers;
}

export async function setCoverInDB(locationKey: string, coverUrl: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    // Upsert - insert or update if exists
    const { error } = await supabase
        .from('gallery_covers')
        .upsert(
            { location_key: locationKey, cover_url: coverUrl, updated_at: new Date().toISOString() },
            { onConflict: 'location_key' }
        );
    
    if (error) {
        console.error('Error setting cover:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function deleteCoverFromDB(locationKey: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    const { error } = await supabase
        .from('gallery_covers')
        .delete()
        .eq('location_key', locationKey);
    
    if (error) {
        console.error('Error deleting cover:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}
