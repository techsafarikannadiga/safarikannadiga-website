import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';

import { FeaturedLocation } from '@/lib/gallery-cloud';

export function Destinations({ locations }: { locations: FeaturedLocation[] }) {
    // Fallback to placeholder data if no locations with images
    const featuredParks = locations && locations.length > 0
        ? locations.map(loc => ({
            name: loc.name,
            location: loc.country,
            image: loc.coverImage,
            href: `/gallery/${loc.continentSlug}/${loc.country?.toLowerCase().replace(/\s+/g, '-') || 'kenya'}/${loc.slug}`,
            focalX: loc.focalX || 50,
            focalY: loc.focalY || 50,
            zoom: loc.zoom || 1.0
        }))
        : [
            {
                name: 'Masai Mara',
                location: 'Kenya',
                image: '/images/placeholder-safari.jpg',
                href: '/gallery/africa/kenya/masai-mara',
                focalX: 50,
                focalY: 50,
                zoom: 1.0
            },
            {
                name: 'Nairobi National Park',
                location: 'Kenya',
                image: '/images/placeholder-safari.jpg',
                href: '/gallery/africa/kenya/nairobi-national-park',
                focalX: 50,
                focalY: 50,
                zoom: 1.0
            },
            {
                name: 'Ranthambore',
                location: 'India',
                image: '/images/placeholder-safari.jpg',
                href: '/gallery/asia/india/ranthambore',
                focalX: 50,
                focalY: 50,
                zoom: 1.0
            },
            {
                name: 'Kaziranga',
                location: 'India',
                image: '/images/placeholder-safari.jpg',
                href: '/gallery/asia/india/kaziranga',
                focalX: 50,
                focalY: 50,
                zoom: 1.0
            },
        ];

    return (
        <section className="section-padding bg-neutral-cream">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-2 block">The World is Waiting</span>
                    <h2 className="text-display mb-6">Explore Our National Parks</h2>
                    <p className="text-neutral-gray text-lg">From the endless savannas of the Serengeti to the dense jungles of Central India.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredParks.map((park) => (
                        <Link key={park.name} href={park.href} className="relative group block aspect-[4/5] rounded-card overflow-hidden shadow-lg">
                            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                <Image
                                    src={park.image}
                                    alt={park.name}
                                    fill
                                    style={{
                                        objectPosition: `${park.focalX}% ${park.focalY}%`,
                                        transform: `scale(${park.zoom})`
                                    }}
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                <span className="text-[10px] text-safari-gold font-bold uppercase tracking-widest mb-1 block">{park.location}</span>
                                <h3 className="text-white text-2xl font-bold font-heading group-hover:text-safari-gold transition-colors">{park.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/gallery" className="btn-outline">
                        View Full Gallery
                    </Link>
                </div>
            </Container>
        </section>
    );
}
