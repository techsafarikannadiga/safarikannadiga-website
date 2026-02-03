import { NextResponse } from 'next/server';
import {
    getAllTestimonials,
    approveTestimonial,
    unapproveTestimonial,
    deleteTestimonial
} from '@/lib/testimonials';

// GET: List all testimonials (admin)
export async function GET() {
    try {
        const testimonials = await getAllTestimonials();
        return NextResponse.json(testimonials);
    } catch (error) {
        console.error('Admin Testimonials Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

// PATCH: Approve/unapprove testimonial
export async function PATCH(req: Request) {
    try {
        const { id, approved } = await req.json();

        if (!id || approved === undefined) {
            return NextResponse.json({ error: 'ID and approved status required' }, { status: 400 });
        }

        const result = approved
            ? await approveTestimonial(id)
            : await unapproveTestimonial(id);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Testimonial Approval Error:', error);
        return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
    }
}

// DELETE: Delete testimonial
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 });
        }

        const result = await deleteTestimonial(id);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Testimonial Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
    }
}

// POST: Create/Import testimonial (admin)
import { createTestimonial } from '@/lib/testimonials';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Ensure source and approved status are handled
        const result = await createTestimonial({
            ...body,
            approved: true // Auto-approve admin imports by default
        });

        if (result.success) {
            return NextResponse.json({ success: true, id: result.id });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Testimonial Create Error:', error);
        return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
    }
}
