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
                            <div className="w-12 h-12 rounded-full bg-safari-gold/20 flex items-center justify-center font-bold text-safari-gold text-lg">
                                {testimonial.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-neutral-charcoal">{testimonial.name}</h4>
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
