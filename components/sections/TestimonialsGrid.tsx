'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Testimonial } from '@/lib/testimonials';

interface TestimonialsGridProps {
    testimonials: Testimonial[];
}

export function TestimonialsGrid({ testimonials }: TestimonialsGridProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([]);

    const openLightbox = (photos: string[], index: number) => {
        setLightboxSlides(photos.map(src => ({ src })));
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white p-8 rounded-card shadow-card h-full flex flex-col">
                        <div className="flex text-safari-gold mb-4">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'fill-transparent stroke-current'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>

                        <p className="text-neutral-charcoal leading-relaxed mb-4 flex-grow relative">
                            <span className="text-4xl text-safari-gold/20 absolute -top-4 -left-2 font-serif">"</span>
                            {testimonial.story}
                        </p>

                        {/* Photo gallery if available */}
                        {testimonial.photos && testimonial.photos.length > 0 && (
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                {testimonial.photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity border border-gray-100"
                                        onClick={() => openLightbox(testimonial.photos, index)}
                                    >
                                        <Image src={photo} alt={`Photo ${index + 1}`} fill className="object-cover" sizes="80px" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-auto flex items-center gap-4 pt-4 border-t border-neutral-gray/10">
                            <div className="w-12 h-12 rounded-full bg-safari-gold/20 flex items-center justify-center font-bold text-safari-gold text-lg overflow-hidden relative">
                                {testimonial.avatar_url ? (
                                    <Image src={testimonial.avatar_url} alt={testimonial.name} fill className="object-cover" />
                                ) : (
                                    testimonial.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-neutral-charcoal flex items-center gap-2">
                                    {testimonial.name}
                                    {testimonial.source === 'google' && (
                                        <svg className="w-4 h-4 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    {testimonial.source === 'facebook' && (
                                        <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    )}
                                </h4>
                                <p className="text-neutral-gray text-xs">{testimonial.safari}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Lightbox
                index={lightboxIndex}
                slides={lightboxSlides}
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
            />
        </>
    );
}
