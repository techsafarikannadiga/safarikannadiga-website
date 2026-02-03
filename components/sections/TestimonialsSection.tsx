import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { getApprovedTestimonials } from '@/lib/testimonials';
import { TestimonialsGrid } from './TestimonialsGrid';

async function TestimonialsSection() {
    // Fetch all approved testimonials (including synced Google/FB ones)
    const testimonials = await getApprovedTestimonials(9);

    return (
        <section className="section-padding bg-neutral-cream overflow-hidden">
            <Container>
                <div className="text-center mb-12 relative">
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-2 block">
                        Guest Experiences
                    </span>
                    <h2 className="text-display mb-4">What Our Travelers Say</h2>
                    <p className="text-neutral-gray max-w-2xl mx-auto">
                        Real reviews from fellow wildlife enthusiasts who've explored with SafariKannadiga
                    </p>
                </div>

                {testimonials.length > 0 ? (
                    <TestimonialsGrid testimonials={testimonials} />
                ) : (
                    <div className="text-center py-12 bg-white rounded-card max-w-2xl mx-auto shadow-sm">
                        <p className="text-neutral-gray mb-6">No reviews yet. Be the first to share your experience!</p>
                        <Link
                            href="/share-experience"
                            className="inline-flex items-center gap-2 bg-safari-gold text-white px-6 py-3 rounded-full font-bold hover:bg-safari-gold-dark transition-colors"
                        >
                            Write a Review
                        </Link>
                    </div>
                )}
            </Container>
        </section>
    );
}

export { TestimonialsSection };

export function ShareExperienceSection() {
    return (
        <section className="section-padding bg-forest-green text-white">
            <Container>
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-4 block">
                        Your Story Matters
                    </span>
                    <h2 className="text-display text-white mb-6">Share Your Safari Experience</h2>
                    <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                        Been on a safari with us? Your experience could inspire someone's next adventure.
                        Share your story and help fellow wildlife enthusiasts discover the magic of the wild.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/share-experience"
                            className="inline-flex items-center justify-center gap-2 bg-white text-forest-green px-8 py-3 rounded-full font-bold hover:bg-neutral-cream transition-colors"
                        >
                            Share Your Story
                        </Link>
                        <a
                            href="https://www.google.com/search?q=SafariKannadiga+reviews"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-safari-gold text-white px-8 py-3 rounded-full font-bold hover:bg-safari-gold-dark transition-colors"
                        >
                            Leave Google Review
                        </a>
                    </div>
                </div>
            </Container>
        </section>
    );
}
