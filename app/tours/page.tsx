import { Container } from '@/components/ui/Container';
import Image from 'next/image';
import Link from 'next/link';
import { getAllContent } from '@/lib/content';
import { normalizeImageUrl } from '@/lib/image-utils';

interface Tour {
    title: string;
    slug: string;
    heroImage: string;
    duration: string;
    groupSize: string;
    difficulty: string;
    highlights: string[];
}

export default async function ToursPage() {
    const tours = getAllContent('tours') as unknown as Tour[];

    return (
        <div className="pt-24 md:pt-32 pb-section bg-neutral-cream">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-3xl">
                        <h1 className="text-display mb-4">Unforgettable Expeditions</h1>
                        <p className="text-neutral-gray text-lg">Meticulously planned safaris designed for peak wildlife action and photography opportunities.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tours.map((tour) => (
                        <div key={tour.slug} className="group bg-white rounded-card overflow-hidden shadow-card card-hover-effect">
                            <div className="relative h-64">
                                <Image src={normalizeImageUrl(tour.heroImage)} alt={tour.title} fill className="object-cover" />
                                <div className="absolute top-4 right-4 bg-safari-gold text-white px-3 py-1 rounded-full text-xs font-bold">
                                    {tour.duration}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold font-heading mb-3">{tour.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-neutral-gray mb-4">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        {tour.groupSize}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        {tour.difficulty}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {tour.highlights?.slice(0, 3).map((h: string) => (
                                        <span key={h} className="text-[10px] uppercase font-bold tracking-wider text-forest-green bg-forest-green/10 px-2 py-0.5 rounded">{h}</span>
                                    ))}
                                </div>
                                <Link href={`/tours/${tour.slug}`} className="btn-primary w-full text-sm">View Details</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}
