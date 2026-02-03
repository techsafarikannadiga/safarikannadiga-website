import { NextResponse } from 'next/server';
import { getApprovedTestimonials, createTestimonial, TestimonialInput } from '@/lib/testimonials';

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
        const formData = await req.formData();

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
        for (let i = 0; i < 5; i++) {
            const photo = formData.get(`photo_${i}`) as File | null;
            if (photo && photo.size > 0) {
                photos.push(photo);
            }
        }

        // Also check for 'photos' field (array upload)
        const photosField = formData.getAll('photos') as File[];
        if (photosField.length > 0) {
            photos.push(...photosField.slice(0, 5 - photos.length));
        }

        // Limit to 5 photos
        if (photos.length > 5) {
            return NextResponse.json({ error: 'Maximum 5 photos allowed' }, { status: 400 });
        }

        const result = await createTestimonial(data, photos);

        if (result.success) {
            return NextResponse.json({
                success: true,
                id: result.id,
                message: 'Thank you for sharing your experience! Your testimonial will be reviewed and published soon.'
            });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Testimonial Submit Error:', error);
        return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 });
    }
}
