import { Hero } from '@/components/sections/Hero';
import { FeaturedDestinations } from '@/components/sections/FeaturedTours';
import { UpcomingTours } from '@/components/sections/UpcomingTours';
import { Destinations } from '@/components/sections/Destinations';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { TestimonialsSection, ShareExperienceSection } from '@/components/sections/TestimonialsSection';
import { getGeneralSettings } from '@/lib/content';
import { getFeaturedLocations } from '@/lib/gallery-cloud';

export default async function HomePage() {
    const settings = await getGeneralSettings();
    const featuredLocations = await getFeaturedLocations(4);

    return (
        <div className="flex flex-col overflow-x-hidden">
            <Hero
                title={settings?.brand?.tagline || "Discover the Wild Heart of Africa & Asia"}
                subtitle={settings?.brand?.description || "Expert-led photography safaris and luxury wildlife tours."}
                backgroundImage={settings?.heroImage}
            />
            <FeaturedDestinations locations={featuredLocations} />
            <UpcomingTours />
            <Destinations locations={featuredLocations} />
            <WhyChooseUs />
            <TestimonialsSection />
            <ShareExperienceSection />
        </div>
    );
}
