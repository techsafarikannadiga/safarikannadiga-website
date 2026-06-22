'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Testimonial } from '@/lib/testimonials';
import { formatVisitDate } from '@/lib/utils/date';
import { Avatar } from '@/components/ui/Avatar';

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

    // Optimize ImageKit URLs for thumbnails to save bandwidth
    const getThumbnailUrl = (url: string) => {
        if (url.includes('ik.imagekit.io')) {
            // Append ImageKit query transformation for a 160x160 cropped square
            return `${url}?tr=w-160,h-160,fo-auto,q-80`;
        }
        return url;
    };

    return (
        <>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 mb-12 space-y-8">
                {testimonials.map((testimonial) => {
                    const hasPhotos = testimonial.photos && testimonial.photos.length > 0;
                    const photosCount = testimonial.photos?.length || 0;
                    const visiblePhotosLimit = 4; // limit visible thumbnails to keep card compact
                    
                    return (
                        <div 
                            key={testimonial.id} 
                            className="break-inside-avoid bg-white p-6 md:p-8 rounded-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-neutral-gray/5 flex flex-col"
                        >
                            {/* Star Rating Row */}
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex text-safari-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <svg 
                                            key={i} 
                                            className={`w-4.5 h-4.5 ${i < testimonial.rating ? 'fill-current' : 'fill-transparent stroke-current'}`} 
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                {/* Verified badge */}
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-green bg-forest-green/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                            </div>

                            {/* Story content */}
                            <p className="text-neutral-charcoal text-[15px] leading-relaxed mb-6 flex-grow relative font-normal">
                                <span className="text-5xl text-safari-gold/20 absolute -top-5 -left-3 font-serif pointer-events-none select-none">"</span>
                                {testimonial.story}
                            </p>

                            {/* Photo gallery */}
                            {hasPhotos && (
                                <div className="flex gap-2 mb-6 overflow-hidden">
                                    {testimonial.photos.slice(0, visiblePhotosLimit).map((photo, index) => {
                                        const isLastVisible = index === visiblePhotosLimit - 1;
                                        const hasMore = photosCount > visiblePhotosLimit;
                                        
                                        return (
                                            <div
                                                key={index}
                                                className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 cursor-pointer border border-neutral-gray/10 group bg-neutral-cream"
                                                onClick={() => openLightbox(testimonial.photos, index)}
                                            >
                                                <Image 
                                                    src={getThumbnailUrl(photo)} 
                                                    alt={`Guest photo ${index + 1}`} 
                                                    fill 
                                                    className="object-cover group-hover:scale-110 transition-transform duration-300" 
                                                    sizes="64px" 
                                                />
                                                
                                                {/* More photos overlay */}
                                                {isLastVisible && hasMore && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold transition-colors group-hover:bg-black/50">
                                                        +{photosCount - visiblePhotosLimit + 1}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Guest details card footer */}
                            <div className="mt-auto flex items-center gap-4 pt-4 border-t border-neutral-gray/10">
                                <Avatar
                                    src={testimonial.avatar_url}
                                    name={testimonial.name}
                                    sizeClasses="w-11 h-11 ring-1 ring-neutral-gray/5"
                                    textSizeClasses="text-base font-bold"
                                />
                                <div>
                                    <h4 className="font-bold text-sm text-neutral-charcoal flex items-center gap-1.5">
                                        {testimonial.name}
                                        {testimonial.source === 'google' && (
                                            <span className="tooltip" title="Source: Google Review">
                                                <svg className="w-3.5 h-3.5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                            </span>
                                        )}
                                        {testimonial.source === 'facebook' && (
                                            <span className="tooltip" title="Source: Facebook Recommendation">
                                                <svg className="w-3.5 h-3.5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-neutral-gray text-xs font-medium">
                                        {testimonial.safari}
                                        {testimonial.visit_date && ` • ${formatVisitDate(testimonial.visit_date)}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
