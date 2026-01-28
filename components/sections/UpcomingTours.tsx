import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { normalizeImageUrl } from '@/lib/image-utils';

interface UpcomingTour {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    spotsLeft: number;
    totalSpots: number;
    image: string;
    highlights: string[];
    status?: 'upcoming' | 'completed' | 'sold-out';
    link?: string;
}

// Upcoming tours data - dates only, no pricing
const upcomingTours: UpcomingTour[] = [
    {
        title: "Explore Bandhavgarh & Kanha",
        destination: "Madhya Pradesh, India",
        startDate: "2025-02-20",
        endDate: "2025-02-28",
        spotsLeft: 0,
        totalSpots: 12,
        image: "/images/placeholder-safari.jpg",
        highlights: ["12 Premium Safaris", "Tiger & Leopard Sightings", "Luxury Accommodation"],
        status: 'completed',
        link: 'https://www.safarikannadiga.com/upcomingtours/feb-bandhavgarh'
    }
];

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatYear(dateStr: string) {
    return new Date(dateStr).getFullYear();
}

export function UpcomingTours() {
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
                    {upcomingTours.map((tour, index) => (
                        <div key={index} className={`bg-white/10 backdrop-blur-sm rounded-card overflow-hidden transition-all duration-300 group ${tour.status === 'completed' ? 'opacity-80 grayscale hover:grayscale-0' : 'hover:bg-white/15'}`}>
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={normalizeImageUrl(tour.image)}
                                    alt={tour.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-forest-green to-transparent" />

                                {/* Status Badge */}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-sm ${tour.status === 'completed'
                                    ? 'bg-neutral-gray text-white'
                                    : tour.spotsLeft <= 2
                                        ? 'bg-red-500 text-white'
                                        : 'bg-safari-gold text-white'
                                    }`}>
                                    {tour.status === 'completed' ? 'Completed' : (tour.spotsLeft <= 2 ? 'Almost Full!' : `${tour.spotsLeft} spots left`)}
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
                                        {formatDate(tour.startDate)} - {formatDate(tour.endDate)}, {formatYear(tour.startDate)}
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
                                {tour.status === 'completed' ? (
                                    <div className="w-full bg-white/10 text-white/60 py-3 rounded-full font-bold text-center block cursor-not-allowed">
                                        Tour Completed
                                    </div>
                                ) : (
                                    <Link
                                        href={`/contact?tour=${encodeURIComponent(tour.title)}`}
                                        className="w-full bg-safari-gold text-white py-3 rounded-full font-bold text-center block hover:bg-safari-gold-dark transition-colors"
                                    >
                                        Enquire Now
                                    </Link>
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
