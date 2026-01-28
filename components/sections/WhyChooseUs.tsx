import { Container } from '@/components/ui/Container';
import Image from 'next/image';

const features = [
    {
        title: 'Expert Naturalists',
        description: 'Our guides are seasoned naturalists and photographers who know the terrain and animal behavior.',
        icon: (
            <svg className="w-10 h-10 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        )
    },
    {
        title: 'Photography Focused',
        description: 'Specialized vehicle setups and guide positioning to ensure the best lighting and angles.',
        icon: (
            <svg className="w-10 h-10 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        )
    },
    {
        title: 'Small Groups',
        description: 'Intimate group sizes to provide a more personalized and less intrusive wildlife experience.',
        icon: (
            <svg className="w-10 h-10 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        )
    },
    {
        title: 'Eco-Ethical Travel',
        description: 'Strict adherence to park rules and ethical guidelines to protect the wildlife we love.',
        icon: (
            <svg className="w-10 h-10 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        )
    }
];

export function WhyChooseUs() {
    return (
        <section className="section-padding bg-forest-green text-white">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-4 block">Our Difference</span>
                        <h2 className="text-display text-white mb-8 leading-tight">Why Expedition with SafariKannadiga?</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                            {features.map((feature) => (
                                <div key={feature.title} className="group">
                                    <div className="mb-4 transform transition-transform group-hover:scale-110 duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-safari-gold transition-colors">{feature.title}</h3>
                                    <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-card overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-safari-gold/20 mix-blend-overlay z-10" />
                        <Image
                            src="/images/why-choose-us.jpg"
                            alt="Safari Vehicle in Action"
                            fill
                            className="object-cover"
                        />
                        {/* Stats overlay */}
                        <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-card z-20 flex justify-around text-center">
                            <div>
                                <p className="text-2xl font-bold text-safari-gold">500+</p>
                                <p className="text-[10px] uppercase font-bold text-white/60">Guests Served</p>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div>
                                <p className="text-2xl font-bold text-safari-gold">10+</p>
                                <p className="text-[10px] uppercase font-bold text-white/60">Years Experience</p>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div>
                                <p className="text-2xl font-bold text-safari-gold">100%</p>
                                <p className="text-[10px] uppercase font-bold text-white/60">Ethical Sighting</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
