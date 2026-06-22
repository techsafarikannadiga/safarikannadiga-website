/**
 * Testimonials Management Module
 * ===============================
 *
 * Handles user testimonial submissions and display.
 * Uses Firestore for metadata and ImageKit for photo uploads.
 */

import crypto from 'crypto';
import sharp from 'sharp';
import { FieldValue, Timestamp, getFirebaseDb } from './firebase-admin';
import { isFirebaseConfigured } from './firebase-db';
import { unstable_cache, revalidateTag } from 'next/cache';

const IMAGE_COMPRESSION = {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 80,
};

export interface Testimonial {
    id: string;
    name: string;
    email: string | null;
    safari: string;
    visit_date: string | null;
    rating: number;
    story: string;
    highlights: string | null;
    photos: string[];
    approved: boolean;
    created_at: string;
    source?: 'website' | 'google' | 'facebook';
    avatar_url?: string;
    external_id?: string;
    source_url?: string;
}

export interface TestimonialInput {
    name: string;
    email?: string | null;
    safari: string;
    visit_date?: string | null;
    rating: number;
    story: string;
    highlights?: string | null;
    source?: 'website' | 'google' | 'facebook';
    avatar_url?: string;
    external_id?: string;
    source_url?: string;
    approved?: boolean;
}

function toIso(value: unknown): string {
    if (!value) return new Date().toISOString();
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    return String(value);
}

function normalizeTestimonial(id: string, data: FirebaseFirestore.DocumentData): Testimonial {
    return {
        id,
        name: data.name || '',
        email: data.email || null,
        safari: data.safari || '',
        visit_date: data.visit_date || null,
        rating: Number(data.rating || 5),
        story: data.story || '',
        highlights: data.highlights || null,
        photos: Array.isArray(data.photos) ? data.photos : [],
        approved: data.approved ?? false,
        created_at: toIso(data.created_at),
        source: data.source,
        avatar_url: data.avatar_url,
        external_id: data.external_id,
        source_url: data.source_url,
    };
}

function testimonialDocId(data: TestimonialInput): string | undefined {
    if (!data.external_id) return undefined;
    return crypto.createHash('sha1').update(data.external_id).digest('hex');
}

export function isTestimonialsConfigured(): boolean {
    return isFirebaseConfigured();
}

/**
 * Base internal cached fetcher for all testimonials.
 */
const fetchAllTestimonialsCached = unstable_cache(
    async (): Promise<Testimonial[]> => {
        if (!isFirebaseConfigured()) return [];
        console.log('[Cache Miss] Fetching all testimonials from Firestore');
        const snapshot = await getFirebaseDb().collection('testimonials').get();
        return snapshot.docs
            .map((doc) => normalizeTestimonial(doc.id, doc.data()))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    ['all-testimonials'],
    {
        revalidate: 3600,
        tags: ['testimonials']
    }
);

export async function getApprovedTestimonials(limit?: number): Promise<Testimonial[]> {
    const testimonials = await fetchAllTestimonialsCached();
    const approved = testimonials.filter(t => t.approved);
    return limit ? approved.slice(0, limit) : approved;
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
    return fetchAllTestimonialsCached();
}

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

        return { data: compressedBuffer, name: fileName.replace(/\.[^.]+$/, '.jpg') };
    } catch (error) {
        console.warn('Image compression failed, uploading original:', error);
        return { data: buffer, name: fileName };
    }
}

async function uploadTestimonialPhotos(files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of files.slice(0, 5)) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const { data: compressedData, name: compressedName } = await compressImage(buffer, file.name);
            const { uploadFile } = await import('./imagekit');
            const timestamp = Date.now();
            const result = await uploadFile(
                compressedData,
                `testimonial_${timestamp}_${compressedName}`,
                '/testimonials'
            );

            if (result.success && result.url) uploadedUrls.push(result.url);
        } catch (error) {
            console.error('Error uploading testimonial photo:', error);
        }
    }

    return uploadedUrls;
}

export async function createTestimonial(
    data: TestimonialInput,
    photos?: File[] | string[]
): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        if (!isFirebaseConfigured()) return { success: false, error: 'Database not configured' };

        let photoUrls: string[] = [];
        if (photos && photos.length > 0) {
            if (typeof photos[0] === 'string') {
                photoUrls = photos as string[];
            } else {
                photoUrls = await uploadTestimonialPhotos(photos as File[]);
            }
        }
        const docId = testimonialDocId(data);
        const ref = docId
            ? getFirebaseDb().collection('testimonials').doc(docId)
            : getFirebaseDb().collection('testimonials').doc();

        if (docId) {
            const existing = await ref.get();
            if (existing.exists) return { success: true, id: ref.id };
        }

        await ref.set({
            name: data.name,
            email: data.email ?? null,
            safari: data.safari,
            visit_date: data.visit_date || null,
            rating: data.rating,
            story: data.story,
            highlights: data.highlights || null,
            photos: photoUrls,
            approved: data.approved ?? false,
            source: data.source || 'website',
            avatar_url: data.avatar_url || null,
            external_id: data.external_id || null,
            source_url: data.source_url || null,
            created_at: FieldValue.serverTimestamp(),
        });

        revalidateTag('testimonials', 'max');
        return { success: true, id: ref.id };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create testimonial';
        console.error('Error creating testimonial:', error);
        return { success: false, error: message };
    }
}

export async function approveTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
    return setTestimonialApproval(id, true);
}

export async function unapproveTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
    return setTestimonialApproval(id, false);
}

async function setTestimonialApproval(id: string, approved: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('testimonials').doc(id).set({ approved }, { merge: true });
        revalidateTag('testimonials', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update testimonial';
        return { success: false, error: message };
    }
}

export async function deleteTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('testimonials').doc(id).delete();
        revalidateTag('testimonials', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete testimonial';
        return { success: false, error: message };
    }
}
