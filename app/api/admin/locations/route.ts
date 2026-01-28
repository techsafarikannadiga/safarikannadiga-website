import { NextResponse } from 'next/server';
import { 
    addLocation, 
    deleteLocation,
    updateLocation,
    getContinentsList
} from '@/lib/gallery-cloud';

// GET: List continents
export async function GET() {
    try {
        const continents = await getContinentsList();
        return NextResponse.json(continents);
    } catch (error) {
        console.error('Get Continents Error:', error);
        return NextResponse.json({ error: 'Failed to fetch continents' }, { status: 500 });
    }
}

// POST: Add new location
export async function POST(req: Request) {
    try {
        const { continentSlug, name, country, description, wildlife } = await req.json();

        if (!continentSlug || !name || !country) {
            return NextResponse.json({ error: 'Missing required fields (continentSlug, name, country)' }, { status: 400 });
        }

        const result = await addLocation(continentSlug, {
            name,
            country,
            description,
            wildlife: wildlife || []
        });
        
        if (result.success) {
            return NextResponse.json({ success: true, location: result.location });
        } else {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
    } catch (error) {
        console.error('Add Location Error:', error);
        return NextResponse.json({ error: 'Failed to add location' }, { status: 500 });
    }
}

// DELETE: Delete location
export async function DELETE(req: Request) {
    try {
        const { continentSlug, locationSlug } = await req.json();
        
        if (!continentSlug || !locationSlug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await deleteLocation(continentSlug, locationSlug);
        
        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }
    } catch (error) {
        console.error('Delete Location Error:', error);
        return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }
}

// PATCH: Update location details (description, wildlife, country)
export async function PATCH(req: Request) {
    try {
        const { continentSlug, locationSlug, description, wildlife, country } = await req.json();
        
        if (!continentSlug || !locationSlug) {
            return NextResponse.json({ error: 'Missing required fields (continentSlug, locationSlug)' }, { status: 400 });
        }

        const updates: { description?: string; wildlife?: string[]; country?: string } = {};
        if (description !== undefined) updates.description = description;
        if (wildlife !== undefined) updates.wildlife = wildlife;
        if (country !== undefined) updates.country = country;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        const result = await updateLocation(continentSlug, locationSlug, updates);
        
        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
    } catch (error) {
        console.error('Update Location Error:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}
