import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
    getFullGalleryStructure,
    saveImage,
    deleteImage,
    setCoverPhoto
} from '@/lib/gallery-cloud';
import { getLocationFolderPath } from '@/lib/imagekit';

export const maxDuration = 60;

// GET: List Full Structure
export async function GET() {
    try {
        const structure = await getFullGalleryStructure();
        return NextResponse.json(structure);
    } catch (error) {
        console.error('Admin Gallery Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
    }
}

// POST: Upload Image
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const continent = formData.get('continent') as string;
        const location = formData.get('location') as string;
        const country = formData.get('country') as string || undefined; // Optional for now

        if (!file || !continent || !location) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
        }

        const folderPath = getLocationFolderPath(continent, location, country);
        const result = await saveImage(folderPath, file);

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/gallery', 'layout');
            return NextResponse.json({ success: true, path: result.path, url: result.url });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload Failed' }, { status: 500 });
    }
}

// DELETE: Delete Image
export async function DELETE(req: Request) {
    try {
        const { imagePath } = await req.json();

        if (!imagePath) {
            return NextResponse.json({ error: 'Missing image path' }, { status: 400 });
        }

        const result = await deleteImage(imagePath);

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/gallery', 'layout');
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Delete Failed' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { continent, location, imagePath, focalPoint } = await req.json();

        if (!continent || !imagePath) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await setCoverPhoto(continent, imagePath, location, focalPoint);

        if (result.success) {
            // Revalidate everything for immediate reflection
            revalidatePath('/', 'layout');

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Set Cover Error:', error);
        return NextResponse.json({ error: 'Failed to set cover photo' }, { status: 500 });
    }
}
