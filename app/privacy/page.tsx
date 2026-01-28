import { Container } from '@/components/ui/Container';

export const metadata = {
    title: 'Privacy Policy | SafariKannadiga',
    description: 'Privacy policy for SafariKannadiga - how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
    return (
        <div className="pt-32 pb-20">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-display mb-8">Privacy Policy</h1>
                    <p className="text-neutral-gray mb-8">Last updated: January 2024</p>

                    <div className="prose prose-lg max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">1. Information We Collect</h2>
                            <p className="text-neutral-gray mb-4">
                                We collect information you provide directly to us, such as when you:
                            </p>
                            <ul className="list-disc pl-6 text-neutral-gray space-y-2 mb-4">
                                <li>Fill out a contact or inquiry form</li>
                                <li>Subscribe to our newsletter</li>
                                <li>Book a safari tour with us</li>
                                <li>Share your safari experience</li>
                                <li>Contact us via email or WhatsApp</li>
                            </ul>
                            <p className="text-neutral-gray">
                                This information may include your name, email address, phone number,
                                travel preferences, and any other information you choose to provide.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">2. How We Use Your Information</h2>
                            <p className="text-neutral-gray mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 text-neutral-gray space-y-2">
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Plan and organize your safari experience</li>
                                <li>Send you updates about your booking</li>
                                <li>Send promotional materials (with your consent)</li>
                                <li>Improve our services and website</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">3. Information Sharing</h2>
                            <p className="text-neutral-gray">
                                We do not sell, trade, or otherwise transfer your personal information to
                                third parties without your consent, except as necessary to provide our
                                services (such as sharing with lodges or transport providers for your
                                safari booking) or as required by law.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">4. Data Security</h2>
                            <p className="text-neutral-gray">
                                We implement appropriate security measures to protect your personal
                                information against unauthorized access, alteration, disclosure, or
                                destruction. However, no method of transmission over the Internet is
                                100% secure.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">5. Cookies</h2>
                            <p className="text-neutral-gray">
                                Our website may use cookies to enhance your browsing experience.
                                You can choose to disable cookies through your browser settings,
                                though this may affect certain features of our website.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">6. Your Rights</h2>
                            <p className="text-neutral-gray mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-neutral-gray space-y-2">
                                <li>Access the personal information we hold about you</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Request deletion of your information</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 font-heading">7. Contact Us</h2>
                            <p className="text-neutral-gray">
                                If you have any questions about this Privacy Policy, please contact us at:
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
