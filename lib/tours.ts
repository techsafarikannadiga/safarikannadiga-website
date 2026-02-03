/**
 * Tours Management Module
 * =======================
 * 
 * Handles all CRUD operations for upcoming safari tours.
 * Uses Supabase for storage with ImageKit for images/brochures.
 * 
 * @author Samarth V (samarthv.me)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Public client for reading
let supabase: SupabaseClient | null = null;
// Admin client for writing (bypasses RLS)
let supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

if (supabaseUrl && supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// Types
export interface Tour {
    id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    spots_total: number;
    spots_left: number;
    image_url: string | null;
    brochure_url: string | null;
    highlights: string[];
    description: string | null;
    status: 'upcoming' | 'sold-out' | 'completed';
    featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface TourInput {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    spots_total: number;
    spots_left: number;
    image_url?: string | null;
    brochure_url?: string | null;
    highlights?: string[];
    description?: string | null;
    status?: 'upcoming' | 'sold-out' | 'completed';
    featured?: boolean;
}

/**
 * Check if tours feature is available
 */
export function isToursConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey && supabase);
}

/**
 * Get all tours (public)
 */
export async function getTours(options?: {
    status?: 'upcoming' | 'sold-out' | 'completed' | 'all';
    featured?: boolean;
}): Promise<Tour[]> {
    if (!supabase) return [];

    let query = supabase
        .from('upcoming_tours')
        .select('*')
        .order('start_date', { ascending: true });

    if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
    }

    if (options?.featured !== undefined) {
        query = query.eq('featured', options.featured);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching tours:', error);
        return [];
    }

    return data || [];
}

/**
 * Get a single tour by ID
 */
export async function getTourById(id: string): Promise<Tour | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('upcoming_tours')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching tour:', error);
        return null;
    }

    return data;
}

/**
 * Create a new tour (admin only)
 */
export async function createTour(tour: TourInput): Promise<{ success: boolean; tour?: Tour; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { data, error } = await supabaseAdmin
        .from('upcoming_tours')
        .insert([{
            ...tour,
            highlights: tour.highlights || [],
            status: tour.status || 'upcoming',
            featured: tour.featured ?? true,
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating tour:', error);
        return { success: false, error: error.message };
    }

    return { success: true, tour: data };
}

/**
 * Update a tour (admin only)
 */
export async function updateTour(id: string, updates: Partial<TourInput>): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('upcoming_tours')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Error updating tour:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Mark a tour as completed (admin only)
 */
export async function markTourCompleted(id: string): Promise<{ success: boolean; error?: string }> {
    return updateTour(id, { status: 'completed', spots_left: 0 });
}

/**
 * Mark a tour as sold out (admin only)
 */
export async function markTourSoldOut(id: string): Promise<{ success: boolean; error?: string }> {
    return updateTour(id, { status: 'sold-out', spots_left: 0 });
}

/**
 * Delete a tour (admin only)
 */
export async function deleteTour(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('upcoming_tours')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting tour:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get tours for homepage display (upcoming + featured)
 * Sorts: Upcoming/Sold-out (soonest first) -> Completed (most recent first)
 */
export async function getFeaturedTours(): Promise<Tour[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('upcoming_tours')
        .select('*')
        .eq('featured', true)
        .limit(20); // Increased limit to ensure we get enough tours

    if (error) {
        console.error('Error fetching featured tours:', error);
        return [];
    }

    if (!data) return [];

    // Custom sorting:
    // 1. Upcoming & Sold Out tours (sorted by date ASC - soonest first)
    // 2. Completed tours (sorted by date DESC - most recent first)
    const activeTours = data
        .filter(t => t.status !== 'completed')
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    const completedTours = data
        .filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    // Combine and take top 8 (or however many you want to show)
    return [...activeTours, ...completedTours];
}
