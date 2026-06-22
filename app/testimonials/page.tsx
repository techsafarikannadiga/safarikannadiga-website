'use client';

import { Container } from '@/components/ui/Container';
import { TestimonialsGrid } from '@/components/sections/TestimonialsGrid';
import { useEffect, useState } from 'react';
import { Testimonial } from '@/lib/testimonials';
import Link from 'next/link';

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

    useEffect(() => {
        async function fetchTestimonials() {
            try {
                // Fetch all testimonials
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

    // 1. Calculate Stats based on all testimonials
    const totalCount = testimonials.length;
    const averageRating = totalCount > 0 
        ? Number((testimonials.reduce((sum, t) => sum + t.rating, 0) / totalCount).toFixed(1))
        : 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    testimonials.forEach(t => {
        const rating = Math.min(5, Math.max(1, Math.round(t.rating))) as 5 | 4 | 3 | 2 | 1;
        ratingCounts[rating]++;
    });

    // Helper for percentage
    const getPercent = (count: number) => {
        if (totalCount === 0) return 0;
        return Math.round((count / totalCount) * 100);
    };

    // 2. Filter & Sort testimonials
    const filteredTestimonials = testimonials.filter(t => {
        // Search keywords in name, safari name, or review story
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = t.name.toLowerCase().includes(query);
            const matchesSafari = t.safari.toLowerCase().includes(query);
            const matchesStory = t.story.toLowerCase().includes(query);
            if (!matchesName && !matchesSafari && !matchesStory) {
                return false;
            }
        }

        // Star rating filter
        if (selectedRating !== null) {
            if (Math.round(t.rating) !== selectedRating) {
                return false;
            }
        }

        // Only reviews with photo attachments
        if (onlyWithPhotos) {
            if (!t.photos || t.photos.length === 0) {
                return false;
            }
        }

        return true;
    }).sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'highest') {
            return b.rating - a.rating;
        }
        if (sortBy === 'lowest') {
            return a.rating - b.rating;
        }
        return 0;
    });

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedRating(null);
        setOnlyWithPhotos(false);
        setSortBy('newest');
    };

    return (
        <div className="pt-24 md:pt-32 pb-section bg-neutral-cream min-h-screen">
            <Container>
                {/* 1. Header & Stats Section */}
                <div className="max-w-6xl mx-auto mb-12">
                    <div className="text-center mb-10">
                        <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-3 block">
                            Guest Reviews
                        </span>
                        <h1 className="text-display mb-4">What Our Guests Say</h1>
                        <p className="text-neutral-gray text-lg max-w-2xl mx-auto">
                            Read raw experiences and wildlife stories from travelers who explored the wild with us.
                        </p>
                    </div>

                    {!isLoading && totalCount > 0 && (
                        <div className="bg-white p-6 md:p-10 rounded-card shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-neutral-gray/5">
                            {/* Stats Summary Column (Left) */}
                            <div className="md:col-span-5 text-center md:border-r md:border-neutral-gray/10 md:pr-8">
                                <div className="text-6xl font-black text-neutral-charcoal mb-2 font-display">
                                    {averageRating}
                                </div>
                                <div className="flex justify-center text-safari-gold mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <svg 
                                            key={i} 
                                            className={`w-6 h-6 ${i < Math.round(averageRating) ? 'fill-current' : 'fill-transparent stroke-current'}`} 
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-neutral-gray text-sm mb-6 font-medium">
                                    Based on {totalCount} verified guest reviews
                                </p>
                                <Link 
                                    href="/share-experience" 
                                    className="inline-block btn-primary px-8 py-3.5 font-bold tracking-wide transition-all shadow-md hover:shadow-lg"
                                >
                                    Write a Review
                                </Link>
                            </div>

                            {/* Stats Bar Breakdown Column (Right) */}
                            <div className="md:col-span-7 space-y-3.5 md:pl-4">
                                {([5, 4, 3, 2, 1] as const).map((stars) => {
                                    const count = ratingCounts[stars];
                                    const percent = getPercent(count);
                                    return (
                                        <div key={stars} className="flex items-center text-sm font-medium">
                                            <button 
                                                onClick={() => setSelectedRating(selectedRating === stars ? null : stars)}
                                                className={`w-10 text-left hover:text-safari-gold transition-colors ${selectedRating === stars ? 'text-safari-gold font-bold' : 'text-neutral-charcoal'}`}
                                            >
                                                {stars} ★
                                            </button>
                                            <div className="flex-grow h-3 bg-neutral-cream rounded-full overflow-hidden mx-4 relative ring-1 ring-black/5">
                                                <div 
                                                    className="h-full bg-safari-gold rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="w-12 text-right text-neutral-gray font-mono">
                                                {percent}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Search & Filter Bar */}
                {!isLoading && totalCount > 0 && (
                    <div className="max-w-6xl mx-auto bg-white p-5 rounded-card shadow-sm border border-neutral-gray/10 mb-10 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-grow" style={{ position: 'relative' }}>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search reviews, safaris, wildlife..."
                                className="w-full pr-10 py-2.5 rounded-lg border border-neutral-gray/25 bg-neutral-cream/50 text-neutral-charcoal placeholder-neutral-gray/70 focus:outline-none focus:ring-2 focus:ring-safari-gold/50 focus:border-safari-gold text-sm transition-all"
                                style={{ paddingLeft: '2.75rem' }}
                            />
                            <svg 
                                className="w-5 h-5 text-neutral-gray" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="text-neutral-gray hover:text-neutral-charcoal transition-colors"
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filter pills & Sort Dropdowns */}
                        <div className="flex flex-wrap items-center gap-3 md:shrink-0">
                            {/* Rating Selector */}
                            <select 
                                value={selectedRating || ''}
                                onChange={(e) => setSelectedRating(e.target.value ? parseInt(e.target.value) : null)}
                                className="px-3.5 py-2.5 rounded-lg border border-neutral-gray/25 bg-white text-neutral-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-safari-gold/50 focus:border-safari-gold transition-all"
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars only</option>
                                <option value="4">4 Stars only</option>
                                <option value="3">3 Stars only</option>
                                <option value="2">2 Stars only</option>
                                <option value="1">1 Star only</option>
                            </select>

                            {/* Sort Selector */}
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-3.5 py-2.5 rounded-lg border border-neutral-gray/25 bg-white text-neutral-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-safari-gold/50 focus:border-safari-gold transition-all"
                            >
                                <option value="newest">Newest First</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                            </select>

                            {/* Photo Toggle */}
                            <button
                                onClick={() => setOnlyWithPhotos(!onlyWithPhotos)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                                    onlyWithPhotos 
                                        ? 'bg-safari-gold/15 border-safari-gold text-safari-gold font-bold shadow-sm' 
                                        : 'bg-white border-neutral-gray/25 text-neutral-charcoal hover:bg-neutral-cream'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                With Photos
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. Main reviews content */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20 text-safari-gold">
                        <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : filteredTestimonials.length > 0 ? (
                    <div>
                        <div className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-gray/70">
                            Showing {filteredTestimonials.length} review{filteredTestimonials.length !== 1 && 's'}
                        </div>
                        <TestimonialsGrid testimonials={filteredTestimonials} />
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-card shadow-sm border border-neutral-gray/10 max-w-4xl mx-auto">
                        <svg className="w-16 h-16 text-neutral-gray/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="font-bold text-lg text-neutral-charcoal mb-2">No matching reviews</h3>
                        <p className="text-neutral-gray max-w-md mx-auto mb-6">
                            We couldn't find any reviews matching your selected filters. Try searching for other keywords or reset your filters.
                        </p>
                        <button 
                            onClick={resetFilters}
                            className="btn-outline font-bold text-sm"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </Container>
        </div>
    );
}
