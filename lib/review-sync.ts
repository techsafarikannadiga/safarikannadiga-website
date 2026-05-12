import { GOOGLE_PLACES_CONFIG } from './google-reviews';
import { createTestimonial } from './testimonials';

interface SyncResult {
    added: number;
    errors: string[];
}

export async function syncGoogleReviews(): Promise<SyncResult> {
    const { apiKey, placeId } = GOOGLE_PLACES_CONFIG;
    if (!apiKey || !placeId) return { added: 0, errors: ['Google API not configured'] };

    try {
        // Use modern Places API (New) as validated
        const url = `https://places.googleapis.com/v1/places/${placeId}?fields=reviews&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.reviews) {
            return { added: 0, errors: [`Google API Error: ${data.error?.message || 'Failed to load reviews'}`] };
        }

        let addedCount = 0;
        for (const review of data.reviews) {
            const authorName = review.authorAttribution?.displayName || 'Google User';
            const text = review.text?.text || '';
            const publishTime = review.publishTime ? new Date(review.publishTime) : new Date();
            
            // Safely build unique identifier
            const externalId = `google_${Math.floor(publishTime.getTime() / 1000)}_${authorName.replace(/\s+/g, '')}`;
            
            const result = await createTestimonial({
                name: authorName,
                email: null,
                rating: review.rating,
                story: text,
                visit_date: publishTime.toISOString().substring(0, 7),
                source: 'google',
                external_id: externalId,
                avatar_url: review.authorAttribution?.photoUri,
                source_url: review.authorAttribution?.uri,
                approved: true,
                safari: 'Google Review',
            });

            if (result.success) addedCount++;
        }

        return { added: addedCount, errors: [] };
    } catch (error: any) {
        return { added: 0, errors: [error.message] };
    }
}

export async function syncFacebookReviews(): Promise<SyncResult> {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken) return { added: 0, errors: ['Facebook API not configured'] };

    try {
        const url = `https://graph.facebook.com/v19.0/${pageId}/ratings?access_token=${accessToken}&fields=created_time,reviewer,rating,review_text,recommendation_type`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            return { added: 0, errors: [`Facebook API Error: ${data.error.message}`] };
        }

        let addedCount = 0;
        for (const review of data.data || []) {
            const rating = review.rating || (review.recommendation_type === 'positive' ? 5 : 1);
            const externalId = `fb_${review.created_time}_${review.reviewer?.id || 'anon'}`;
            const result = await createTestimonial({
                name: review.reviewer?.name || 'Facebook User',
                email: null,
                rating,
                story: review.review_text || 'Recommended on Facebook',
                visit_date: review.created_time ? new Date(review.created_time).toISOString().substring(0, 7) : null,
                source: 'facebook',
                external_id: externalId,
                approved: true,
                safari: 'Facebook Review',
            });

            if (result.success) addedCount++;
        }

        return { added: addedCount, errors: [] };
    } catch (error: any) {
        return { added: 0, errors: [error.message] };
    }
}
