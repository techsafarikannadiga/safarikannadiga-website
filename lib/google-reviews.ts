// Google Places API configuration
// To set up:
// 1. Go to Google Cloud Console: https://console.cloud.google.com/
// 2. Create a project and enable "Places API"
// 3. Create an API key and restrict it to your domain
// 4. Add the API key to your .env.local file

export const GOOGLE_PLACES_CONFIG = {
    // Your Google Place ID - Find it at: https://developers.google.com/maps/documentation/places/web-service/place-id
    // Leave empty string if not configured
    placeId: process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || '',

    // API key (server-side only for security)
    apiKey: process.env.GOOGLE_PLACES_API_KEY || '',

    // Review link for customers to leave reviews (update with your actual Place ID)
    reviewLink: process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID
        ? `https://search.google.com/local/writereview?placeid=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID}`
        : ''
};

export interface GoogleReview {
    authorName: string;
    authorPhoto?: string;
    rating: number;
    text: string;
    relativeTimeDescription: string;
    time: number;
}

export interface PlaceDetails {
    name: string;
    rating: number;
    totalReviews: number;
    reviews: GoogleReview[];
}

/**
 * Fetch Google Reviews using Places API
 * This should be called server-side to protect API key
 */
export async function fetchGoogleReviews(): Promise<PlaceDetails | null> {
    const { placeId, apiKey } = GOOGLE_PLACES_CONFIG;

    if (!apiKey || !placeId) {
        console.log('Google Places API not configured. Using fallback data.');
        return null;
    }

    try {
        // Using modern Places API (New) which supports newer service area listings
        const url = `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,rating,userRatingCount,reviews&key=${apiKey}`;

        const response = await fetch(url, {
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Google Reviews via Places V1');
        }

        const data = await response.json();

        if (!data || data.error) {
            throw new Error(`Google Places API error: ${data.error?.message || 'Unknown error'}`);
        }

        return {
            name: data.displayName?.text || 'Safari Kannadiga',
            rating: data.rating || 5,
            totalReviews: data.userRatingCount || 0,
            reviews: (data.reviews || []).map((review: any) => ({
                authorName: review.authorAttribution?.displayName || 'Google User',
                authorPhoto: review.authorAttribution?.photoUri,
                rating: review.rating,
                text: review.text?.text || '',
                relativeTimeDescription: review.relativePublishTimeDescription,
                time: review.publishTime ? Math.floor(new Date(review.publishTime).getTime() / 1000) : 0
            }))
        };
    } catch (error) {
        console.error('Error fetching Google Reviews:', error);
        return null;
    }
}
