import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getApprovedTestimonials } from '@/lib/testimonials';
import { TestimonialMarquee } from './TestimonialMarquee';

async function TestimonialsSection() {
    // Fetch approved testimonials (including synced Google/FB ones)
    const testimonials = await getApprovedTestimonials(12);

    if (!testimonials.length) {
        return (
            <section className="section-padding bg-neutral-cream">
                <Container>
                    <div className="text-center py-12 bg-white rounded-card max-w-2xl mx-auto shadow-sm">
                        <p className="text-neutral-gray mb-6">No reviews yet. Be the first to share your experience!</p>
                        <Link
                            href="/share-experience"
                            className="inline-flex items-center gap-2 bg-safari-gold text-white px-6 py-3 rounded-full font-bold hover:bg-safari-gold-dark transition-colors"
                        >
                            Write a Review
                        </Link>
                    </div>
                </Container>
            </section>
        );
    }

    return <TestimonialMarquee testimonials={testimonials} />;
}

export { TestimonialsSection };

export function ShareExperienceSection() {
    return (
        <section className="section-padding bg-safari-gold text-white">
            <Container>
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-white/80 font-bold uppercase tracking-widest text-sm mb-4 block">
                        Your Story Matters
                    </span>
                    <h2 className="text-display text-white mb-6">Share Your Safari Experience</h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                        Been on a safari with us? Your experience could inspire someone&apos;s next adventure.
                        Share your story and help fellow wildlife enthusiasts discover the magic of the wild.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/share-experience"
                            className="inline-flex items-center justify-center gap-2 bg-white text-safari-gold px-8 py-3 rounded-full font-bold hover:bg-neutral-cream transition-colors shadow-lg"
                        >
                            Share Your Story
                        </Link>
                        <a
                            href="https://www.google.com/search?q=SafariKannadiga+reviews"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-forest-green text-white px-8 py-3 rounded-full font-bold hover:bg-forest-green-dark transition-colors shadow-lg"
                        >
                            Leave Google Review
                        </a>
                    </div>
                </div>
            </Container>
        </section>
    );
}
