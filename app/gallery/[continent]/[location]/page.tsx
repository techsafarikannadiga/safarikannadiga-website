import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { getContinent, getLocation, getImages } from '@/lib/gallery-cloud';
import GalleryLocationClient from '@/components/gallery/GalleryLocationClient';

export const dynamic = 'force-dynamic';

export default async function LocationGalleryPage({ params }: { params: Promise<{ continent: string; location: string }> }) {
    const { continent: continentSlug, location: locationSlug } = await params;

    const continent = await getContinent(continentSlug);
    const location = await getLocation(continentSlug, locationSlug);
    
    if (!continent || !location) return notFound();

    const images = await getImages(continentSlug, locationSlug);
    const coverImage = images.length > 0 ? images[0].src : '/images/placeholder-safari.jpg';

    return (
        <section className="pt-32 pb-20 bg-neutral-cream min-h-screen">
            <Container>
                {/* Breadcrumb */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-gray">
                        <Link href="/gallery" className="hover:text-safari-gold transition-colors">Gallery</Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <Link href={`/gallery/${continentSlug}`} className="hover:text-safari-gold transition-colors">{continent.name}</Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-safari-gold">{location.name}</span>
                    </div>
                </div>

                {/* Location Header */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div>
                        <span className="text-safari-gold text-sm font-bold uppercase tracking-wider block mb-2">
                            {location.country}
                        </span>
                        <h1 className="text-display mb-6">{location.name}</h1>
                        <p className="text-neutral-gray text-lg leading-relaxed mb-6">
                            {location.description}
                        </p>

                        {/* Wildlife Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {location.wildlife.map((animal) => (
                                <span 
                                    key={animal}
                                    className="text-xs uppercase font-bold tracking-wider text-forest-green bg-forest-green/10 px-3 py-1 rounded-full"
                                >
                                    {animal}
                                </span>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-8 pt-4 border-t border-neutral-gray/20">
                            <div>
                                <p className="text-2xl font-bold text-safari-gold">{images.length}</p>
                                <p className="text-sm text-neutral-gray">Photos</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-safari-gold">{continent.name}</p>
                                <p className="text-sm text-neutral-gray">Continent</p>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-xl">
                        <Image
                            src={coverImage}
                            alt={location.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                </div>

                {/* Photo Gallery */}
                <GalleryLocationClient 
                    images={images.map(img => ({ 
                        src: img.src, 
                        filename: img.filename,
                        alt: img.alt, 
                        publicId: img.publicId
                    }))} 
                    title={location.name} 
                />

                {/* Share Experience CTA */}
                <div className="mt-16 bg-forest-green text-white p-8 md:p-12 rounded-card text-center">
                    <h3 className="text-h2 text-white mb-4">Been to {location.name}?</h3>
                    <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                        Share your experience and help fellow wildlife enthusiasts plan their adventure.
                        Your stories inspire others to explore the wild.
                    </p>
                    <Link
                        href="/share-experience"
                        className="inline-flex items-center gap-2 bg-safari-gold text-white px-8 py-3 rounded-full font-bold hover:bg-safari-gold-dark transition-colors"
                    >
                        Share Your Experience
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </Container>
        </section>
    );
}
