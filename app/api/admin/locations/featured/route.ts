import { NextResponse } from 'next/server';
import { toggleLocationFeatured } from '@/lib/supabase';

/**
 * Toggle featured status of a gallery location
 * PATCH /api/admin/locations/featured
 * Body: { locationId: string, isFeatured: boolean }
 */
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { locationId, isFeatured } = body;

        if (!locationId || typeof isFeatured !== 'boolean') {
            return NextResponse.json(
                { error: 'locationId (string) and isFeatured (boolean) are required' },
                { status: 400 }
            );
        }

        const result = await toggleLocationFeatured(locationId, isFeatured);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, isFeatured });
    } catch (error) {
        console.error('Error toggling featured:', error);
        return NextResponse.json({ error: 'Failed to update featured status' }, { status: 500 });
    }
}
