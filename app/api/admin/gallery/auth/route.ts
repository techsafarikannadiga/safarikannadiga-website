import { NextResponse } from 'next/server';
import { getAuthParams } from '@/lib/imagekit';

/**
 * ImageKit Authentication API
 * Returns signature, token and expiry for client-side uploads.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
    console.log('--- [API] /api/admin/gallery/auth Request ---');
    console.log('Env Check:', {
        hasKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
        keyLen: process.env.IMAGEKIT_PRIVATE_KEY?.length
    });

    try {
        if (!process.env.IMAGEKIT_PRIVATE_KEY) {
            console.error('[API Error] IMAGEKIT_PRIVATE_KEY is missing');
            return NextResponse.json({ error: 'ImageKit not configured. Add IMAGEKIT_PRIVATE_KEY to .env.local' }, { status: 503 });
        }
        const authParams = getAuthParams();
        console.log('[API] Auth params generated successfully');
        return NextResponse.json(authParams);
    } catch (error) {
        console.error('ImageKit Auth Error:', error);
        return NextResponse.json({ error: 'Failed to generate auth token' }, { status: 500 });
    }
}
