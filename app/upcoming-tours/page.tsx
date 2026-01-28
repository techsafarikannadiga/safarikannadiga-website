import { UpcomingTours } from '@/components/sections/UpcomingTours';
import { Container } from '@/components/ui/Container';

export default function UpcomingToursPage() {
    return (
        <div className="pt-24 pb-20">
            <div className="bg-neutral-cream py-12 mb-8">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Upcoming Tours</h1>
                        <p className="text-lg text-neutral-gray">
                            Join us on our scheduled group departures. Carefully planned itineraries at the best times for wildlife viewing.
                        </p>
                    </div>
                </Container>
            </div>

            <UpcomingTours />
        </div>
    );
}
