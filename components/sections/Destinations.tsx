import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getFeaturedLocations } from '@/lib/gallery-cloud';

export async function Destinations() {
    // Get featured parks from gallery backend (ImageKit + Supabase)
    const featuredLocations = await getFeaturedLocations(4);
    
    // Fallback to placeholder data if no locations with images
    const featuredParks = featuredLocations.length > 0 
        ? featuredLocations.map(loc => ({
            name: loc.name,
            location: loc.country,
            image: loc.coverImage,
            href: `/gallery/${loc.continentSlug}/${loc.slug}`
        }))
        : [
            {
                name: 'Masai Mara',
                location: 'Kenya',
                image: '/images/placeholder-safari.jpg',
                href: '/gallery/africa/masai-mara'
            },
            {
                name: 'Nairobi National Park',
                location: 'Kenya',
                image: '/images/placeholder-safari.jpg',
                href: '/gallery/africa/nairobi-national-park'
            },
            {
                name: 'Ranthambore',
                location: 'India',
                image: '/images/placeholder-safari.jpg',
                href: '/gallery/asia/ranthambore'
            },
            {
                name: 'Kaziranga',
                location: 'India',
                image: '/images/placeholder-safari.jpg',
                href: '/gallery/asia/kaziranga'
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
                            <Image
                                src={park.image}
                                alt={park.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
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
