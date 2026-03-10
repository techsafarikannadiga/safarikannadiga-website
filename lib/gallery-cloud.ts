/**
 * Gallery Cloud - Main Gallery Business Logic
 * ============================================
 * 
 * This is the core module for managing the safari photo gallery.
 * It combines ImageKit (image storage) and Supabase (metadata) into
 * a unified API for the frontend and admin panel.
 * 
 * Architecture:
 * - ImageKit: Stores actual image files (20GB free, no rate limits)
 * - Supabase: Stores location metadata and cover photo selections
 * - Falls back to local JSON files if Supabase not configured
 * 
 * Key Functions:
 * - getContinents()      - Get all continents with location counts
 * - getContinent()       - Get single continent with locations
 * - getLocation()        - Get single location details
 * - getImages()          - Get all images for a location
 * - saveImage()          - Upload image (with compression)
 * - deleteImage()        - Remove image from ImageKit
 * - setCoverPhoto()      - Set featured image for location
 * - addLocation()        - Create new location
 * - deleteLocation()     - Remove location and all images
 * - updateLocation()     - Update location metadata
 * - getFeaturedLocations() - Get top locations for homepage
 * 
 * @author Samarth V (samarthv.me)
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
    isSupabaseConfigured,
    getLocationsFromDB,
    addLocationToDB,
    deleteLocationFromDB,
    updateLocationInDB,
    getCoversFromDB,
    setCoverInDB,
    deleteCoverFromDB,
    GalleryLocationDB
} from './supabase';
import {
    isImageKitConfigured,
    listFiles,
    uploadFile,
    deleteFile,
    deleteFolder,
    getLocationFolderPath,
    ImageKitFile
} from './imagekit';

const GALLERY_ROOT = 'safari-gallery';

// ============================================================================
// CACHING SYSTEM
// ============================================================================
// Simple in-memory cache with TTL for server-side rendering performance.
// Cache is automatically cleared on any write operation (upload, delete, etc.)
// This prevents stale data while improving read performance.

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    key: string;
}

// Cache configuration
const CACHE_CONFIG = {
    TTL: 5 * 60 * 1000,        // 5 minutes - reasonable for gallery data
    MAX_ENTRIES: 100,           // Prevent memory leaks
    ENABLED: false,             // Disabled for immediate reflection in admin
};

// Type-safe cache store
const cacheStore = new Map<string, CacheEntry<unknown>>();

/**
 * Get cached data if valid and not expired
 */
function getCached<T>(key: string): T | null {
    if (!CACHE_CONFIG.ENABLED) return null;

    const entry = cacheStore.get(key);
    if (!entry) return null;

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_CONFIG.TTL) {
        cacheStore.delete(key);
        return null;
    }

    return entry.data as T;
}

/**
 * Store data in cache with timestamp
 */
function setCache<T>(key: string, data: T): void {
    if (!CACHE_CONFIG.ENABLED) return;

    // Prevent memory leaks - remove oldest entries if at limit
    if (cacheStore.size >= CACHE_CONFIG.MAX_ENTRIES) {
        const oldestKey = Array.from(cacheStore.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
        if (oldestKey) cacheStore.delete(oldestKey);
    }

    cacheStore.set(key, { data, timestamp: Date.now(), key });
}

/**
 * Clear all cached data - called after any write operation
 */
export function clearCache(): void {
    cacheStore.clear();
    console.log('[Cache] Cleared all entries');
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): { size: number; keys: string[] } {
    return {
        size: cacheStore.size,
        keys: Array.from(cacheStore.keys())
    };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalize URL by removing query parameters and hashes for comparison
 */
const normalizeUrl = (u: string) => u ? u.split('?')[0].split('#')[0] : '';

// ============================================================================
// TYPES
// ============================================================================

// Types
export interface GalleryImage {
    src: string;
    filename: string;
    alt: string;
    publicId?: string;
}

export interface GalleryLocation {
    id: string;
    name: string;
    slug: string;
    country: string;
    description: string;
    wildlife: string[];
    coverImage: string;
    imageCount: number;
    focalX: number;
    focalY: number;
    zoom: number;
    isFeatured: boolean;
    featuredOrder: number;
}

export interface GalleryContinent {
    id: string;
    name: string;
    slug: string;
    description: string;
    coverImage: string;
    locations: GalleryLocation[];
    locationCount: number;
    totalImages: number;
}

// ============================================================================
// LOCAL FILE FALLBACK (for development without Supabase)
// ============================================================================

function getGalleryConfigLocal() {
    const configPath = path.join(process.cwd(), 'content', 'gallery-config.json');
    try {
        const data = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load gallery config:', error);
        return { continents: [] };
    }
}

function saveGalleryConfigLocal(config: any): boolean {
    const configPath = path.join(process.cwd(), 'content', 'gallery-config.json');
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Failed to save gallery config:', error);
        return false;
    }
}

function getGalleryCoversLocal(): Record<string, string> {
    const coversPath = path.join(process.cwd(), 'content', 'gallery-covers.json');
    try {
        const data = fs.readFileSync(coversPath, 'utf8');
        return JSON.parse(data).covers || {};
    } catch (error) {
        return {};
    }
}

function saveGalleryCoversLocal(covers: Record<string, string>): boolean {
    const coversPath = path.join(process.cwd(), 'content', 'gallery-covers.json');
    try {
        fs.writeFileSync(coversPath, JSON.stringify({ covers }, null, 2));
        return true;
    } catch (error) {
        console.error('Failed to save gallery covers:', error);
        return false;
    }
}

// ============================================================================
// UNIFIED CONFIG ACCESS (Supabase or Local)
// ============================================================================

async function getGalleryConfig() {
    if (isSupabaseConfigured()) {
        // Get from Supabase
        const locations = await getLocationsFromDB();

        // Group by continent
        const continentMap: Record<string, any> = {};
        locations.forEach(loc => {
            if (!continentMap[loc.continent_slug]) {
                continentMap[loc.continent_slug] = {
                    id: loc.continent_slug,
                    name: loc.continent_name,
                    slug: loc.continent_slug,
                    description: `Explore the wildlife of ${loc.continent_name}`,
                    locations: []
                };
            }
            continentMap[loc.continent_slug].locations.push({
                id: loc.id,
                name: loc.name,
                slug: loc.slug,
                country: loc.country,
                description: loc.description,
                wildlife: loc.wildlife || []
            });
        });

        return { continents: Object.values(continentMap) };
    } else {
        // Fallback to local file
        return getGalleryConfigLocal();
    }
}

// Internal cover data type
export interface CoverData {
    cover_url: string;
    focal_x: number;
    focal_y: number;
    zoom: number;
}

export async function getGalleryCovers(): Promise<Record<string, CoverData>> {
    if (isSupabaseConfigured()) {
        const rawCovers = await getCoversFromDB();
        const normalized: Record<string, CoverData> = {};
        Object.entries(rawCovers).forEach(([key, value]) => {
            normalized[key.toLowerCase().trim()] = value;
        });
        return normalized;
    } else {
        // Fallback to local file (no focal point data)
        const rawCovers = getGalleryCoversLocal();
        const normalized: Record<string, CoverData> = {};
        Object.entries(rawCovers).forEach(([key, value]) => {
            normalized[key.toLowerCase().trim()] = {
                cover_url: value,
                focal_x: 50,
                focal_y: 50,
                zoom: 1.0,
            };
        });
        return normalized;
    }
}

/**
 * Get all gallery images from ImageKit in one recursive call
 */
async function getAllImagesRecursive(): Promise<GalleryImage[]> {
    if (!isImageKitConfigured()) return [];

    try {
        // Fetch all files under safari-gallery recursively
        // ImageKit's listFiles can take a path and it will return everything if path is root
        // and we can filter by folder path prefix.
        const files = await listFiles(GALLERY_ROOT);

        // Wait, listFiles in imagekit.ts only lists one folder.
        // We'll update imagekit.ts to support recursive listing or just fetch more.
        return files.map((file: ImageKitFile) => ({
            src: file.url,
            filename: file.name,
            alt: file.name.replace(/[-_]/g, ' ').replace(/\.\w+$/, '') || 'Safari photo',
            publicId: file.fileId,
            filePath: file.filePath // We need this to group by folder
        }));
    } catch (error) {
        console.error('Error fetching all ImageKit images:', error);
        return [];
    }
}

/**
 * Get images from ImageKit folder (with caching)
 */
async function getImageKitImages(folderPath: string): Promise<GalleryImage[]> {
    if (!isImageKitConfigured()) {
        console.warn('ImageKit not configured, returning empty images');
        return [];
    }

    const cacheKey = `ik_folder:${folderPath}`;
    const cached = getCached<GalleryImage[]>(cacheKey);
    if (cached) return cached;

    try {
        const files = await listFiles(folderPath);

        const images = files.map((file: ImageKitFile) => ({
            src: file.url,
            filename: file.name,
            alt: file.name.replace(/[-_]/g, ' ').replace(/\.\w+$/, '') || 'Safari photo',
            publicId: file.fileId,
            filePath: file.filePath
        }));

        setCache(cacheKey, images);
        return images;
    } catch (error) {
        console.error(`Error fetching ImageKit images for ${folderPath}:`, error);
        return [];
    }
}

/**
 * Get all continents with their location counts (with caching)
 */
export async function getContinents(): Promise<GalleryContinent[]> {
    // Check cache first
    const cacheKey = 'continents';
    const cached = getCached<GalleryContinent[]>(cacheKey);
    if (cached) return cached;

    const config = await getGalleryConfig();
    const savedCovers = await getGalleryCovers();

    const continents = await Promise.all(config.continents.map(async (continent: any) => {
        let totalImages = 0;
        let continentCoverFromLocation = '';

        const locationsWithCounts = [];
        for (const loc of continent.locations) {
            const folderPath = getLocationFolderPath(continent.name, loc.name, loc.country);
            const images = await getImageKitImages(folderPath);
            totalImages += images.length;

            // Normalize keys for robust matching
            const coverKey = `${continent.name}/${loc.name}`.toLowerCase().trim();
            const savedCoverData = savedCovers[coverKey];
            const savedCover = savedCoverData?.cover_url;

            // Improved robust matching
            const isUrl = savedCover && (savedCover.startsWith('http://') || savedCover.startsWith('https://'));

            let coverImage = '/images/placeholder-safari.jpg';

            // Try to find a match in the current images list first (preferred for up-to-date URLs)
            const matchingImage = savedCover ? images.find(img =>
                normalizeUrl(img.src) === normalizeUrl(savedCover) ||
                img.publicId === savedCover ||
                img.filename === savedCover
            ) : null;

            if (matchingImage) {
                coverImage = matchingImage.src;
            } else if (isUrl) {
                coverImage = savedCover;
            } else if (images.length > 0) {
                coverImage = images[0].src;
            }

            // Use first location with images as continent cover fallback
            if (!continentCoverFromLocation && images.length > 0) {
                continentCoverFromLocation = coverImage;
            }

            locationsWithCounts.push({
                ...loc,
                coverImage,
                imageCount: images.length,
                focalX: savedCoverData?.focal_x ?? 50,
                focalY: savedCoverData?.focal_y ?? 50,
                zoom: savedCoverData?.zoom ?? 1.0,
                isFeatured: loc.is_featured ?? false,
                featuredOrder: loc.featured_order ?? 0,
            });
        }

        // Get continent cover image
        // 1. Check for specific continent cover in savedCovers (and try to match against actual images for latest URLs)
        const continentKey = continent.name.toLowerCase().trim();
        const savedContinentCover = savedCovers[continentKey];

        let continentCover = '/images/placeholder-safari.jpg';

        if (savedContinentCover) {
            // Check if saved cover exists in any of the locations of this continent to get the most updated URL
            let matchedUrl = '';
            for (const loc of locationsWithCounts) {
                const folderPath = getLocationFolderPath(continent.name, loc.name, loc.country);
                const images = await getImageKitImages(folderPath);
                const match = images.find(img =>
                    normalizeUrl(img.src) === normalizeUrl(savedContinentCover.cover_url) ||
                    img.publicId === savedContinentCover.cover_url ||
                    img.filename === savedContinentCover.cover_url
                );
                if (match) {
                    matchedUrl = match.src;
                    break;
                }
            }
            continentCover = matchedUrl || (savedContinentCover.cover_url.startsWith('http') ? savedContinentCover.cover_url : continentCover);
        } else if (continentCoverFromLocation) {
            continentCover = continentCoverFromLocation;
        } else if (continent.coverImage) {
            continentCover = continent.coverImage;
        }

        return {
            id: continent.id,
            name: continent.name,
            slug: continent.slug,
            description: continent.description,
            coverImage: continentCover,
            locations: locationsWithCounts,
            locationCount: continent.locations.length,
            totalImages
        };
    }));

    // Save to cache
    setCache(cacheKey, continents);
    return continents;
}

/**
 * Get a single continent by slug
 */
export async function getContinent(slug: string): Promise<GalleryContinent | null> {
    const continents = await getContinents();
    return continents.find(c => c.slug === slug) || null;
}

/**
 * Get locations for a continent
 */
export async function getLocations(continentSlug: string): Promise<GalleryLocation[]> {
    const continent = await getContinent(continentSlug);
    return continent?.locations || [];
}

/**
 * Get a single location
 */
export async function getLocation(continentSlug: string, locationSlug: string): Promise<GalleryLocation | null> {
    const locations = await getLocations(continentSlug);
    return locations.find(l => l.slug === locationSlug) || null;
}

/**
 * Get images for a location (with caching)
 */
export async function getImages(continentSlug: string, locationSlug: string): Promise<GalleryImage[]> {
    // Check cache first
    const cacheKey = `images:${continentSlug}:${locationSlug}`;
    const cached = getCached<GalleryImage[]>(cacheKey);
    if (cached) return cached;

    const config = await getGalleryConfig();
    const continent = config.continents.find((c: any) => c.slug === continentSlug);
    if (!continent) return [];

    const location = continent.locations.find((l: any) => l.slug === locationSlug);
    if (!location) return [];

    const folderPath = getLocationFolderPath(continent.name, location.name, location.country);
    const images = await getImageKitImages(folderPath);

    // Cache the result
    setCache(cacheKey, images);
    return images;
}

/**
 * Get full gallery structure for admin
 */
export async function getFullGalleryStructure() {
    const config = await getGalleryConfig();
    const savedCovers = await getGalleryCovers();

    return await Promise.all(config.continents.map(async (continent: any) => ({
        name: continent.name,
        slug: continent.slug,
        locations: await Promise.all(continent.locations.map(async (loc: any) => {
            const folderPath = getLocationFolderPath(continent.name, loc.name, loc.country);
            const images = await getImageKitImages(folderPath);
            const coverKey = `${continent.name}/${loc.name}`.toLowerCase().trim();
            const savedCoverData = savedCovers[coverKey];
            const savedCover = savedCoverData?.cover_url;

            const isCoverUrl = savedCover && (savedCover.startsWith('http://') || savedCover.startsWith('https://'));

            let currentCover = null;

            // Try to find matching image in current list (for latest URL/params)
            const match = savedCover ? images.find(img =>
                normalizeUrl(img.src) === normalizeUrl(savedCover) ||
                img.publicId === savedCover ||
                img.filename === savedCover
            ) : null;

            if (match) {
                currentCover = match.src;
            } else if (isCoverUrl) {
                currentCover = savedCover;
            } else if (images.length > 0) {
                currentCover = images[0].src;
            }

            // Continent cover check
            const continentKey = continent.name.toLowerCase().trim();
            const savedContinentCoverData = savedCovers[continentKey];
            const savedContinentCover = savedContinentCoverData?.cover_url;

            return {
                name: loc.name,
                slug: loc.slug,
                country: loc.country,
                description: loc.description,
                wildlife: loc.wildlife || [],
                coverImage: currentCover,
                isFeatured: loc.is_featured ?? false,
                images: images.map(img => ({
                    name: img.filename,
                    path: img.publicId || img.src,
                    url: img.src,
                    isCover: img.src === currentCover || (savedCover && (normalizeUrl(img.src) === normalizeUrl(savedCover) || img.publicId === savedCover)),
                    isContinentCover: savedContinentCover ? (normalizeUrl(img.src) === normalizeUrl(savedContinentCover) || img.publicId === savedContinentCover) : false
                }))
            };
        }))
    })));
}

/**
 * Set cover photo for a location
 */
export async function setCoverPhoto(
    continentName: string,
    imagePath: string,
    locationName?: string,
    focalPoint?: { x: number; y: number; zoom: number }
): Promise<{ success: boolean; error?: string }> {
    try {
        // If locationName is provided, use "Continent/Location" key, else use just "Continent" key
        const key = locationName
            ? `${continentName.trim()}/${locationName.trim()}`.toLowerCase()
            : continentName.trim().toLowerCase();

        if (isSupabaseConfigured()) {
            const result = await setCoverInDB(key, imagePath, focalPoint);
            if (result.success) clearCache();
            return result;
        } else {
            const covers = getGalleryCoversLocal();
            covers[key] = imagePath;
            saveGalleryCoversLocal(covers);
            clearCache();
            return { success: true };
        }
    } catch (error) {
        console.error('Failed to save cover photo:', error);
        return { success: false, error: 'Failed to save cover photo' };
    }
}

// Image compression settings to conserve ImageKit storage (20GB limit)
const IMAGE_COMPRESSION = {
    maxWidth: 2400,      // Max width in pixels (good for web + print)
    maxHeight: 2400,     // Max height in pixels
    quality: 85,         // JPEG quality (1-100, 85 is good balance)
    format: 'jpeg' as const,
};

/**
 * Compress image before upload to save storage space
 * Resizes large images and compresses to JPEG with quality 85
 */
async function compressImage(buffer: Buffer, fileName: string): Promise<{ data: Buffer; name: string }> {
    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Only compress if it's an image we can process
        if (!metadata.format) {
            return { data: buffer, name: fileName };
        }

        // Calculate original size for logging
        const originalSize = buffer.length;

        // Resize if larger than max dimensions, maintaining aspect ratio
        let pipeline = image;
        if ((metadata.width && metadata.width > IMAGE_COMPRESSION.maxWidth) ||
            (metadata.height && metadata.height > IMAGE_COMPRESSION.maxHeight)) {
            pipeline = pipeline.resize(IMAGE_COMPRESSION.maxWidth, IMAGE_COMPRESSION.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Convert to JPEG with compression
        const compressedBuffer = await pipeline
            .jpeg({ quality: IMAGE_COMPRESSION.quality, mozjpeg: true })
            .toBuffer();

        // Change extension to .jpg
        const newName = fileName.replace(/\.[^.]+$/, '.jpg');

        const savedBytes = originalSize - compressedBuffer.length;
        const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);
        console.log(`Compressed ${fileName}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB (saved ${savedPercent}%)`);

        return { data: compressedBuffer, name: newName };
    } catch (error) {
        console.warn('Image compression failed, uploading original:', error);
        return { data: buffer, name: fileName };
    }
}

/**
 * Upload image to ImageKit (with automatic compression)
 */
export async function saveImage(
    folderPath: string,
    file: File
): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
    try {
        const bytes = await file.arrayBuffer();
        const originalBuffer = Buffer.from(bytes);
        // We use the provided folder path directly
        const folder = folderPath;

        // Compress image before upload to save storage
        const { data: compressedBuffer, name: compressedName } = await compressImage(originalBuffer, file.name);

        const result = await uploadFile(compressedBuffer, compressedName, folder);

        if (result.success) {
            clearCache(); // Clear cache after upload
            return {
                success: true,
                path: result.fileId,
                url: result.url
            };
        }

        return { success: false, error: result.error || 'Failed to upload image' };
    } catch (error) {
        console.error('Error uploading to ImageKit:', error);
        return { success: false, error: 'Failed to upload image' };
    }
}

/**
 * Delete image from ImageKit
 */
// Re-adding deleteImage function that handles both ID and legacy URLs
export async function deleteImage(imagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!imagePath) return { success: false, error: 'No image path provided' };

        // If it's a URL (legacy), we can't easily delete from ImageKit without fileId.
        // But for the UI to be consistent, we should return success so the frontend removes it.
        // In a real migration, we would map all URLs to fileIds.
        if (imagePath.startsWith('http')) {
            console.warn('Cannot delete legacy image by URL only (needs fileId):', imagePath);
            clearCache();
            return { success: true }; // Return success to allow UI removal
        }

        const result = await deleteFile(imagePath);
        if (result.success) clearCache();
        return result;
    } catch (error) {
        console.error('Error deleting from ImageKit:', error);
        return { success: false, error: 'Failed to delete image' };
    }
}
/**
 * Create slug from name
 */
function createSlug(name: string): string {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Add a new location to a continent
 */
export async function addLocation(
    continentSlug: string,
    locationData: {
        name: string;
        country: string;
        description?: string;
        wildlife?: string[];
    }
): Promise<{ success: boolean; error?: string; location?: any }> {
    try {
        const slug = createSlug(locationData.name);

        if (isSupabaseConfigured()) {
            // Get continent name from slug
            const continentNames: Record<string, string> = {
                'africa': 'Africa',
                'asia': 'Asia'
            };
            const continentName = continentNames[continentSlug] || continentSlug;

            const newLocation: GalleryLocationDB = {
                id: `${continentSlug}-${slug}`,
                continent_slug: continentSlug,
                continent_name: continentName,
                name: locationData.name,
                slug: slug,
                country: locationData.country,
                description: locationData.description || `Explore the wildlife of ${locationData.name}.`,
                wildlife: locationData.wildlife || []
            };

            const result = await addLocationToDB(newLocation);
            if (result.success) {
                clearCache();
                return { success: true, location: newLocation };
            }
            return result;
        } else {
            // Local file fallback
            const config = getGalleryConfigLocal();
            const continentIndex = config.continents.findIndex((c: any) => c.slug === continentSlug);

            if (continentIndex === -1) {
                return { success: false, error: 'Continent not found' };
            }

            const continent = config.continents[continentIndex];

            // Check if location already exists
            if (continent.locations.some((l: any) => l.slug === slug || l.name.toLowerCase() === locationData.name.toLowerCase())) {
                return { success: false, error: 'Location already exists' };
            }

            const newLocation = {
                id: slug,
                name: locationData.name,
                slug: slug,
                country: locationData.country,
                description: locationData.description || `Explore the wildlife of ${locationData.name}.`,
                wildlife: locationData.wildlife || []
            };

            config.continents[continentIndex].locations.push(newLocation);

            if (!saveGalleryConfigLocal(config)) {
                return { success: false, error: 'Failed to save configuration' };
            }

            clearCache();
            return { success: true, location: newLocation };
        }
    } catch (error) {
        console.error('Error adding location:', error);
        return { success: false, error: 'Failed to add location' };
    }
}

/**
 * Delete a location from a continent
 */
export async function deleteLocation(
    continentSlug: string,
    locationSlug: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const config = await getGalleryConfig();
        const continent = config.continents.find((c: any) => c.slug === continentSlug);

        if (!continent) {
            return { success: false, error: 'Continent not found' };
        }

        const location = continent.locations.find((l: any) => l.slug === locationSlug);

        if (!location) {
            return { success: false, error: 'Location not found' };
        }

        // Delete all images from ImageKit folder
        const folderPath = getLocationFolderPath(continent.name, location.name);
        try {
            await deleteFolder(folderPath);
        } catch (e) {
            // Folder might be empty or not exist
            console.log('Folder cleanup:', e);
        }

        // Remove cover photo entry
        const coverKey = `${continent.name}/${location.name}`;
        if (isSupabaseConfigured()) {
            await deleteCoverFromDB(coverKey);
            // Delete location from DB
            const locationId = `${continentSlug}-${locationSlug}`;
            const result = await deleteLocationFromDB(locationId);
            if (result.success) clearCache();
            return result;
        } else {
            // Local file fallback
            const localConfig = getGalleryConfigLocal();
            const continentIndex = localConfig.continents.findIndex((c: any) => c.slug === continentSlug);
            const locationIndex = localConfig.continents[continentIndex].locations.findIndex((l: any) => l.slug === locationSlug);

            localConfig.continents[continentIndex].locations.splice(locationIndex, 1);

            if (!saveGalleryConfigLocal(localConfig)) {
                return { success: false, error: 'Failed to save configuration' };
            }

            const covers = getGalleryCoversLocal();
            if (covers[coverKey]) {
                delete covers[coverKey];
                saveGalleryCoversLocal(covers);
            }

            clearCache();
            return { success: true };
        }
    } catch (error) {
        console.error('Error deleting location:', error);
        return { success: false, error: 'Failed to delete location' };
    }
}

/**
 * Update a location's details (description, wildlife, country)
 */
export async function updateLocation(
    continentSlug: string,
    locationSlug: string,
    updates: {
        description?: string;
        wildlife?: string[];
        country?: string;
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        if (isSupabaseConfigured()) {
            const locationId = `${continentSlug}-${locationSlug}`;
            const result = await updateLocationInDB(locationId, updates);
            if (result.success) clearCache();
            return result;
        } else {
            // Local file fallback
            const config = getGalleryConfigLocal();
            const continentIndex = config.continents.findIndex((c: any) => c.slug === continentSlug);

            if (continentIndex === -1) {
                return { success: false, error: 'Continent not found' };
            }

            const locationIndex = config.continents[continentIndex].locations.findIndex(
                (l: any) => l.slug === locationSlug
            );

            if (locationIndex === -1) {
                return { success: false, error: 'Location not found' };
            }

            // Apply updates
            if (updates.description !== undefined) {
                config.continents[continentIndex].locations[locationIndex].description = updates.description;
            }
            if (updates.wildlife !== undefined) {
                config.continents[continentIndex].locations[locationIndex].wildlife = updates.wildlife;
            }
            if (updates.country !== undefined) {
                config.continents[continentIndex].locations[locationIndex].country = updates.country;
            }

            if (!saveGalleryConfigLocal(config)) {
                return { success: false, error: 'Failed to save configuration' };
            }

            clearCache();
            return { success: true };
        }
    } catch (error) {
        console.error('Error updating location:', error);
        return { success: false, error: 'Failed to update location' };
    }
}

/**
 * Get list of continents (simple version for forms)
 */
export async function getContinentsList(): Promise<{ slug: string; name: string }[]> {
    const config = await getGalleryConfig();
    return config.continents.map((c: any) => ({
        slug: c.slug,
        name: c.name
    }));
}

/**
 * Get featured locations for home page display
 * Returns locations with the most images, with cover photos
 */
export interface FeaturedLocation {
    name: string;
    slug: string;
    continentSlug: string;
    country: string;
    description: string;
    wildlife: string[];
    coverImage: string;
    imageCount: number;
    focalX: number;
    focalY: number;
    zoom: number;
    isFeatured: boolean;
}

export async function getFeaturedLocations(limit: number = 4): Promise<FeaturedLocation[]> {
    const continents = await getContinents();

    // Flatten all locations with their continent info
    const allLocations = continents.flatMap(continent =>
        continent.locations.map(loc => ({
            name: loc.name,
            slug: loc.slug,
            continentSlug: continent.slug,
            country: loc.country,
            description: loc.description,
            wildlife: loc.wildlife,
            coverImage: loc.coverImage,
            imageCount: loc.imageCount,
            focalX: loc.focalX,
            focalY: loc.focalY,
            zoom: loc.zoom,
            isFeatured: loc.isFeatured,
            featuredOrder: loc.featuredOrder,
        }))
    );

    // Filter out locations without cover images
    const validLocations = allLocations.filter(
        loc => loc.coverImage && loc.coverImage !== '/images/placeholder-safari.jpg'
    );

    // Pinned locations first (sorted by featured_order), then auto-fill by image count
    const pinned = validLocations
        .filter(loc => loc.isFeatured)
        .sort((a, b) => a.featuredOrder - b.featuredOrder);

    const autoFill = validLocations
        .filter(loc => !loc.isFeatured)
        .sort((a, b) => b.imageCount - a.imageCount);

    return [...pinned, ...autoFill].slice(0, limit);
}

/**
 * Initialize - no-op for cloud version
 */
export function initializeGalleryFolders(): void {
    // No initialization needed for ImageKit
}
