import { NextResponse } from 'next/server';
import { syncGoogleReviews, syncFacebookReviews } from '@/lib/review-sync';

export async function POST() {
    try {
        const [googleResult, fbResult] = await Promise.all([
            syncGoogleReviews(),
            syncFacebookReviews()
        ]);

        return NextResponse.json({
            success: true,
            results: {
                google: googleResult,
                facebook: fbResult
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
