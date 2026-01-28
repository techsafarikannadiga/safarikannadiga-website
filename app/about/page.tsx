import { Container } from '@/components/ui/Container';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="pt-24 md:pt-32">
            {/* Hero */}
            <section className="relative min-h-[50vh] flex items-center justify-center mb-16">
                <Image
                    src="/images/about-hero.jpg"
                    alt="About SafariKannadiga"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/60 z-10" />
                <Container className="relative z-20 text-white text-center py-16">
                    <span className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-widest uppercase bg-safari-gold text-white rounded-full shadow-lg">About Us</span>
                    <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 drop-shadow-2xl !text-white">Finding Inspiration<br />in Every Turn</h1>
                </Container>
            </section>

            {/* Our Story */}
            <Container className="mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-neutral-charcoal">Our Story</h2>
                        <div className="space-y-4 text-lg text-neutral-gray leading-relaxed">
                            <p>
                                At Safari Kannadiga, we are passionate about creating unforgettable travel experiences that connect our clients with the awe-inspiring wildlife and rich cultural heritage around the globe.
                            </p>
                            <p>
                                Founded by <strong>Tilak Raj</strong>, an ICT and management professional turned wildlife photographer, our company combines a deep love for nature, photography, and sustainable tourism to offer journeys that leave lasting impressions.
                            </p>
                            <p>
                                We’re not just about safaris; we’re about connecting people to nature, creating memories, and inspiring a deeper appreciation for the beauty and diversity of our world.
                            </p>
                        </div>
                    </div>
                    <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <Image
                            src="/images/about-story.jpg"
                            alt="Tilak Raj - Founder"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </Container>

            {/* Mission & Vision */}
            <section className="bg-[#F8F6F3] py-20 mb-20">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-[#2D5016]">
                            <h3 className="text-2xl font-bold font-heading mb-4 text-[#2D5016]">Our Mission</h3>
                            <p className="text-neutral-gray text-lg leading-relaxed">
                                To create unforgettable travel experiences that connect our clients with wildlife and culture around the globe, while promoting sustainable tourism and supporting local communities.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-[#2D5016]">
                            <h3 className="text-2xl font-bold font-heading mb-4 text-[#2D5016]">Our Vision</h3>
                            <p className="text-neutral-gray text-lg leading-relaxed">
                                To become a globally recognized tour company known for excellence, sustainability, and transformative journeys that inspire and educate travelers.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Core Values */}
            <Container className="mb-20">
                <div className="text-center mb-12">
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-2 block">Our Philosophy</span>
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-neutral-charcoal">Core Values</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Customer-Centric", desc: "Delivering personalized and memorable experiences.", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { title: "Authenticity", desc: "Providing genuine wildlife and cultural interactions.", icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" },
                        { title: "Sustainability", desc: "Protecting nature and promoting eco-tourism.", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { title: "Innovation", desc: "Continuously improving to exceed customer expectations.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                    ].map((item, index) => (
                        <div key={index} className="text-center p-6 border border-neutral-gray/10 rounded-2xl hover:border-safari-gold transition-colors hover:shadow-lg bg-white">
                            <div className="w-16 h-16 bg-[#2D5016]/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#2D5016]">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                            </div>
                            <h3 className="text-xl font-bold font-heading mb-2 text-neutral-charcoal">{item.title}</h3>
                            <p className="text-neutral-gray text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Container>

            {/* Why Choose Us - Footer Section */}
            <section className="bg-[#2D5016] py-20 text-white relative overflow-hidden">
                {/* Background Pattern/Overlay */}
                <div className="absolute inset-0 bg-black/10"></div>

                <Container className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-4 block">Why Choose Us?</span>
                            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8 !text-white leading-tight">Experience the<br />Wild Difference</h2>
                            <ul className="space-y-6">
                                {[
                                    "Tailor-made itineraries for individuals and groups.",
                                    "Passionate and experienced local guides.",
                                    "Commitment to eco-friendly and community-based tourism.",
                                    "Stress-free, seamless travel planning."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-safari-gold text-[#2D5016] flex items-center justify-center shrink-0 font-bold shadow-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="text-lg font-medium !text-white/90">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white/5 p-10 rounded-3xl backdrop-blur-md border border-white/10 text-center shadow-2xl">
                            <h3 className="text-2xl font-bold font-heading mb-4 !text-white">Get Inspired</h3>
                            <p className="!text-white/80 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                                Discover the world differently with us. Explore our gallery, plan your next adventure, and let’s create unforgettable memories together!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/gallery" className="btn-primary px-8 py-3 text-lg w-full sm:w-auto">Explore Gallery</Link>
                                <Link href="/contact" className="btn-outline border-white !text-white hover:bg-white hover:!text-[#2D5016] px-8 py-3 text-lg w-full sm:w-auto">Plan Your Adventure</Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
}
