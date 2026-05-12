'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Testimonial } from '@/lib/testimonials';
import { formatVisitDate } from '@/lib/utils/date';
import { Avatar } from '@/components/ui/Avatar';

interface TestimonialMarqueeProps {
    testimonials: Testimonial[];
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating ? 'text-safari-gold fill-current' : 'text-gray-200 fill-current'}`}
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function SourceBadge({ source }: { source?: string }) {
    if (source === 'google') {
        return (
            <svg className="w-4 h-4 text-[#4285F4] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
        );
    }
    if (source === 'facebook') {
        return (
            <svg className="w-4 h-4 text-[#1877F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        );
    }
    return null;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="w-[320px] sm:w-[380px] shrink-0 mx-3">
            <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg hover:border-safari-gold/30 transition-all duration-300 group">
                {/* Decorative quote */}
                <div className="absolute top-4 right-5 text-5xl text-safari-gold/10 font-serif leading-none select-none">"</div>

                {/* Stars */}
                <StarRating rating={testimonial.rating} />

                {/* Story */}
                <p className="text-neutral-charcoal/80 text-sm leading-relaxed mt-3 mb-5 line-clamp-4">
                    {testimonial.story}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                    <Avatar
                        src={testimonial.avatar_url}
                        name={testimonial.name}
                        sizeClasses="w-10 h-10"
                        textSizeClasses="text-sm"
                    />
                    <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-neutral-charcoal truncate flex items-center gap-1.5">
                            {testimonial.name}
                            <SourceBadge source={testimonial.source} />
                        </h4>
                        <p className="text-neutral-gray text-xs truncate">
                            {testimonial.safari}
                            {testimonial.visit_date && ` • ${formatVisitDate(testimonial.visit_date)}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MarqueeRow({ testimonials, reverse = false, speed = 40 }: { testimonials: Testimonial[]; reverse?: boolean; speed?: number }) {
    // Duplicate testimonials for seamless infinite scrolling
    const items = [...testimonials, ...testimonials];

    return (
        <div
            className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
            <div
                className={`flex shrink-0 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
                style={{ '--marquee-duration': `${speed}s` } as React.CSSProperties}
            >
                {items.map((t, i) => (
                    <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
                ))}
            </div>
        </div>
    );
}

export function TestimonialMarquee({ testimonials }: TestimonialMarqueeProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!testimonials.length) {
        return null;
    }

    // Split testimonials into two rows
    const mid = Math.ceil(testimonials.length / 2);
    const row1 = testimonials.slice(0, mid);
    const row2 = testimonials.slice(mid);

    // Use all testimonials for the second row if we don't have enough
    const finalRow2 = row2.length >= 2 ? row2 : testimonials;

    return (
        <section className="py-16 md:py-24 bg-neutral-cream overflow-hidden relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #2C3E50 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }} />

            <div className="relative">
                {/* Header */}
                <div className="text-center mb-12 px-4">
                    <span className="text-safari-gold font-bold uppercase tracking-[0.2em] text-xs mb-3 block">
                        Trusted by Wildlife Enthusiasts
                    </span>
                    <h2 className="text-display mb-4">What Our Travelers Say</h2>
                    <p className="text-neutral-gray max-w-xl mx-auto text-sm">
                        Real stories from fellow adventurers who've explored the wild with us
                    </p>
                </div>

                {/* Marquee Rows */}
                <div className={`space-y-6 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    <MarqueeRow testimonials={row1} speed={45} />
                    <MarqueeRow testimonials={finalRow2} reverse speed={50} />
                </div>

                {/* CTA */}
                <div className="text-center mt-12 px-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/testimonials"
                        className="inline-flex items-center justify-center gap-2 bg-white text-safari-gold px-8 py-3.5 rounded-full font-bold text-sm border-2 border-safari-gold hover:bg-safari-gold hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto"
                    >
                        Read All Reviews
                    </Link>
                    <Link
                        href="/share-experience"
                        className="inline-flex items-center justify-center gap-2 bg-forest-green text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-forest-green-dark transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto"
                    >
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Share Your Story
                    </Link>
                </div>
            </div>
        </section>
    );
}
