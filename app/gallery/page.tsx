import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { getContinents } from '@/lib/gallery-cloud';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
    const continents = await getContinents();

    return (
        <section className="pt-32 pb-20 bg-neutral-cream min-h-screen">
            <Container>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-2 block">
                        Our Portfolio
                    </span>
                    <h1 className="text-display mb-6">Wildlife Photo Gallery</h1>
                    <p className="text-neutral-gray text-lg">
                        Explore our collection of breathtaking moments captured across the African savannahs 
                        and Asian jungles. Select a continent to begin your visual journey.
                    </p>
                </div>

                {/* Continent Cards */}
                {continents.length === 0 ? (
                    <div className="text-center py-20 text-neutral-gray">
                        <p>No gallery content found. Please add images to the gallery folders.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {continents.map((continent) => (
                            <Link
                                key={continent.slug}
                                href={`/gallery/${continent.slug}`}
                                className="group block relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl"
                            >
                                <Image
                                    src={continent.coverImage}
                                    alt={continent.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity group-hover:opacity-90" />
                                
                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-safari-gold font-bold uppercase tracking-widest text-xs">
                                            {continent.locationCount} Safari Destinations
                                        </span>
                                        <span className="text-white/60 text-xs">•</span>
                                        <span className="text-white/60 text-xs">
                                            {continent.totalImages} Photos
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">
                                        {continent.name}
                                    </h2>
                                    <p className="text-white/80 text-sm md:text-base max-w-md">
                                        {continent.description}
                                    </p>
                                    
                                    {/* Explore Button */}
                                    <div className="mt-6 flex items-center gap-2 text-safari-gold font-bold text-sm group-hover:gap-4 transition-all">
                                        Explore Gallery
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Location Preview Pills */}
                                <div className="absolute top-6 left-6 right-6 flex flex-wrap gap-2">
                                    {continent.locations.slice(0, 4).map((loc) => (
                                        <span 
                                            key={loc.slug}
                                            className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full"
                                        >
                                            {loc.name}
                                        </span>
                                    ))}
                                    {continent.locations.length > 4 && (
                                        <span className="bg-safari-gold/80 text-white text-xs px-3 py-1 rounded-full">
                                            +{continent.locations.length - 4} more
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Quick Stats */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-card shadow-card text-center">
                        <p className="text-3xl font-bold text-safari-gold">
                            {continents.reduce((sum, c) => sum + c.locationCount, 0)}
                        </p>
                        <p className="text-neutral-gray text-sm mt-1">Safari Destinations</p>
                    </div>
                    <div className="bg-white p-6 rounded-card shadow-card text-center">
                        <p className="text-3xl font-bold text-safari-gold">
                            {continents.reduce((sum, c) => sum + c.totalImages, 0)}
                        </p>
                        <p className="text-neutral-gray text-sm mt-1">Wildlife Photos</p>
                    </div>
                    <div className="bg-white p-6 rounded-card shadow-card text-center">
                        <p className="text-3xl font-bold text-safari-gold">2</p>
                        <p className="text-neutral-gray text-sm mt-1">Continents</p>
                    </div>
                    <div className="bg-white p-6 rounded-card shadow-card text-center">
                        <p className="text-3xl font-bold text-safari-gold">10+</p>
                        <p className="text-neutral-gray text-sm mt-1">Countries</p>
                    </div>
                </div>
            </Container>
        </section>
    );
}
