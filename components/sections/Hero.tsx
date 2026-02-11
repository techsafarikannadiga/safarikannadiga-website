'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { normalizeImageUrl } from '@/lib/image-utils';

interface HeroProps {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    featuredLocations?: any[];
}

export function Hero({ title, subtitle, backgroundImage, featuredLocations = [] }: HeroProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [prevImageIndex, setPrevImageIndex] = useState<number | null>(null);
    const [isContentVisible, setIsContentVisible] = useState(false);

    // Use local hero images as primary source
    const heroImages = [
        { src: "/images/hero-uploads/hero-selected-1.jpg", focalX: 50, focalY: 50, zoom: 1.0 },
        { src: "/images/hero-uploads/hero-selected-2.jpg", focalX: 50, focalY: 50, zoom: 1.0 },
        { src: "/images/hero-uploads/hero-selected-3.jpg", focalX: 50, focalY: 50, zoom: 1.0 },
        { src: "/images/hero-uploads/hero-selected-4.jpg", focalX: 50, focalY: 50, zoom: 1.0 },
        { src: "/images/hero-uploads/hero-selected-5.jpg", focalX: 50, focalY: 50, zoom: 1.0 },
    ];

    useEffect(() => {
        // Trigger content entrance animation after mount
        requestAnimationFrame(() => setIsContentVisible(true));

        const interval = setInterval(() => {
            setPrevImageIndex(currentImageIndex);
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [currentImageIndex]);

    // Clear prevImageIndex after transition completes
    useEffect(() => {
        if (prevImageIndex !== null) {
            const timeout = setTimeout(() => setPrevImageIndex(null), 1000);
            return () => clearTimeout(timeout);
        }
    }, [prevImageIndex]);

    return (
        <section className="relative h-[92vh] w-full overflow-hidden flex items-start md:items-end justify-center md:justify-end">
            {/* Background Carousel with CSS transitions */}
            <div className="absolute inset-0 z-0">
                {/* Previous image (fading out) */}
                {prevImageIndex !== null && (
                    <div className="absolute inset-0 animate-hero-fade-out">
                        <Image
                            src={normalizeImageUrl(heroImages[prevImageIndex].src)}
                            alt="Safari Landscape"
                            fill
                            style={{
                                objectPosition: `${heroImages[prevImageIndex].focalX}% ${heroImages[prevImageIndex].focalY}%`,
                                transform: `scale(${heroImages[prevImageIndex].zoom})`
                            }}
                            className="object-cover"
                            sizes="100vw"
                            quality={75}
                        />
                    </div>
                )}

                {/* Current image (fading in) */}
                <div
                    key={currentImageIndex}
                    className="absolute inset-0 animate-hero-fade-in"
                >
                    <Image
                        src={normalizeImageUrl(heroImages[currentImageIndex].src)}
                        alt="Safari Landscape"
                        fill
                        style={{
                            objectPosition: `${heroImages[currentImageIndex].focalX}% ${heroImages[currentImageIndex].focalY}%`,
                            transform: `scale(${heroImages[currentImageIndex].zoom})`
                        }}
                        className="object-cover"
                        priority={currentImageIndex === 0}
                        sizes="100vw"
                        quality={75}
                    />
                </div>

                {/* Gradient Overlay - Static */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/60 md:bg-gradient-to-t md:from-black/90 md:via-black/40 md:to-transparent z-10" />
            </div>

            <Container className="relative z-20 text-center md:text-right text-white pt-32 md:pt-0 pb-10 md:pb-40">
                <div
                    className={`max-w-4xl ml-auto transition-all duration-700 ease-out ${isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest uppercase bg-safari-gold text-white rounded-full shadow-lg">
                        The Ultimate Safari Experience
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight text-white drop-shadow-lg">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-cream mb-10 max-w-2xl mx-auto md:ml-auto leading-relaxed drop-shadow-md">
                        {subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center md:items-end justify-center md:justify-end gap-4">
                        <Link href="/contact" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto shadow-2xl shadow-safari-gold/20 transform hover:scale-105 border-2 border-transparent">
                            Plan My Safari
                        </Link>
                        <Link href="/gallery" className="btn-outline border-white text-white hover:bg-forest-green hover:border-forest-green hover:text-white px-8 py-4 text-lg w-full sm:w-auto transform hover:scale-105">
                            View Gallery
                        </Link>
                    </div>
                </div>
            </Container>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-6 z-20 flex gap-2">
                {heroImages.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setPrevImageIndex(currentImageIndex);
                            setCurrentImageIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-safari-gold' : 'w-2 bg-white/50 hover:bg-white'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Scroll Indicator - Desktop Only */}
            <div
                className={`absolute bottom-10 right-10 z-20 hidden md:flex flex-col items-center gap-2 transition-opacity duration-1000 delay-[2000ms] ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}
            >
                <span className="text-white/60 text-[10px] uppercase tracking-widest rotate-90 origin-right translate-x-full">Scroll</span>
                <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent mt-8" />
            </div>
        </section>
    );
}
