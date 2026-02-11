import { Hero } from '@/components/sections/Hero';
import { FeaturedDestinations } from '@/components/sections/FeaturedTours';
import { UpcomingTours } from '@/components/sections/UpcomingTours';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { TestimonialsSection, ShareExperienceSection } from '@/components/sections/TestimonialsSection';
import { getGeneralSettings } from '@/lib/content';
import { getFeaturedLocations, getContinents } from '@/lib/gallery-cloud';
import { getTours } from '@/lib/tours';
import { getApprovedTestimonials } from '@/lib/testimonials';

export default async function HomePage() {
    const settings = await getGeneralSettings();
    const featuredLocations = await getFeaturedLocations(5);
    const continents = await getContinents();
    const tours = await getTours({ status: 'all' });
    const testimonials = await getApprovedTestimonials();

    const stats = {
        imagesCount: continents.reduce((acc, c) => acc + c.totalImages, 0),
        toursCount: tours.length,
        testimonialsCount: testimonials.length
    };

    return (
        <div className="flex flex-col overflow-x-hidden">
            <Hero
                title={settings?.brand?.tagline || "Discover the Wild Heart of Africa & Asia"}
                subtitle={settings?.brand?.description || "Expert-led photography safaris and luxury wildlife tours."}
                backgroundImage={settings?.heroImage}
                featuredLocations={featuredLocations}
            />
            <FeaturedDestinations locations={featuredLocations} />
            <TestimonialsSection />
            <UpcomingTours />
            <WhyChooseUs stats={stats} />
            <ShareExperienceSection />
        </div>
    );
}
