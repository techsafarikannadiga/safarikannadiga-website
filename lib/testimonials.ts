/**
 * Testimonials Management Module
 * ===============================
 * 
 * Handles user testimonial submissions and display.
 * Includes image compression before upload.
 * 
 * @author Samarth V (samarthv.me)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';

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

// Image compression settings
const IMAGE_COMPRESSION = {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 80,
};

// Types
export interface Testimonial {
    id: string;
    name: string;
    email: string;
    safari: string;
    visit_date: string | null;
    rating: number;
    story: string;
    highlights: string | null;
    photos: string[];
    approved: boolean;
    created_at: string;
}

export interface TestimonialInput {
    name: string;
    email: string;
    safari: string;
    visit_date?: string;
    rating: number;
    story: string;
    highlights?: string;
}

/**
 * Check if testimonials feature is available
 */
export function isTestimonialsConfigured(): boolean {
    return !!(supabaseUrl && supabaseAnonKey && supabase);
}

/**
 * Get approved testimonials (public)
 */
export async function getApprovedTestimonials(limit?: number): Promise<Testimonial[]> {
    if (!supabase) return [];

    let query = supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching testimonials:', error);
        return [];
    }

    return data || [];
}

/**
 * Get all testimonials (admin)
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
    if (!supabaseAdmin) return [];

    const { data, error } = await supabaseAdmin
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all testimonials:', error);
        return [];
    }

    return data || [];
}

/**
 * Compress image before upload
 */
async function compressImage(buffer: Buffer, fileName: string): Promise<{ data: Buffer; name: string }> {
    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        if (!metadata.format) {
            return { data: buffer, name: fileName };
        }

        let pipeline = image;
        if ((metadata.width && metadata.width > IMAGE_COMPRESSION.maxWidth) ||
            (metadata.height && metadata.height > IMAGE_COMPRESSION.maxHeight)) {
            pipeline = pipeline.resize(IMAGE_COMPRESSION.maxWidth, IMAGE_COMPRESSION.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        const compressedBuffer = await pipeline
            .jpeg({ quality: IMAGE_COMPRESSION.quality, mozjpeg: true })
            .toBuffer();

        const newName = fileName.replace(/\.[^.]+$/, '.jpg');

        console.log(`Compressed testimonial image: ${(buffer.length / 1024).toFixed(0)}KB → ${(compressedBuffer.length / 1024).toFixed(0)}KB`);

        return { data: compressedBuffer, name: newName };
    } catch (error) {
        console.warn('Image compression failed, uploading original:', error);
        return { data: buffer, name: fileName };
    }
}

/**
 * Upload testimonial photos to ImageKit
 */
async function uploadTestimonialPhotos(files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of files.slice(0, 5)) { // Max 5 photos
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Compress image
            const { data: compressedData, name: compressedName } = await compressImage(buffer, file.name);

            // Upload to ImageKit using the uploadFile function from imagekit.ts
            const { uploadFile } = await import('./imagekit');
            const timestamp = Date.now();
            const result = await uploadFile(
                compressedData,
                `testimonial_${timestamp}_${compressedName}`,
                '/testimonials'
            );

            if (result.success && result.url) {
                uploadedUrls.push(result.url);
            }
        } catch (error) {
            console.error('Error uploading testimonial photo:', error);
        }
    }

    return uploadedUrls;
}


/**
 * Create a new testimonial with photos
 */
export async function createTestimonial(
    data: TestimonialInput,
    photos?: File[]
): Promise<{ success: boolean; id?: string; error?: string }> {
    // Use admin client if available, otherwise fall back to regular client
    const client = supabaseAdmin || supabase;
    if (!client) return { success: false, error: 'Database not configured' };

    // Upload photos if provided
    let photoUrls: string[] = [];
    if (photos && photos.length > 0) {
        photoUrls = await uploadTestimonialPhotos(photos);
    }

    const { data: result, error } = await client
        .from('testimonials')
        .insert([{
            name: data.name,
            email: data.email,
            safari: data.safari,
            visit_date: data.visit_date || null,
            rating: data.rating,
            story: data.story,
            highlights: data.highlights || null,
            photos: photoUrls,
            approved: false, // Requires admin approval
        }])
        .select('id')
        .single();

    if (error) {
        console.error('Error creating testimonial:', error);
        return { success: false, error: error.message };
    }

    return { success: true, id: result?.id };
}

/**
 * Approve a testimonial (admin)
 */
export async function approveTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('testimonials')
        .update({ approved: true })
        .eq('id', id);

    if (error) {
        console.error('Error approving testimonial:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Unapprove a testimonial (admin)
 */
export async function unapproveTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('testimonials')
        .update({ approved: false })
        .eq('id', id);

    if (error) {
        console.error('Error unapproving testimonial:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete a testimonial (admin)
 */
export async function deleteTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) return { success: false, error: 'Admin client not configured' };

    const { error } = await supabaseAdmin
        .from('testimonials')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting testimonial:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
