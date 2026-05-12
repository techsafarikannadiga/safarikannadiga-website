import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
    getTours,
    createTour,
    updateTour,
    deleteTour,
    markTourCompleted,
    markTourSoldOut,
    TourInput
} from '@/lib/tours';
import { saveImage } from '@/lib/gallery-cloud';
import { recordAuditTrail } from '@/lib/audit';

// GET: List all tours
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') as 'upcoming' | 'sold-out' | 'completed' | 'draft' | 'all' | null;
        const featured = searchParams.get('featured');

        const tours = await getTours({
            status: status || 'all',
            featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
            includeDrafts: true,
        });

        return NextResponse.json(tours);
    } catch (error) {
        console.error('Tours Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
    }
}

// POST: Create a new tour
export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Extract tour data
        const tourData: TourInput = {
            title: formData.get('title') as string,
            destination: formData.get('destination') as string,
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
            spots_total: parseInt(formData.get('spots_total') as string) || 12,
            spots_left: parseInt(formData.get('spots_left') as string) || 12,
            highlights: JSON.parse(formData.get('highlights') as string || '[]'),
            description: formData.get('description') as string || null,
            status: (formData.get('status') as 'upcoming' | 'sold-out' | 'completed' | 'draft') || 'upcoming',
            featured: formData.get('featured') === 'true',
            brochure_url: formData.get('brochure_url') as string || null,
        };

        // Validate required fields
        if (!tourData.title || !tourData.destination || !tourData.start_date || !tourData.end_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Handle image upload if provided
        const imageFile = formData.get('image') as File | null;
        if (imageFile && imageFile.size > 0) {
            const uploadResult = await saveImage('/tours', imageFile);
            if (uploadResult.success && uploadResult.url) {
                tourData.image_url = uploadResult.url;
            }
        }

        const result = await createTour(tourData);

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/tours', 'layout');
            await recordAuditTrail('CREATE', 'TOUR', result.tour?.id || tourData.title, {
                title: tourData.title,
                destination: tourData.destination,
            });
            return NextResponse.json({ success: true, tour: result.tour });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Tour Create Error:', error);
        return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 });
    }
}

// PUT: Update a tour
export async function PUT(req: Request) {
    try {
        const formData = await req.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return NextResponse.json({ error: 'Tour ID required' }, { status: 400 });
        }

        const updates: Partial<TourInput> = {};

        // Only include fields that are provided
        if (formData.has('title')) updates.title = formData.get('title') as string;
        if (formData.has('destination')) updates.destination = formData.get('destination') as string;
        if (formData.has('start_date')) updates.start_date = formData.get('start_date') as string;
        if (formData.has('end_date')) updates.end_date = formData.get('end_date') as string;
        if (formData.has('spots_total')) updates.spots_total = parseInt(formData.get('spots_total') as string);
        if (formData.has('spots_left')) updates.spots_left = parseInt(formData.get('spots_left') as string);
        if (formData.has('highlights')) updates.highlights = JSON.parse(formData.get('highlights') as string);
        if (formData.has('description')) updates.description = formData.get('description') as string;
        if (formData.has('status')) updates.status = formData.get('status') as 'upcoming' | 'sold-out' | 'completed' | 'draft';
        if (formData.has('featured')) updates.featured = formData.get('featured') === 'true';
        if (formData.has('brochure_url')) updates.brochure_url = formData.get('brochure_url') as string;

        // Handle image upload if provided
        const imageFile = formData.get('image') as File | null;
        if (imageFile && imageFile.size > 0) {
            const uploadResult = await saveImage('/tours', imageFile);
            if (uploadResult.success && uploadResult.url) {
                updates.image_url = uploadResult.url;
            }
        }

        const result = await updateTour(id, updates);

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/tours', 'layout');
            await recordAuditTrail('UPDATE', 'TOUR', id, updates);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Tour Update Error:', error);
        return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 });
    }
}

// PATCH: Update tour status
export async function PATCH(req: Request) {
    try {
        const { id, action } = await req.json();

        if (!id || !action) {
            return NextResponse.json({ error: 'ID and action required' }, { status: 400 });
        }

        let result;
        switch (action) {
            case 'complete':
                result = await markTourCompleted(id);
                break;
            case 'sold-out':
                result = await markTourSoldOut(id);
                break;
            case 'reopen':
                result = await updateTour(id, { status: 'upcoming' });
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/tours', 'layout');
            await recordAuditTrail('UPDATE', 'TOUR', id, { action });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Tour Status Update Error:', error);
        return NextResponse.json({ error: 'Failed to update tour status' }, { status: 500 });
    }
}

// DELETE: Delete a tour
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Tour ID required' }, { status: 400 });
        }

        const result = await deleteTour(id);

        if (result.success) {
            revalidatePath('/', 'layout');
            revalidatePath('/tours', 'layout');
            await recordAuditTrail('DELETE', 'TOUR', id);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Tour Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 });
    }
}
