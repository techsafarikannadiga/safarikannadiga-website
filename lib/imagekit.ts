/**
 * ImageKit Integration Module
 * ===========================
 * 
 * Handles all interactions with ImageKit image storage service.
 * ImageKit provides 20GB free storage with no upload rate limits,
 * making it ideal for wildlife photography galleries.
 * 
 * Features:
 * - Upload images to organized folder structure
 * - List files in folders
 * - Delete individual files or entire folders
 * - Build optimized image URLs with transformations
 * 
 * Folder Structure:
 * safari-gallery/
 *   ├── Africa/
 *   │   ├── Masai-Mara/
 *   │   ├── Amboseli/
 *   │   └── ...
 *   └── Asia/
 *       ├── Ranthambore/
 *       └── ...
 * 
 * @author Samarth V (samarthv.me)
 */

import ImageKit from '@imagekit/nodejs';

// Initialize ImageKit client
console.log('ImageKit Init:', {
    hasKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
    keyLength: process.env.IMAGEKIT_PRIVATE_KEY?.length,
    endpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
});

export const imagekit = new ImageKit({
    // @ts-ignore
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    // @ts-ignore - urlEndpoint is required for SDK to work but missing in types
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/safarikannadiga',
});

/**
 * Get authentication parameters for client-side uploads
 */
export function getAuthParams() {
    // @ts-ignore - v7 SDK: auth params is under helper
    return imagekit.helper.getAuthenticationParameters();
}




// URL endpoint for building image URLs
const URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/safarikannadiga';

// Root folder for all gallery images
const IMAGEKIT_ROOT = 'safari-gallery';

/**
 * Check if ImageKit is configured
 */
export function isImageKitConfigured(): boolean {
    return !!process.env.IMAGEKIT_PRIVATE_KEY;
}

/**
 * Build image URL with optional transformations
 */
export function buildImageUrl(
    imagePath: string,
    options?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    }
): string {
    // If already a full URL, return as-is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Clean up the path
    let cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    // Build transformation string
    const transforms: string[] = [];
    if (options?.width) transforms.push(`w-${options.width}`);
    if (options?.height) transforms.push(`h-${options.height}`);
    if (options?.quality) transforms.push(`q-${options.quality}`);
    if (options?.format && options.format !== 'auto') transforms.push(`f-${options.format}`);

    // ImageKit URL format: https://ik.imagekit.io/account_id/tr:transformations/path
    if (transforms.length > 0) {
        return `${URL_ENDPOINT}/tr:${transforms.join(',')}${cleanPath}`;
    }

    return `${URL_ENDPOINT}${cleanPath}`;
}

/**
 * Sanitize folder name for ImageKit (no spaces allowed)
 */
function sanitizeFolderName(name: string): string {
    return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').replace(/-+/g, '-');
}

/**
 * Get folder path for a location
 */
/**
 * Get folder path for a location
 */
export function getLocationFolderPath(continentName: string, locationName: string, countryName?: string): string {
    const safeContinentName = sanitizeFolderName(continentName);
    const safeLocationName = sanitizeFolderName(locationName);

    if (countryName) {
        const safeCountryName = sanitizeFolderName(countryName.trim());
        return `${IMAGEKIT_ROOT}/${safeContinentName}/${safeCountryName}/${safeLocationName}`;
    }

    return `${IMAGEKIT_ROOT}/${safeContinentName}/${safeLocationName}`;
}

/**
 * Move a file to a new folder
 */
// Old moveFile implementation removed/replaced


export interface ImageKitFile {
    fileId: string;
    name: string;
    filePath: string;
    url: string;
    thumbnailUrl: string;
    width?: number;
    height?: number;
    size: number;
}

/**
 * List all files in a folder
 */
export async function listFiles(folderPath: string): Promise<ImageKitFile[]> {
    if (!isImageKitConfigured()) {
        console.warn('ImageKit not configured');
        return [];
    }

    try {
        // Ensure path starts with /
        const path = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
        // Try listing without filtering first to debug
        const response: any = await imagekit.assets.list({
            path: path,
        });

        console.log(`[listFiles] Path: ${path}, Count: ${response?.length}`);
        if (response?.length === 0) {
            console.log(`[listFiles] WARNING: No files found for ${path}`);
        }

        // Filter to only include files (not folders)
        return response
            .filter((item: any) => item.type === 'file')
            .map((file: any) => ({
                fileId: file.fileId,
                name: file.name,
                filePath: file.filePath,
                url: file.url,
                thumbnailUrl: file.thumbnail || file.url,
                width: file.width,
                height: file.height,
                size: file.size,
            }));
    } catch (error: any) {
        // Handle 404 for empty/non-existent folders
        if (error?.status === 404) {
            return [];
        }
        console.error(`Error listing files from ${folderPath}:`, error);
        return [];
    }
}

/**
 * Upload a file to ImageKit
 */
// Helper to get file details
async function getFileDetails(fileId: string): Promise<any> {
    try {
        const auth = getAuthParams(); // This returns client-side auth, we need server-side?
        // Actually we can use the SDK if possible or fetch.
        // Let's use fetch as fallback since SDK methods seem missing/unreliable.
        if (process.env.IMAGEKIT_PRIVATE_KEY) {
            const authHeader = 'Basic ' + Buffer.from(process.env.IMAGEKIT_PRIVATE_KEY + ':').toString('base64');
            const res = await fetch(`${URL_ENDPOINT.replace('ik.imagekit.io', 'api.imagekit.io/v1/files')}/${fileId}/details`, {
                headers: { 'Authorization': authHeader }
            });
            // Wait, URL_ENDPOINT is `ik.imagekit.io/safarikannadiga`. API is `api.imagekit.io`.
            // Need correct endpoint.
            const apiEndpoint = `https://api.imagekit.io/v1/files/${fileId}/details`;
            const res2 = await fetch(apiEndpoint, {
                headers: { 'Authorization': authHeader }
            });
            if (res2.ok) return await res2.json();
        }
        return null;
    } catch (e) {
        console.error('Get details failed:', e);
        return null;
    }
}

/**
 * Upload a file to ImageKit
 * Accepts Buffer, ArrayBuffer, or URL string (for copy/move)
 */
export async function uploadFile(
    file: Buffer | ArrayBuffer | string,
    fileName: string,
    folder: string
): Promise<{ success: boolean; fileId?: string; url?: string; filePath?: string; error?: string }> {
    if (!isImageKitConfigured()) {
        return { success: false, error: 'ImageKit not configured' };
    }

    try {
        let fileData: any = file;

        // Convert Buffer/ArrayBuffer to base64
        if (typeof file !== 'string') {
            const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
            fileData = buffer.toString('base64');
        }

        // Ensure folder path starts with /
        const folderPath = folder.startsWith('/') ? folder : `/${folder}`;

        const response = await imagekit.files.upload({
            file: fileData,
            fileName: fileName,
            folder: folderPath,
            useUniqueFileName: false,
        });

        return {
            success: true,
            fileId: response.fileId,
            url: response.url,
            filePath: response.filePath,
        };
    } catch (error: any) {
        console.error('Error uploading to ImageKit:', error);
        return {
            success: false,
            error: error?.message || 'Failed to upload image'
        };
    }
}

/**
 * Move a file (Copy + Delete strategy)
 */
export async function moveFile(fileId: string, destinationFolder: string): Promise<{ success: boolean; error?: string }> {
    if (!isImageKitConfigured()) {
        return { success: false, error: 'ImageKit not configured' };
    }

    try {
        // 1. Get file details to find source URL
        const details = await getFileDetails(fileId);
        if (!details || !details.url) {
            return { success: false, error: 'Source file not found or has no URL' };
        }

        // 2. Upload to new destination using Source URL
        const uploadResult = await uploadFile(details.url, details.name, destinationFolder);

        if (!uploadResult.success) {
            return { success: false, error: `Copy failed: ${uploadResult.error}` };
        }

        // 3. Delete original file
        const deleteResult = await deleteFile(fileId);
        if (!deleteResult.success) {
            console.warn(`File moved/copied but original cleanup failed for ${fileId}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error moving file:', error);
        return { success: false, error: error?.message || 'Failed to move file' };
    }
}

/**
 * Delete a file from ImageKit
 */
export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    if (!isImageKitConfigured()) {
        return { success: false, error: 'ImageKit not configured' };
    }

    try {
        await imagekit.files.delete(fileId);
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting from ImageKit:', error);
        return {
            success: false,
            error: error?.message || 'Failed to delete image'
        };
    }
}

/**
 * Create a folder in ImageKit
 */
export async function createFolder(
    folderName: string,
    parentPath: string = '/'
): Promise<{ success: boolean; error?: string }> {
    if (!isImageKitConfigured()) {
        return { success: false, error: 'ImageKit not configured' };
    }

    try {
        await imagekit.folders.create({
            folderName: folderName,
            parentFolderPath: parentPath,
        });
        return { success: true };
    } catch (error: any) {
        // Folder might already exist, which is fine
        if (error?.message?.includes('already exists')) {
            return { success: true };
        }
        console.error('Error creating folder:', error);
        return {
            success: false,
            error: error?.message || 'Failed to create folder'
        };
    }
}

/**
 * Delete a folder and all its contents
 */
export async function deleteFolder(folderPath: string): Promise<{ success: boolean; error?: string }> {
    if (!isImageKitConfigured()) {
        return { success: false, error: 'ImageKit not configured' };
    }

    try {
        // First, list all files in the folder
        const files = await listFiles(folderPath);

        // Delete all files
        for (const file of files) {
            await deleteFile(file.fileId);
        }

        // Delete the folder (ignore 404 if folder doesn't exist)
        try {
            await imagekit.folders.delete({
                folderPath: folderPath.startsWith('/') ? folderPath : `/${folderPath}`,
            });
        } catch (folderError: any) {
            // Ignore 404 - folder might not exist or be empty
            if (folderError?.status !== 404) {
                throw folderError;
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting folder:', error);
        return {
            success: false,
            error: error?.message || 'Failed to delete folder'
        };
    }
}



/**
 * List all files in the account recursively and filter by folder path prefix in memory
 */
export async function listFilesRecursive(folderPath: string): Promise<ImageKitFile[]> {
    if (!isImageKitConfigured()) {
        console.warn('ImageKit not configured');
        return [];
    }

    try {
        // Fetch all files in the account recursively in one call
        // Limit is set to 1000 (ImageKit's maximum per page)
        const response: any = await imagekit.assets.list({
            limit: 1000,
        });

        // Ensure folder path starts with / and ends with /
        let prefix = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
        if (!prefix.endsWith('/')) {
            prefix = `${prefix}/`;
        }

        // Filter to only include files that start with the prefix
        return response
            .filter((item: any) => item.type === 'file' && item.filePath.startsWith(prefix))
            .map((file: any) => ({
                fileId: file.fileId,
                name: file.name,
                filePath: file.filePath,
                url: file.url,
                thumbnailUrl: file.thumbnail || file.url,
                width: file.width,
                height: file.height,
                size: file.size,
            }));
    } catch (error: any) {
        console.error(`Error listing files recursively from ${folderPath}:`, error);
        return [];
    }
}

export default imagekit;
