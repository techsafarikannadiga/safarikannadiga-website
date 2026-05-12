import { Container } from '@/components/ui/Container';

export const metadata = {
    title: 'Terms of Service | Safari Kannadiga',
    description: 'Terms and conditions for Safari Kannadiga services and safari bookings.',
};

export default function TermsPage() {
    return (
        <div className="pt-32 pb-20">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-display mb-8">Terms of Service</h1>
                    <p className="text-neutral-gray mb-8">Last updated: May 2026</p>

                    <div className="prose prose-lg max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">1. Acceptance of Terms</h2>
                            <p className="text-neutral-gray">
                                By accessing the Safari Kannadiga website and booking our safari packages, you agree to follow and be bound by these Terms of Service and all applicable laws and regulations.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">2. Bookings & Payments</h2>
                            <p className="text-neutral-gray mb-4">
                                All tour reservations depend on availability. Your booking is officially confirmed only after the required deposit is received and acknowledged in writing by our team.
                            </p>
                            <ul className="list-disc pl-6 text-neutral-gray space-y-2">
                                <li>A booking deposit is required to secure your reservation.</li>
                                <li>The final balance must be paid according to the detailed itinerary timeframe.</li>
                                <li>Failure to pay by the deadline may lead to cancellation of the booking.</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">3. Cancellations & Refunds</h2>
                            <p className="text-neutral-gray">
                                Cancellation fees may apply based on the notice period before your scheduled safari departure date. Specific lodge and park permit fees are often non-refundable and are passed through directly to the customer. Contact your booking agent for details.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">4. Travel Documents & Insurance</h2>
                            <p className="text-neutral-gray">
                                It is the traveler's absolute responsibility to ensure all passports, visas, health checks, and vaccinations are fully valid and up to date. We strongly recommend comprehensive travel and medical insurance for all participants.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">5. Limitations of Liability</h2>
                            <p className="text-neutral-gray">
                                Safari Kannadiga arranges travel, safari drives, and accommodation providers acting only as an agent. We are not responsible for any injuries, losses, damages, delays, or changes caused by forces outside of our reasonable control (e.g. weather, road conditions, strikes, or political issues).
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">6. Governing Law</h2>
                            <p className="text-neutral-gray">
                                Any claim relating to Safari Kannadiga services shall be governed by and construed in accordance with the local laws governing tourism in Kenya.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">7. Contact</h2>
                            <p className="text-neutral-gray">
                                If you require any clarification regarding our terms, reach us at:
                            </p>
                            <p className="text-neutral-charcoal font-bold mt-4">
                                Email: info@safarikannadiga.com<br />
                                Phone: +254 726 088361
                            </p>
                        </section>
                    </div>
                </div>
            </Container>
        </div>
    );
}
