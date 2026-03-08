'use client';

import { Container } from '@/components/ui/Container';
import { TestimonialsGrid } from '@/components/sections/TestimonialsGrid';
import { useEffect, useState } from 'react';
import { Testimonial } from '@/lib/testimonials';

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTestimonials() {
            try {
                // Fetch all testimonials without a limit
                const response = await fetch('/api/testimonials');
                if (response.ok) {
                    const data = await response.json();
                    setTestimonials(data);
                }
            } catch (error) {
                console.error("Failed to fetch testimonials:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTestimonials();
    }, []);

    return (
        <div className="pt-24 md:pt-32 pb-section bg-neutral-cream min-h-screen">
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-4 block">
                        Guest Reviews
                    </span>
                    <h1 className="text-display mb-6">What Our Guests Say</h1>
                    <p className="text-neutral-gray text-lg leading-relaxed">
                        Read unedited reviews and stories from fellow travelers who have experienced the magic of the wild with us.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20 text-safari-gold">
                        <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : testimonials.length > 0 ? (
                    <TestimonialsGrid testimonials={testimonials} />
                ) : (
                    <div className="text-center py-20 bg-white rounded-card shadow-sm border border-neutral-gray/10">
                        <p className="text-neutral-gray">No reviews available yet. Be the first to share your experience!</p>
                    </div>
                )}
            </Container>
        </div>
    );
}
