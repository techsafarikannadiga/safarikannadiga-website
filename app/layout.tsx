import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { BackToTop } from '@/components/ui/BackToTop';
import { Preloader } from '@/components/ui/Preloader';
import { getGeneralSettings } from '@/lib/content';
import { ImageProtectionProvider } from '@/components/providers/ImageProtectionProvider';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Safari Kannadiga | Premium Africa Safari & Kenya Wildlife Photo Tours',
        template: '%s | Safari Kannadiga',
    },
    description: 'Book the best expert-led Africa safari tours, Kenya wildlife photography expeditions, and Indian tiger safaris. Experience unforgettable wildlife adventures with Safari Kannadiga.',
    keywords: [
        'africa safari', 'kenya safari', 'best africa safari tours', 'wildlife photography', 
        'kenya safari booking', 'india wildlife tour', 'masai mara safari', 
        'tanzania safari', 'tiger safari india', 'safari kannadiga',
        'photography expedition', 'african wildlife tours'
    ],
    authors: [{ name: 'SafariKannadiga' }],
    creator: 'SafariKannadiga',
    metadataBase: new URL('https://safarikannadiga.com'),
    openGraph: {
        type: 'website',
        locale: 'en_IE',
        url: 'https://safarikannadiga.com',
        siteName: 'SafariKannadiga',
        title: 'SafariKannadiga | Premium Wildlife Safaris & Photo Tours',
        description: 'Expert-led wildlife photography safaris in Africa and Asia.',
        images: [
            {
                url: '/images/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'SafariKannadiga Wildlife Expedition',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SafariKannadiga | Premium Wildlife Safaris & Photo Tours',
        description: 'Expert-led wildlife photography safaris in Africa and Asia.',
        images: ['/images/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getGeneralSettings();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        'name': 'Safari Kannadiga',
        'description': 'Premium expert-led Africa Safari and Kenya Wildlife Photo Tours.',
        'url': 'https://safarikannadiga.com',
        'logo': 'https://safarikannadiga.com/images/logo.png',
        'sameAs': [
            'https://www.instagram.com/safarikannadiga',
            'https://www.facebook.com/safarikannadiga'
        ],
        'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '5.0',
            'reviewCount': '4',
            'bestRating': '5'
        }
    };

    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="flex min-h-screen flex-col">
                <Preloader />
                <ImageProtectionProvider />
                <Header settings={settings} />
                <main className="flex-grow animate-fade-in">{children}</main>
                <Footer settings={settings} />
                <BackToTop />
                <WhatsAppButton />
            </body>
        </html>
    );
}
