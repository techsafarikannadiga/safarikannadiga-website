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

import ImageKit, { toFile } from '@imagekit/nodejs';

// Initialize ImageKit client
const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
});

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
    return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
}

/**
 * Get folder path for a location
 */
export function getLocationFolderPath(continentName: string, locationName: string): string {
    const safeContinentName = sanitizeFolderName(continentName);
    const safeLocationName = sanitizeFolderName(locationName);
    return `${IMAGEKIT_ROOT}/${safeContinentName}/${safeLocationName}`;
}

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
        
        const response = await imagekit.assets.list({
            path: path,
        });

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
export async function uploadFile(
    file: Buffer | ArrayBuffer,
    fileName: string,
    folder: string
): Promise<{ success: boolean; fileId?: string; url?: string; filePath?: string; error?: string }> {
    if (!isImageKitConfigured()) {
        return { success: false, error: 'ImageKit not configured' };
    }

    try {
        // Convert to proper format using toFile helper
        const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
        const uploadableFile = await toFile(buffer, fileName);
        
        // Ensure folder path starts with /
        const folderPath = folder.startsWith('/') ? folder : `/${folder}`;

        const response = await imagekit.files.upload({
            file: uploadableFile,
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
 * Get file details by ID
 */
export async function getFileDetails(fileId: string): Promise<ImageKitFile | null> {
    if (!isImageKitConfigured()) {
        return null;
    }

    try {
        const file = await imagekit.files.get(fileId);
        return {
            fileId: file.fileId || fileId,
            name: file.name || '',
            filePath: file.filePath || '',
            url: file.url || '',
            thumbnailUrl: file.thumbnail || file.url || '',
            width: file.width,
            height: file.height,
            size: file.size || 0,
        };
    } catch (error) {
        console.error('Error getting file details:', error);
        return null;
    }
}

export default imagekit;
