import { NextResponse } from 'next/server';
import { getAuthParams, isImageKitConfigured } from '@/lib/imagekit';

export const dynamic = 'force-dynamic';

/**
 * Public Testimonial Photo Upload Authorization Endpoint
 * Generates signature, token and expiry for client-side uploads directly to ImageKit.
 */
export async function GET() {
    try {
        if (!isImageKitConfigured()) {
            console.error('[API Error] ImageKit is not configured. IMAGEKIT_PRIVATE_KEY is missing.');
            return NextResponse.json(
                { error: 'ImageKit upload service is currently unavailable.' },
                { status: 503 }
            );
        }

        const authParams = getAuthParams();
        return NextResponse.json(authParams);
    } catch (error) {
        console.error('Testimonial ImageKit Auth Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload authorization token' },
            { status: 500 }
        );
    }
}
