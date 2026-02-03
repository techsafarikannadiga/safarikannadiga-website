import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { normalizeImageUrl } from '@/lib/image-utils';
import { getFeaturedTours, Tour } from '@/lib/tours';

// Fallback tour data for when database is empty
const fallbackTours: Tour[] = [
    {
        id: 'fallback-1',
        title: "Explore Bandhavgarh & Kanha",
        destination: "Madhya Pradesh, India",
        start_date: "2025-02-20",
        end_date: "2025-02-28",
        spots_left: 0,
        spots_total: 12,
        image_url: "/images/placeholder-safari.jpg",
        brochure_url: null,
        highlights: ["12 Premium Safaris", "Tiger & Leopard Sightings", "Luxury Accommodation"],
        description: null,
        status: 'completed',
        featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatYear(dateStr: string) {
    return new Date(dateStr).getFullYear();
}

export async function UpcomingTours() {
    // Fetch tours from database
    let tours = await getFeaturedTours();

    // Use fallback if no tours found
    if (tours.length === 0) {
        tours = fallbackTours;
    }

    return (
        <section className="section-padding bg-[#2D5016] text-white">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-2 block">
                            Join Us
                        </span>
                        <h2 className="text-display text-white mb-4">Upcoming Safari Tours</h2>
                        <p className="text-white/80 text-lg">
                            Secure your spot on our next wildlife adventure. Limited seats available!
                        </p>
                    </div>
                    <Link href="/contact" className="text-safari-gold font-bold flex items-center gap-2 group transition-all">
                        Enquire Now
                        <span className="w-8 h-px bg-safari-gold/30 group-hover:w-12 transition-all" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tours.map((tour) => (
                        <div key={tour.id} className={`bg-white/10 backdrop-blur-sm rounded-card overflow-hidden transition-all duration-300 group ${tour.status === 'completed' ? 'opacity-80 grayscale hover:grayscale-0' : 'hover:bg-white/15'}`}>
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={normalizeImageUrl(tour.image_url || '/images/placeholder-safari.jpg')}
                                    alt={tour.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-forest-green to-transparent" />

                                {/* Status Badge */}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-sm ${tour.status === 'completed'
                                    ? 'bg-neutral-gray text-white'
                                    : tour.status === 'sold-out'
                                        ? 'bg-red-500 text-white'
                                        : tour.spots_left <= 2
                                            ? 'bg-red-500 text-white'
                                            : 'bg-safari-gold text-white'
                                    }`}>
                                    {tour.status === 'completed' ? 'Completed' :
                                        tour.status === 'sold-out' ? 'Sold Out' :
                                            (tour.spots_left <= 2 ? 'Almost Full!' : `${tour.spots_left} spots left`)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Dates */}
                                <div className={`flex items-center gap-2 font-bold mb-3 ${tour.status === 'completed' ? 'text-white/60' : 'text-safari-gold'}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm">
                                        {formatDate(tour.start_date)} - {formatDate(tour.end_date)}, {formatYear(tour.start_date)}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 font-heading">
                                    {tour.title}
                                </h3>
                                <p className="text-white/70 text-sm mb-4">{tour.destination}</p>

                                {/* Highlights */}
                                <ul className="space-y-2 mb-6">
                                    {tour.highlights.map((highlight, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                                            <svg className={`w-4 h-4 shrink-0 ${tour.status === 'completed' ? 'text-white/40' : 'text-safari-gold'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {tour.status === 'completed' || tour.status === 'sold-out' ? (
                                    <div className="w-full bg-white/10 text-white/60 py-3 rounded-full font-bold text-center block cursor-not-allowed">
                                        {tour.status === 'completed' ? 'Tour Completed' : 'Sold Out'}
                                    </div>
                                ) : (
                                    <a
                                        href={`https://wa.me/254726088361?text=${encodeURIComponent(`Hi, I'm interested in the "${tour.title}" tour. Please share more details.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-safari-gold text-white py-3 rounded-full font-bold text-center flex items-center justify-center gap-2 hover:bg-safari-gold-dark transition-colors"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Enquire Now
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Custom Tours CTA */}
                <div className="mt-12 text-center">
                    <p className="text-white/80 mb-4">
                        Can't find a date that works? We also organize private and custom safari tours.
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-forest-green transition-colors">
                        Request Custom Tour
                    </Link>
                </div>
            </Container>
        </section>
    );
}
