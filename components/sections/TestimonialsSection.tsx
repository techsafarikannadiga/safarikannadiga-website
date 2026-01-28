import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { fetchGoogleReviews, GoogleReview, PlaceDetails } from '@/lib/google-reviews';

async function GoogleReviewsDisplay() {
    const placeDetails = await fetchGoogleReviews();

    if (!placeDetails) {
        return <FallbackReviews />;
    }

    return (
        <>
            <div className="flex items-center justify-center gap-2 mt-6 mb-12">
                <div className="flex text-safari-gold">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.round(placeDetails.rating) ? 'fill-current' : 'fill-transparent stroke-current'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <span className="font-bold text-neutral-charcoal">{placeDetails.rating.toFixed(1)}</span>
                <span className="text-neutral-gray">({placeDetails.totalReviews} reviews on Google)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {placeDetails.reviews.slice(0, 6).map((review, i) => (
                    <ReviewCard key={i} review={review} />
                ))}
            </div>
        </>
    );
}

function ReviewCard({ review }: { review: GoogleReview }) {
    return (
        <div className="bg-white p-8 rounded-card shadow-card h-full flex flex-col">
            <div className="flex text-safari-gold mb-4">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'fill-transparent stroke-current'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>

            <p className="text-neutral-charcoal leading-relaxed mb-6 flex-grow line-clamp-4">
                "{review.text}"
            </p>

            <div className="mt-auto flex items-center gap-4 pt-4 border-t border-neutral-gray/10">
                {review.authorPhoto ? (
                    <img
                        src={review.authorPhoto}
                        alt={review.authorName}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-safari-gold/20 flex items-center justify-center font-bold text-safari-gold">
                        {review.authorName.charAt(0)}
                    </div>
                )}
                <div>
                    <h4 className="font-bold text-sm text-neutral-charcoal">{review.authorName}</h4>
                    <p className="text-neutral-gray text-xs">{review.relativeTimeDescription}</p>
                </div>
            </div>
        </div>
    );
}

function FallbackReviews() {
    return (
        <div className="text-center py-12 bg-white rounded-card max-w-2xl mx-auto">
            <div className="flex justify-center text-safari-gold mb-4">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <p className="text-neutral-gray mb-4">Check out our reviews on Google!</p>
            <a
                href="https://www.google.com/search?q=SafariKannadiga+reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="text-safari-gold font-bold hover:underline"
            >
                View on Google →
            </a>
        </div>
    );
}

export async function TestimonialsSection() {
    return (
        <section className="section-padding bg-neutral-cream overflow-hidden">
            <Container>
                <div className="text-center mb-8">
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-2 block">
                        Guest Experiences
                    </span>
                    <h2 className="text-display mb-4">What Our Travelers Say</h2>
                    <p className="text-neutral-gray max-w-2xl mx-auto">
                        Real reviews from fellow wildlife enthusiasts who've explored with SafariKannadiga
                    </p>
                </div>

                <GoogleReviewsDisplay />

                <div className="text-center mt-12">
                    <p className="text-neutral-gray mb-4">Been on a safari with us?</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/share-experience"
                            className="inline-flex items-center justify-center gap-2 bg-safari-gold text-white px-6 py-3 rounded-full font-bold hover:bg-safari-gold-dark transition-colors"
                        >
                            Share Your Story
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </Link>
                        <a
                            href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 border-2 border-safari-gold text-safari-gold px-6 py-3 rounded-full font-bold hover:bg-safari-gold hover:text-white transition-colors"
                        >
                            Leave Google Review
                        </a>
                    </div>
                </div>
            </Container>
        </section>
    );
}

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
                            href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
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
