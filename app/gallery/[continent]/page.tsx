
// Force dynamic rendering to ensure cover photo changes reflect immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { getContinents, getContinent, GalleryLocation } from '@/lib/gallery-cloud';
import { toSlug } from '@/lib/utils/slugify';

// Generate static params for all continents at build time
export async function generateStaticParams() {
    const continents = await getContinents();
    return continents.map((continent) => ({
        continent: continent.slug,
    }));
}

export default async function ContinentGalleryPage({ params }: { params: Promise<{ continent: string }> }) {
    const { continent: continentSlug } = await params;
    const continent = await getContinent(continentSlug);

    if (!continent) return notFound();

    // Group Locations by Country
    const countriesMap = continent.locations.reduce((acc, loc) => {
        const countryNameRaw = loc.country || 'Other Destinations';
        const countrySlug = toSlug(countryNameRaw);

        // Use the slug as the unique key to merge "Tanzania" and "Tanzania "
        if (!acc[countrySlug]) {
            acc[countrySlug] = {
                name: countryNameRaw.trim(), // Use trim() to ensure clean display name
                slug: countrySlug,
                locations: [],
                imageCount: 0,
                coverImage: loc.coverImage
            };
        }
        acc[countrySlug].locations.push(loc);
        acc[countrySlug].imageCount += loc.imageCount;
        return acc;
    }, {} as Record<string, { name: string; slug: string; locations: GalleryLocation[]; imageCount: number; coverImage: string }>);

    const countries = Object.values(countriesMap).sort((a, b) => a.name.localeCompare(b.name));

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
                            {/* Show country count? Or just keep generic stats */}
                            {countries.length} Countries
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {continent.totalImages} Photos
                        </span>
                    </div>
                </div>

                {/* Country Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {countries.map((country, idx) => (
                        <Link
                            key={country.slug}
                            href={`/gallery/${continentSlug}/${country.slug}`} // Link to Country Page
                            className="group block bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                    <Image
                                        src={country.coverImage} // First location cover
                                        alt={country.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        priority={idx < 3}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Destination Count Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-neutral-charcoal px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {country.locations.length} Parks
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl font-bold font-heading text-neutral-charcoal mb-2 group-hover:text-safari-gold transition-colors">
                                    {country.name}
                                </h3>
                                <p className="text-neutral-gray text-sm line-clamp-2">
                                    Explore {country.locations.length} wildlife destinations in {country.name}.
                                </p>
                                <div className="mt-4 flex items-center text-sm font-bold text-safari-gold">
                                    View Destinations
                                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}
