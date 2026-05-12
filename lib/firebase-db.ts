import { FieldValue, Timestamp, getFirebaseDb } from './firebase-admin';
import { unstable_cache, revalidateTag } from 'next/cache';

export interface GalleryLocationDB {
    id: string;
    continent_slug: string;
    continent_name: string;
    name: string;
    slug: string;
    country: string;
    description: string;
    wildlife: string[];
    is_featured?: boolean;
    featured_order?: number;
    created_at?: string;
}

export interface GalleryCoverDB {
    id?: string;
    location_key: string;
    cover_url: string;
    focal_x?: number;
    focal_y?: number;
    zoom?: number;
    updated_at?: string;
}

function toPlainDate(value: unknown): string | undefined {
    if (!value) return undefined;
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    return String(value);
}

function normalizeLocation(id: string, data: FirebaseFirestore.DocumentData): GalleryLocationDB {
    return {
        id,
        continent_slug: data.continent_slug || '',
        continent_name: data.continent_name || '',
        name: data.name || '',
        slug: data.slug || '',
        country: data.country || '',
        description: data.description || '',
        wildlife: Array.isArray(data.wildlife) ? data.wildlife : [],
        is_featured: data.is_featured ?? false,
        featured_order: data.featured_order ?? 0,
        created_at: toPlainDate(data.created_at),
    };
}

export function isFirebaseConfigured(): boolean {
    return !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export const isAdminConfigured = isFirebaseConfigured;

/**
 * Internal direct fetcher (bypasses cache wrapper)
 */
async function getLocationsDirect(): Promise<GalleryLocationDB[]> {
    if (!isFirebaseConfigured()) return [];

    const snapshot = await getFirebaseDb()
        .collection('gallery_locations')
        .orderBy('continent_name', 'asc')
        .orderBy('name', 'asc')
        .get();

    return snapshot.docs.map((doc) => normalizeLocation(doc.id, doc.data()));
}

/**
 * Persistent data-cached locations (valid 1hr)
 */
export const getLocationsFromDB = unstable_cache(
    async () => getLocationsDirect(),
    ['gallery-locations'],
    {
        revalidate: 3600, // 1 hour
        tags: ['gallery-locations']
    }
);

export async function addLocationToDB(location: Omit<GalleryLocationDB, 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb()
            .collection('gallery_locations')
            .doc(location.id)
            .set({
                ...location,
                created_at: FieldValue.serverTimestamp(),
            }, { merge: true });

        revalidateTag('gallery-locations', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add location';
        console.error('Error adding location:', error);
        return { success: false, error: message };
    }
}

export async function deleteLocationFromDB(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('gallery_locations').doc(id).delete();
        revalidateTag('gallery-locations', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete location';
        console.error('Error deleting location:', error);
        return { success: false, error: message };
    }
}

export async function updateLocationInDB(
    id: string,
    updates: { name?: string; slug?: string; description?: string; wildlife?: string[]; country?: string }
): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('gallery_locations').doc(id).set(updates, { merge: true });
        revalidateTag('gallery-locations', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update location';
        console.error('Error updating location:', error);
        return { success: false, error: message };
    }
}

/**
 * Internal direct fetcher (bypasses cache wrapper)
 */
async function getCoversDirect(): Promise<Record<string, { cover_url: string; focal_x: number; focal_y: number; zoom: number }>> {
    if (!isFirebaseConfigured()) return {};

    const snapshot = await getFirebaseDb().collection('gallery_covers').get();
    const covers: Record<string, { cover_url: string; focal_x: number; focal_y: number; zoom: number }> = {};

    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const key = data.location_key || doc.id;
        covers[key] = {
            cover_url: data.cover_url || '',
            focal_x: data.focal_x ?? 50,
            focal_y: data.focal_y ?? 50,
            zoom: data.zoom ?? 1,
        };
    });

    return covers;
}

/**
 * Persistent data-cached covers (valid 1hr)
 */
export const getCoversFromDB = unstable_cache(
    async () => getCoversDirect(),
    ['gallery-covers'],
    {
        revalidate: 3600,
        tags: ['gallery-covers']
    }
);

export async function setCoverInDB(
    locationKey: string,
    coverUrl: string,
    focalPoint?: { x: number; y: number; zoom: number }
): Promise<{ success: boolean; error?: string }> {
    try {
        const payload: Record<string, unknown> = {
            location_key: locationKey,
            cover_url: coverUrl,
            updated_at: FieldValue.serverTimestamp(),
        };

        if (focalPoint) {
            payload.focal_x = focalPoint.x;
            payload.focal_y = focalPoint.y;
            payload.zoom = focalPoint.zoom;
        }

        await getFirebaseDb().collection('gallery_covers').doc(locationKey).set(payload, { merge: true });
        revalidateTag('gallery-covers', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to set cover';
        console.error('Error setting cover:', error);
        return { success: false, error: message };
    }
}

export async function deleteCoverFromDB(locationKey: string): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('gallery_covers').doc(locationKey).delete();
        revalidateTag('gallery-covers', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete cover';
        console.error('Error deleting cover:', error);
        return { success: false, error: message };
    }
}

export async function toggleLocationFeatured(
    locationId: string,
    isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('gallery_locations').doc(locationId).set({
            is_featured: isFeatured,
            featured_order: isFeatured ? 0 : 0,
        }, { merge: true });

        revalidateTag('gallery-locations', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update featured location';
        return { success: false, error: message };
    }
}

export async function updateFeaturedOrder(locationId: string, order: number): Promise<{ success: boolean; error?: string }> {
    try {
        await getFirebaseDb().collection('gallery_locations').doc(locationId).set({
            featured_order: order,
        }, { merge: true });

        revalidateTag('gallery-locations', 'max');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update featured order';
        return { success: false, error: message };
    }
}

export async function getVisitCount(): Promise<number> {
    if (!isFirebaseConfigured()) return 0;

    const doc = await getFirebaseDb().collection('site_stats').doc('main').get();
    return Number(doc.data()?.visit_count || 0);
}

export async function incrementVisitCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
        const ref = getFirebaseDb().collection('site_stats').doc('main');
        const count = await getFirebaseDb().runTransaction(async (transaction) => {
            const doc = await transaction.get(ref);
            const nextCount = Number(doc.data()?.visit_count || 0) + 1;
            transaction.set(ref, {
                visit_count: nextCount,
                updated_at: FieldValue.serverTimestamp(),
            }, { merge: true });
            return nextCount;
        });

        return { success: true, count };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to increment visit count';
        return { success: false, error: message };
    }
}
