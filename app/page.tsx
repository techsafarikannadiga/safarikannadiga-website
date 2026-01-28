import { Hero } from '@/components/sections/Hero';
import { FeaturedDestinations } from '@/components/sections/FeaturedTours';
import { UpcomingTours } from '@/components/sections/UpcomingTours';
import { Destinations } from '@/components/sections/Destinations';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { TestimonialsSection, ShareExperienceSection } from '@/components/sections/TestimonialsSection';
import { getGeneralSettings } from '@/lib/content';

export default async function HomePage() {
    const settings = await getGeneralSettings();

    return (
        <div className="flex flex-col overflow-x-hidden">
            <Hero
                title={settings?.brand?.tagline || "Discover the Wild Heart of Africa & Asia"}
                subtitle={settings?.brand?.description || "Expert-led photography safaris and luxury wildlife tours."}
                backgroundImage={settings?.heroImage}
            />
            <FeaturedDestinations />
            <UpcomingTours />
            <Destinations />
            <WhyChooseUs />
            <TestimonialsSection />
            <ShareExperienceSection />
        </div>
    );
}
