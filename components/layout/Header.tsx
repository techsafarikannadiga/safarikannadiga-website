'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { normalizeImageUrl } from '@/lib/image-utils';

interface HeaderProps {
    settings: any;
}

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Upcoming Tours', href: '/upcoming-tours' },
    { name: 'Contact', href: '/contact' },
];

export function Header({ settings }: HeaderProps) {
    const brand = settings?.brand || {};
    const logos = brand.logos || {};
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isTransparentPage = pathname === '/';

    // Force "scrolled" style (solid bg, dark text) on non-transparent pages immediately
    const shouldShowSolidHeader = isScrolled || !isTransparentPage;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
                shouldShowSolidHeader
                    ? 'bg-white/95 backdrop-blur-md shadow-md py-2'
                    : 'bg-transparent py-4'
            )}
        >
            <Container>
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative z-50 flex items-center gap-2">
                        <div className="relative h-10 w-40 md:h-12 md:w-52 transform transition-transform duration-500 hover:scale-105">
                            <Image
                                src={normalizeImageUrl(shouldShowSolidHeader ? logos.color : logos.white)}
                                alt={brand.name || "SafariKannadiga"}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full hover:bg-safari-gold/10',
                                    pathname === item.href
                                        ? shouldShowSolidHeader
                                            ? 'text-safari-gold'
                                            : 'text-white bg-white/10'
                                        : shouldShowSolidHeader
                                            ? 'text-neutral-charcoal hover:text-safari-gold'
                                            : 'text-white/90 hover:text-white'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            className={cn(
                                'ml-4 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0',
                                shouldShowSolidHeader
                                    ? 'bg-safari-gold text-white hover:bg-safari-gold-dark'
                                    : 'bg-white text-safari-gold hover:bg-neutral-cream'
                            )}
                        >
                            Book Now
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="relative z-50 lg:hidden p-2 text-current focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <div className="relative h-6 w-6">
                            <span
                                className={cn(
                                    'absolute block h-0.5 w-6 transition-all duration-300',
                                    shouldShowSolidHeader || isMobileMenuOpen ? 'bg-neutral-charcoal' : 'bg-white',
                                    isMobileMenuOpen ? 'top-3 rotate-45' : 'top-1'
                                )}
                            />
                            <span
                                className={cn(
                                    'absolute block h-0.5 w-6 transition-all duration-300',
                                    shouldShowSolidHeader || isMobileMenuOpen ? 'bg-neutral-charcoal' : 'bg-white',
                                    isMobileMenuOpen ? 'opacity-0' : 'top-3'
                                )}
                            />
                            <span
                                className={cn(
                                    'absolute block h-0.5 w-6 transition-all duration-300',
                                    shouldShowSolidHeader || isMobileMenuOpen ? 'bg-neutral-charcoal' : 'bg-white',
                                    isMobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'
                                )}
                            />
                        </div>
                    </button>
                </div>
            </Container>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-0 left-0 w-full h-screen bg-white z-40 lg:hidden flex flex-col pt-24"
                    >
                        <nav className="flex flex-col items-center gap-6 px-6">
                            {navigation.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'text-2xl font-heading font-medium transition-colors',
                                            pathname === item.href ? 'text-safari-gold' : 'text-neutral-charcoal'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                                className="w-full pt-8"
                            >
                                <Link
                                    href="/contact"
                                    className="block w-full text-center py-4 bg-safari-gold text-white rounded-card text-xl font-bold shadow-lg"
                                >
                                    Plan My Safari
                                </Link>
                            </motion.div>
                        </nav>

                        <div className="mt-auto pb-12 px-6 flex flex-col items-center gap-4 text-neutral-gray text-sm">
                            <p>© 2026 SafariKannadiga</p>
                            <div className="flex gap-4">
                                <span className="w-10 h-10 rounded-full bg-neutral-cream flex items-center justify-center">IG</span>
                                <span className="w-10 h-10 rounded-full bg-neutral-cream flex items-center justify-center">FB</span>
                                <span className="w-10 h-10 rounded-full bg-neutral-cream flex items-center justify-center">YT</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
