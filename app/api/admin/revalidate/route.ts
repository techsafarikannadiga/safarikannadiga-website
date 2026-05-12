import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/firebase-auth';

/**
 * Administrative controller for flushing specific caches or whole routes 
 * without manual full site rebuilds.
 */
export async function POST(req: Request) {
    try {
        // Validate authentication context at execution point (secondary check backup)
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { type, path } = await req.json();

        if (type === 'path' && path) {
            revalidatePath(path);
            console.log(`[Revalidate] Successfully purged cache path: ${path}`);
            return NextResponse.json({ revalidated: true, target: path });
        }

        // Fallback default: Wipe major components
        revalidatePath('/');
        revalidatePath('/gallery', 'layout');
        revalidatePath('/tours', 'layout');
        
        return NextResponse.json({ 
            revalidated: true, 
            target: 'all-major-routes' 
        });

    } catch (error) {
        console.error('Revalidation action failed:', error);
        return NextResponse.json({ error: 'Revalidation failure' }, { status: 500 });
    }
}
