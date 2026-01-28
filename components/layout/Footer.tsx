'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { normalizeImageUrl } from '@/lib/image-utils';

interface FooterProps {
    settings: any;
}

const footerLinks = {
    africanParks: [
        { name: 'Masai Mara', href: '/gallery/africa/masai-mara' },
        { name: 'Serengeti', href: '/gallery/africa/serengeti' },
        { name: 'Amboseli', href: '/gallery/africa/amboseli' },
        { name: 'Ngorongoro Crater', href: '/gallery/africa/ngorongoro' },
    ],
    indianParks: [
        { name: 'Ranthambore', href: '/gallery/asia/ranthambore' },
        { name: 'Kabini', href: '/gallery/asia/kabini' },
        { name: 'Bandipur', href: '/gallery/asia/bandipur' },
        { name: 'Bandhavgarh', href: '/gallery/asia/bandhavgarh' },
    ],
    quickLinks: [
        { name: 'About Us', href: '/about' },
        { name: 'Photo Gallery', href: '/gallery' },
        { name: 'Upcoming Tours', href: '/upcoming-tours' },
        { name: 'Share Experience', href: '/share-experience' },
        { name: 'Contact', href: '/contact' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '/privacy' },
    ]
};

export function Footer({ settings }: FooterProps) {
    const brand = settings?.brand || {};
    const logos = brand.logos || {};
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-neutral-charcoal text-white pt-16 pb-8">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand Info */}
                    <div className="space-y-6 lg:col-span-1">
                        <Link href="/" className="inline-block">
                            <div className="relative h-14 w-52">
                                <Image
                                    src={normalizeImageUrl(logos.white)}
                                    alt={brand.name || "SafariKannadiga"}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                            Experience the untamed beauty of the wilderness through our expert-led photography and wildlife safaris.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://instagram.com/safarikannadiga" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all hover:bg-[#E1306C] hover:scale-110 text-white">
                                <span className="sr-only">Instagram</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </Link>
                            <Link href="https://facebook.com/safarikannadiga" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all hover:bg-[#1877F2] hover:scale-110 text-white">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </Link>
                            <Link href="https://youtube.com/@safarikannadiga" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all hover:bg-[#FF0000] hover:scale-110 text-white">
                                <span className="sr-only">YouTube</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </Link>
                        </div>
                    </div>

                    {/* African Parks */}
                    <div>
                        <h3 className="text-safari-gold font-heading font-bold text-lg mb-6">African Parks</h3>
                        <ul className="space-y-3">
                            {footerLinks.africanParks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-neutral-300 text-sm hover:text-white transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-safari-gold/40 group-hover:bg-safari-gold transition-colors" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Indian Parks */}
                    <div>
                        <h3 className="text-safari-gold font-heading font-bold text-lg mb-6">Indian Parks</h3>
                        <ul className="space-y-3">
                            {footerLinks.indianParks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-neutral-300 text-sm hover:text-white transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-safari-gold/40 group-hover:bg-safari-gold transition-colors" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-safari-gold font-heading font-bold text-lg mb-6">Explore</h3>
                        <ul className="space-y-3">
                            {footerLinks.quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-neutral-300 text-sm hover:text-white transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-safari-gold/40 group-hover:bg-safari-gold transition-colors" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-1">
                        <h3 className="text-safari-gold font-heading font-bold text-lg mb-6">Newsletter</h3>
                        <p className="text-neutral-300 text-xs mb-4">Subscribe for safari tips and exclusive tour offers.</p>
                        <form className="flex flex-col gap-2" onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const formData = new FormData(form);
                            const email = formData.get('email');

                            try {
                                const res = await fetch('/api/send', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email, type: 'newsletter' }),
                                });
                                if (res.ok) {
                                    alert("Thank you for subscribing to our newsletter!");
                                    form.reset();
                                } else {
                                    throw new Error('Failed');
                                }
                            } catch (err) {
                                // Fallback to mailto
                                const subject = "Newsletter Subscription";
                                const body = `Please subscribe me to the newsletter.\nEmail: ${email}`;
                                window.location.href = `mailto:samarthv080@Gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            }
                        }}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Your email address"
                                className="bg-white/5 border border-white/10 rounded-card px-4 py-3 text-sm focus:outline-none focus:border-safari-gold transition-colors text-white"
                                required
                            />
                            <button className="bg-safari-gold hover:bg-safari-gold-dark text-white text-sm font-bold py-3 rounded-card transition-all shadow-lg active:scale-95">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-neutral-gray text-xs order-2 md:order-1">
                        © {currentYear} SafariKannadiga. All rights reserved. Voted #1 for Photo Expeditions.
                    </div>
                    <div className="text-neutral-400 text-xs order-3 md:order-2">
                        Designed & Developed by{' '}
                        <a 
                            href="https://samarthv.me" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-safari-gold hover:text-white transition-colors font-medium"
                        >
                            Samarth V
                        </a>
                    </div>
                    <div className="flex gap-6 order-1 md:order-3">
                        {footerLinks.legal.map((link) => (
                            <Link key={link.name} href={link.href} className="text-neutral-gray text-xs hover:text-white transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </Container>
        </footer>
    );
}
