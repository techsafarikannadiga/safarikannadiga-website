import { createClient } from '@supabase/supabase-js';
import { GOOGLE_PLACES_CONFIG } from './google-reviews';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface SyncResult {
    added: number;
    errors: string[];
}

/**
 * Fetch Google Reviews using Places API and save to DB
 */
export async function syncGoogleReviews(): Promise<SyncResult> {
    const { apiKey, placeId } = GOOGLE_PLACES_CONFIG;
    if (!apiKey || !placeId) return { added: 0, errors: ['Google API not configured'] };

    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== 'OK' || !data.result?.reviews) {
            return { added: 0, errors: [`Google API Error: ${data.status}`] };
        }

        let addedCount = 0;
        for (const review of data.result.reviews) {
            // Create a unique ID based on author + time if not provided by API (Google Places API doesn't always give a stable review ID in simplified response, but 'time' + 'author_name' is a decent proxy for duplicates)
            // Actually, verify if `params` or other fields exist? 
            // Better: use a hash of content or `time` + `author_name`.
            const externalId = `google_${review.time}_${review.author_name.replace(/\s+/g, '')}`;

            const { error } = await supabaseAdmin
                .from('testimonials')
                .insert({
                    name: review.author_name,
                    rating: review.rating,
                    story: review.text,
                    visit_date: new Date(review.time * 1000).toISOString().split('T')[0],
                    source: 'google',
                    external_id: externalId,
                    avatar_url: review.profile_photo_url,
                    source_url: review.author_url,
                    approved: true, // Auto-approve synced reviews
                    safari: 'Google Review'
                })
                .select()
                .single();

            if (!error) addedCount++;
        }

        return { added: addedCount, errors: [] };
    } catch (error: any) {
        return { added: 0, errors: [error.message] };
    }
}

/**
 * Fetch Facebook Reviews using Graph API
 */
export async function syncFacebookReviews(): Promise<SyncResult> {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken) return { added: 0, errors: ['Facebook API not configured'] };

    try {
        // Facebook Graph API for Ratings
        // GET /{page-id}/ratings?fields=created_time,reviewer,rating,review_text,recommendation_type
        const url = `https://graph.facebook.com/v19.0/${pageId}/ratings?access_token=${accessToken}&fields=created_time,reviewer,rating,review_text,recommendation_type`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            return { added: 0, errors: [`Facebook API Error: ${data.error.message}`] };
        }

        let addedCount = 0;
        for (const review of data.data || []) {
            // FB gives 'recommendation_type'. 'positive' = 5 stars usually? FB doesn't strictly have stars anymore, just Recs.
            // But some endpoints return rating. We'll fallback to 5 if positive.
            const rating = review.rating || (review.recommendation_type === 'positive' ? 5 : 1);
            const externalId = `fb_${review.created_time}_${review.reviewer?.id || 'anon'}`;

            const { error } = await supabaseAdmin
                .from('testimonials')
                .insert({
                    name: review.reviewer?.name || 'Facebook User',
                    rating: rating,
                    story: review.review_text || 'Recommended on Facebook',
                    visit_date: review.created_time ? new Date(review.created_time).toISOString().split('T')[0] : null,
                    source: 'facebook',
                    external_id: externalId,
                    // FB Avatar requires another call usually, skipping for now
                    approved: true,
                    safari: 'Facebook Review'
                })
                .select()
                .single();

            if (!error) addedCount++;
        }

        return { added: addedCount, errors: [] };

    } catch (error: any) {
        return { added: 0, errors: [error.message] };
    }
}
