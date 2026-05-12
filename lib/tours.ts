/**
 * Tours Management Module
 * =======================
 *
 * Handles all CRUD operations for upcoming safari tours.
 * Uses Firestore for metadata with ImageKit for images/brochures.
 */

import { FieldValue, Timestamp, getFirebaseDb } from './firebase-admin';
import { isFirebaseConfigured } from './firebase-db';
import { unstable_cache, revalidateTag } from 'next/cache';

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
    status: 'upcoming' | 'sold-out' | 'completed' | 'draft';
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
    status?: 'upcoming' | 'sold-out' | 'completed' | 'draft';
    featured?: boolean;
}

function toIso(value: unknown): string {
    if (!value) return new Date().toISOString();
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    return String(value);
}

function normalizeTour(id: string, data: FirebaseFirestore.DocumentData): Tour {
    return {
        id,
        title: data.title || '',
        destination: data.destination || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        spots_total: Number(data.spots_total || 0),
        spots_left: Number(data.spots_left || 0),
        image_url: data.image_url || null,
        brochure_url: data.brochure_url || null,
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        description: data.description || null,
        status: data.status || 'upcoming',
        featured: data.featured ?? true,
        created_at: toIso(data.created_at),
        updated_at: toIso(data.updated_at),
    };
}

export function isToursConfigured(): boolean {
    return isFirebaseConfigured();
}

/**
 * Internal base fetcher wrapped in persistent data cache
 */
const fetchAllToursCached = unstable_cache(
    async (): Promise<Tour[]> => {
        if (!isFirebaseConfigured()) return [];
        console.log('[Cache Miss] Fetching all tours from Firestore');
        const snapshot = await getFirebaseDb().collection('upcoming_tours').get();
        return snapshot.docs.map((doc) => normalizeTour(doc.id, doc.data()));
    },
    ['all-tours'],
    {
        revalidate: 3600,
        tags: ['all-tours']
    }
);

export async function getTours(options?: {
    status?: 'upcoming' | 'sold-out' | 'completed' | 'draft' | 'all';
    featured?: boolean;
    includeDrafts?: boolean;
}): Promise<Tour[]> {
    let tours = await fetchAllToursCached();

    if (options?.status && options.status !== 'all') {
        tours = tours.filter((tour) => tour.status === options.status);
    } else if (!options?.includeDrafts) {
        tours = tours.filter((tour) => tour.status !== 'draft');
    }

    if (options?.featured !== undefined) {
        tours = tours.filter((tour) => tour.featured === options.featured);
    }

    return [...tours].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
}

export async function getTourById(id: string): Promise<Tour | null> {
    const tours = await fetchAllToursCached();
    return tours.find(t => t.id === id) || null;
}

export async function createTour(tour: TourInput): Promise<{ success: boolean; tour?: Tour; error?: string }> {
    try {
        const ref = getFirebaseDb().collection('upcoming_tours').doc();
        const payload = {
            ...tour,
            highlights: tour.highlights || [],
            status: tour.status || 'upcoming',
            featured: tour.featured ?? true,
            image_url: tour.image_url || null,
            brochure_url: tour.brochure_url || null,
            description: tour.description || null,
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
        };

        await ref.set(payload);
        revalidateTag('all-tours', 'max');
        return { success: true, tour: normalizeTour(ref.id, { ...payload, created_at: new Date(), updated_at: new Date() }) };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create tour';
        console.error('Error creating tour:', error);
        return { success: false, error: message };
    }
}

export async function updateTour(id: string, updates: Partial<TourInput>): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('upcoming_tours').doc(id).set({
            ...updates,
            updated_at: FieldValue.serverTimestamp(),
        }, { merge: true });

        revalidateTag('all-tours', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update tour';
        console.error('Error updating tour:', error);
        return { success: false, error: message };
    }
}

export async function markTourCompleted(id: string): Promise<{ success: boolean; error?: string }> {
    return updateTour(id, { status: 'completed', spots_left: 0 });
}

export async function markTourSoldOut(id: string): Promise<{ success: boolean; error?: string }> {
    return updateTour(id, { status: 'sold-out', spots_left: 0 });
}

export async function deleteTour(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('upcoming_tours').doc(id).delete();
        revalidateTag('all-tours', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete tour';
        console.error('Error deleting tour:', error);
        return { success: false, error: message };
    }
}

export async function getFeaturedTours(): Promise<Tour[]> {
    const data = await getTours({ featured: true });

    const activeTours = data
        .filter((tour) => tour.status !== 'completed')
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    const completedTours = data
        .filter((tour) => tour.status === 'completed')
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    return [...activeTours, ...completedTours];
}
