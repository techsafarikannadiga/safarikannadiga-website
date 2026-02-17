
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { getContinents, getContinent } from '@/lib/gallery-cloud';
import { toSlug } from '@/lib/utils/slugify';

export const revalidate = 3600; // ISR: Revalidate every hour

export async function generateStaticParams() {
    const continents = await getContinents();
    const params: { continent: string; country: string }[] = [];

    continents.forEach(continent => {
        const countries = new Set(continent.locations.map(l => toSlug(l.country || 'other-destinations')));
        countries.forEach(countrySlug => {
            params.push({
                continent: continent.slug,
                country: countrySlug
            });
        });
    });

    return params;
}

export default async function CountryGalleryPage({ params }: { params: Promise<{ continent: string; country: string }> }) {
    const { continent: continentSlug, country: countrySlug } = await params;
    const continent = await getContinent(continentSlug);

    if (!continent) return notFound();

    // Filter locations for this country
    const locations = continent.locations.filter(loc =>
        toSlug(loc.country || 'other-destinations') === countrySlug
    );

    if (locations.length === 0) return notFound();

    // Get country name from first matching location
    const countryName = locations[0].country || 'Other Destinations';

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
                        <span className="text-safari-gold">{countryName}</span>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-display">{countryName} Safari Destinations</h1>
                    <p className="text-neutral-gray text-lg mt-4 max-w-3xl">
                        Explore our curated selection of wildlife parks and reserves in {countryName}.
                    </p>
                </div>

                {/* Location Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((loc, idx) => (
                        <Link
                            key={loc.slug}
                            href={`/gallery/${continentSlug}/${countrySlug}/${loc.slug}`} // Link to Location Page (nested)
                            className="group block bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                    <Image
                                        src={loc.coverImage}
                                        alt={loc.name}
                                        fill
                                        style={{
                                            objectPosition: `${loc.focalX}% ${loc.focalY}%`,
                                            transform: `scale(${loc.zoom})`
                                        }}
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        priority={idx < 3}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Photo Count Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-neutral-charcoal px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {loc.imageCount}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl font-bold font-heading text-neutral-charcoal mb-2 group-hover:text-safari-gold transition-colors">
                                    {loc.name}
                                </h3>
                                <p className="text-neutral-gray text-sm line-clamp-2">
                                    {loc.description}
                                </p>
                                <div className="mt-4 flex items-center text-sm font-bold text-safari-gold">
                                    View Gallery
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
