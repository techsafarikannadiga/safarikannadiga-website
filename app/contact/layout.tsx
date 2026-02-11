import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with SafariKannadiga to plan your dream wildlife safari. Reach us via email, phone, or WhatsApp for custom tour inquiries.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
