// Google Places API configuration
// To set up:
// 1. Go to Google Cloud Console: https://console.cloud.google.com/
// 2. Create a project and enable "Places API"
// 3. Create an API key and restrict it to your domain
// 4. Add the API key to your .env.local file

export const GOOGLE_PLACES_CONFIG = {
    // Your Google Place ID - Find it at: https://developers.google.com/maps/documentation/places/web-service/place-id
    placeId: process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || 'YOUR_PLACE_ID',

    // API key (server-side only for security)
    apiKey: process.env.GOOGLE_PLACES_API_KEY || '',

    // Review link for customers to leave reviews
    reviewLink: 'https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID'
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

    if (!apiKey || apiKey === '' || placeId === 'YOUR_PLACE_ID') {
        console.log('Google Places API not configured. Using fallback data.');
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}`;

        const response = await fetch(url, {
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Google Reviews');
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Google Places API error: ${data.status}`);
        }

        const place = data.result;

        return {
            name: place.name,
            rating: place.rating,
            totalReviews: place.user_ratings_total,
            reviews: (place.reviews || []).map((review: any) => ({
                authorName: review.author_name,
                authorPhoto: review.profile_photo_url,
                rating: review.rating,
                text: review.text,
                relativeTimeDescription: review.relative_time_description,
                time: review.time
            }))
        };
    } catch (error) {
        console.error('Error fetching Google Reviews:', error);
        return null;
    }
}
