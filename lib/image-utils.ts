/**
 * Simple image URL utility
 * Handles local image paths with fallback to placeholder
 */

/**
 * Normalizes an image path - returns the path or a placeholder if empty
 */
export function normalizeImageUrl(path: string): string {
    if (!path) return '/images/placeholder-safari.jpg';
    return path;
}
