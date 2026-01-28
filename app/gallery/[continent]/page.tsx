import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { getContinent } from '@/lib/gallery-cloud';

export const dynamic = 'force-dynamic';

export default async function ContinentGalleryPage({ params }: { params: Promise<{ continent: string }> }) {
    const { continent: continentSlug } = await params;
    const continent = await getContinent(continentSlug);

    if (!continent) return notFound();

    return (
        <section className="pt-32 pb-20 bg-neutral-cream min-h-screen">
            <Container>
                {/* Header */}
                <div className="mb-12">
                    <Link href="/gallery" className="text-safari-gold font-bold text-sm flex items-center gap-2 mb-4 hover:underline">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Gallery
                    </Link>
                    <h1 className="text-display">{continent.name} Safari Gallery</h1>
                    <p className="text-neutral-gray text-lg mt-4 max-w-3xl">
                        {continent.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-neutral-gray">
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {continent.locationCount} Destinations
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {continent.totalImages} Photos
                        </span>
                    </div>
                </div>

                {/* Location Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {continent.locations.map((loc) => (
                        <Link
                            key={loc.slug}
                            href={`/gallery/${continentSlug}/${loc.slug}`}
                            className="group block bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <Image
                                    src={loc.coverImage}
                                    alt={loc.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                
                                {/* Photo Count Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-neutral-charcoal px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {loc.imageCount}
                                </div>

                                {/* View Button on Hover */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-safari-gold text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        View Gallery
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <span className="text-safari-gold text-xs font-bold uppercase tracking-wider">{loc.country}</span>
                                <h3 className="text-xl font-bold font-heading mb-2 group-hover:text-safari-gold transition-colors">{loc.name}</h3>
                                <p className="text-neutral-gray text-sm line-clamp-2 mb-4">{loc.description}</p>
                                
                                {/* Wildlife Tags */}
                                <div className="flex flex-wrap gap-1">
                                    {loc.wildlife.slice(0, 3).map((animal) => (
                                        <span 
                                            key={animal}
                                            className="text-[10px] uppercase font-bold tracking-wider text-forest-green bg-forest-green/10 px-2 py-0.5 rounded"
                                        >
                                            {animal}
                                        </span>
                                    ))}
                                    {loc.wildlife.length > 3 && (
                                        <span className="text-[10px] text-neutral-gray">+{loc.wildlife.length - 3} more</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {continent.locations.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-card shadow-card">
                        <p className="text-neutral-gray">No safari destinations found in {continent.name}.</p>
                    </div>
                )}
            </Container>
        </section>
    );
}
