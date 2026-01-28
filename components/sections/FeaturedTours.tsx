import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { normalizeImageUrl } from '@/lib/image-utils';
import { getFeaturedLocations } from '@/lib/gallery-cloud';

interface DestinationGuide {
    title: string;
    slug: string;
    location: string;
    image: string;
    excerpt: string;
    wildlife: string[];
    bestTime: string;
}

// Fallback destination guides when no data from backend
const fallbackGuides: DestinationGuide[] = [
    {
        title: "Masai Mara: Witness the Great Migration",
        slug: "masai-mara",
        location: "Kenya",
        image: "/images/placeholder-safari.jpg",
        excerpt: "Home to the world-famous Great Migration, the Masai Mara offers unparalleled wildlife viewing with over 1.5 million wildebeest crossing the Mara River.",
        wildlife: ["Lions", "Leopards", "Cheetahs", "Elephants", "Wildebeest"],
        bestTime: "July - October"
    },
    {
        title: "Nairobi National Park: Urban Safari",
        slug: "nairobi-national-park",
        location: "Kenya",
        image: "/images/placeholder-safari.jpg",
        excerpt: "The only national park within a capital city, offering an incredible urban wildlife experience with the Nairobi skyline as a backdrop.",
        wildlife: ["Lions", "Rhinos", "Buffalos", "Giraffes", "Zebras"],
        bestTime: "June - October"
    },
    {
        title: "Bandhavgarh: Land of Tigers",
        slug: "bandhavgarh",
        location: "Madhya Pradesh, India",
        image: "/images/placeholder-safari.jpg",
        excerpt: "With the highest density of Bengal tigers in India, Bandhavgarh offers near-guaranteed tiger sightings set against dramatic forests and ancient ruins.",
        wildlife: ["Bengal Tigers", "Leopards", "Sloth Bears", "Sambar Deer", "Langurs"],
        bestTime: "October - June"
    }
];

export async function FeaturedDestinations() {
    // Fetch locations from backend
    let destinationGuides: DestinationGuide[] = [];
    
    try {
        const locations = await getFeaturedLocations(3);
        
        if (locations.length > 0) {
            destinationGuides = locations.map(loc => ({
                title: loc.name,
                slug: loc.slug,
                location: loc.country || loc.continentSlug,
                image: loc.coverImage,
                excerpt: loc.description || `Explore the stunning wildlife and landscapes of ${loc.name}.`,
                wildlife: Array.isArray(loc.wildlife) ? loc.wildlife : (loc.wildlife ? String(loc.wildlife).split(',').map(w => w.trim()) : ['Wildlife']),
                bestTime: "Year-round"
            }));
        } else {
            destinationGuides = fallbackGuides;
        }
    } catch (error) {
        console.error('Error fetching featured locations:', error);
        destinationGuides = fallbackGuides;
    }
    return (
        <section className="section-padding bg-white">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-2 block">
                            Destination Guides
                        </span>
                        <h2 className="text-display mb-4">What You'll Discover</h2>
                        <p className="text-neutral-gray text-lg">
                            Explore our most popular destinations and learn what makes each safari unique.
                        </p>
                    </div>
                    <Link href="/gallery" className="text-safari-gold font-bold flex items-center gap-2 group transition-all">
                        View Gallery
                        <span className="w-8 h-px bg-safari-gold/30 group-hover:w-12 transition-all" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {destinationGuides.map((guide) => (
                        <article key={guide.slug} className="group bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 border border-neutral-gray/10">
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                                <Image
                                    src={normalizeImageUrl(guide.image)}
                                    alt={guide.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                                {/* Location Badge */}
                                <div className="absolute top-4 left-4 bg-safari-gold text-white px-3 py-1 rounded-full text-sm font-bold">
                                    {guide.location}
                                </div>

                                {/* Best Time Badge */}
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-neutral-charcoal flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Best: {guide.bestTime}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-neutral-charcoal mb-3 font-heading group-hover:text-safari-gold transition-colors">
                                    {guide.title}
                                </h3>

                                <p className="text-neutral-gray text-sm mb-4 line-clamp-3">
                                    {guide.excerpt}
                                </p>

                                {/* Wildlife Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {guide.wildlife.slice(0, 4).map((animal, i) => (
                                        <span key={i} className="bg-neutral-cream px-2 py-1 rounded text-xs text-neutral-charcoal">
                                            {animal}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Link
                                    href={`/gallery/africa/${guide.slug}`}
                                    className="text-safari-gold font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                                >
                                    View Photos & Details
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </Container>
        </section>
    );
}
