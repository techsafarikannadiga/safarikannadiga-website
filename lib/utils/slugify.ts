/**
 * Converts a string to a URL-friendly slug.
 * Logic: lowercase, trim, replace spaces with dashes, remove non-alphanumeric chars (except dash).
 */
export function toSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}
