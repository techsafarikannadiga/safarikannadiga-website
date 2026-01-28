import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { getAllContent } from '@/lib/content';
import { normalizeImageUrl } from '@/lib/image-utils';

interface TourPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const tours = getAllContent('tours');
    return tours.map((tour: any) => ({ slug: tour.slug }));
}

export default async function TourDetailPage({ params }: TourPageProps) {
    const { slug } = await params;
    const tours = getAllContent('tours') as any[];
    const tour = tours.find(t => t.slug === slug);

    if (!tour) {
        notFound();
    }

    return (
        <div className="pt-24 pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px]">
                <Image
                    src={normalizeImageUrl(tour.heroImage)}
                    alt={tour.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Container className="relative h-full flex items-end pb-12 z-10">
                    <div className="max-w-3xl">
                        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-widest uppercase bg-safari-gold text-white rounded-full">
                            {tour.duration}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
                            {tour.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/80">
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {tour.groupSize}
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {tour.difficulty}
                            </span>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="prose prose-lg max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: tour.content }} />
                        </div>

                        {/* Highlights */}
                        {tour.highlights && tour.highlights.length > 0 && (
                            <div className="bg-neutral-cream p-8 rounded-card">
                                <h3 className="text-xl font-bold mb-6 font-heading">Tour Highlights</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tour.highlights.map((highlight: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-safari-gold shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-neutral-charcoal">{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Enquiry Box (NO PRICING) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white p-8 rounded-card shadow-xl border border-neutral-gray/10">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold font-heading mb-2">Interested in this tour?</h3>
                                <p className="text-neutral-gray text-sm">Get in touch for dates, availability and custom packages.</p>
                            </div>

                            <Link
                                href={`/contact?tour=${tour.slug}`}
                                className="btn-primary w-full py-4 text-lg mb-4 block text-center"
                            >
                                Send Enquiry
                            </Link>

                            <a
                                href={`https://wa.me/254726088361?text=Hi, I'm interested in the ${tour.title} tour. Can you share more details?`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary w-full py-4 text-lg flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Chat on WhatsApp
                            </a>

                            <div className="mt-8 pt-6 border-t border-neutral-gray/10">
                                <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-neutral-gray">Quick Info</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-gray">Duration</span>
                                        <span className="font-bold">{tour.duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-gray">Group Size</span>
                                        <span className="font-bold">{tour.groupSize}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-gray">Difficulty</span>
                                        <span className="font-bold">{tour.difficulty}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-12 pt-8 border-t border-neutral-gray/10">
                    <Link href="/gallery" className="text-safari-gold font-bold flex items-center gap-2 hover:gap-4 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Back to Gallery
                    </Link>
                </div>
            </Container>
        </div>
    );
}
