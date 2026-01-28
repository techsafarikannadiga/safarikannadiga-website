import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { BackToTop } from '@/components/ui/BackToTop';
import { getGeneralSettings } from '@/lib/content';

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
        default: 'SafariKannadiga | Premium Wildlife Safaris & Photo Tours',
        template: '%s | SafariKannadiga',
    },
    description: 'Experience unforgettable wildlife safaris and photography tours across Africa and Asia. Expert-led expeditions to Kenya, India, and beyond.',
    keywords: ['safari', 'wildlife photography', 'kenya safari', 'india wildlife tour', 'masai mara', 'tiger safari', 'photography expedition'],
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

    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="flex min-h-screen flex-col">
                <Header settings={settings} />
                <main className="flex-grow">{children}</main>
                <Footer settings={settings} />
                <BackToTop />
                <WhatsAppButton />
            </body>
        </html>
    );
}
