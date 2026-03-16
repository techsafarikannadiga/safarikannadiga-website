import { NextResponse } from 'next/server';
import { getApprovedTestimonials, createTestimonial, TestimonialInput } from '@/lib/testimonials';

export const maxDuration = 60;

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = MAX_PHOTOS * MAX_FILE_SIZE_BYTES;

// GET: List approved testimonials (public)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');

        const testimonials = await getApprovedTestimonials(limit ? parseInt(limit) : undefined);

        return NextResponse.json(testimonials);
    } catch (error) {
        console.error('Testimonials Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

// POST: Submit a new testimonial (public)
export async function POST(req: Request) {
    try {
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch (error) {
            console.error('Testimonial FormData Parse Error:', error);
            return NextResponse.json(
                { error: 'Upload payload too large. Please upload smaller photos and try again.' },
                { status: 413 }
            );
        }

        // Anti-spam Honeypot Check
        if (formData.get('website')) {
            // Silently succeed for bots
            return NextResponse.json({
                success: true,
                id: 'honeypot-bot-submission',
                message: 'Thank you for sharing your experience! Your testimonial will be reviewed and published soon.'
            });
        }

        // Extract testimonial data
        const data: TestimonialInput = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            safari: formData.get('safari') as string,
            visit_date: formData.get('visit_date') as string || undefined,
            rating: parseInt(formData.get('rating') as string) || 5,
            story: formData.get('story') as string,
            highlights: formData.get('highlights') as string || undefined,
        };

        // Validate required fields
        if (!data.name || !data.email || !data.safari || !data.story) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate rating
        if (data.rating < 1 || data.rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Extract photos (max 5)
        const photos: File[] = [];
        for (let i = 0; i < MAX_PHOTOS; i++) {
            const photo = formData.get(`photo_${i}`) as File | null;
            if (photo && photo.size > 0) {
                photos.push(photo);
            }
        }

        // Also check for 'photos' field (array upload)
        const photosField = formData.getAll('photos') as File[];
        if (photosField.length > 0) {
            photos.push(...photosField.slice(0, MAX_PHOTOS - photos.length));
        }

        // Limit to 5 photos
        if (photos.length > MAX_PHOTOS) {
            return NextResponse.json({ error: 'Maximum 5 photos allowed' }, { status: 400 });
        }

        let totalUploadBytes = 0;
        for (const photo of photos) {
            if (!photo.type.startsWith('image/')) {
                return NextResponse.json({ error: `Invalid file type: ${photo.name}` }, { status: 400 });
            }

            if (photo.size > MAX_FILE_SIZE_BYTES) {
                return NextResponse.json(
                    { error: `${photo.name} is too large. Maximum allowed size is 10MB per photo.` },
                    { status: 400 }
                );
            }

            totalUploadBytes += photo.size;
        }

        if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
            return NextResponse.json(
                { error: 'Total photo upload size is too large. Please keep all selected photos within the allowed limits.' },
                { status: 400 }
            );
        }

        const result = await createTestimonial(data, photos);

        if (result.success) {
            return NextResponse.json({
                success: true,
                id: result.id,
                message: 'Thank you for sharing your experience! Your testimonial will be reviewed and published soon.'
            });
        } else {
            const errorMessage = result.error || 'Failed to submit testimonial';
            const normalizedError = errorMessage.toLowerCase();

            let status = 500;
            if (normalizedError.includes('payload too large')) status = 413;
            if (
                normalizedError.includes('database not configured') ||
                normalizedError.includes('service role') ||
                normalizedError.includes('row-level security') ||
                normalizedError.includes('permission denied')
            ) {
                status = 503;
            }

            return NextResponse.json({ error: errorMessage }, { status });
        }
    } catch (error) {
        console.error('Testimonial Submit Error:', error);

        const message = error instanceof Error ? error.message : 'Unknown error';
        if (/payload|body|too large|size limit|exceeded/i.test(message)) {
            return NextResponse.json(
                { error: 'Upload payload too large. Please upload smaller photos and try again.' },
                { status: 413 }
            );
        }

        return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 });
    }
}
