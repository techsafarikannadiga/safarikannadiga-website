import { NextResponse } from 'next/server';
import { getAuthParams } from '@/lib/imagekit';

/**
 * ImageKit Authentication API
 * Returns signature, token and expiry for client-side uploads.
 */
export async function GET() {
    try {
        if (!process.env.IMAGEKIT_PRIVATE_KEY) {
            return NextResponse.json({ error: 'ImageKit not configured. Add IMAGEKIT_PRIVATE_KEY to .env.local' }, { status: 503 });
        }
        const authParams = getAuthParams();
        return NextResponse.json(authParams);
    } catch (error) {
        console.error('ImageKit Auth Error:', error);
        return NextResponse.json({ error: 'Failed to generate auth token' }, { status: 500 });
    }
}
