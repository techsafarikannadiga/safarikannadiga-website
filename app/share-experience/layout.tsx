import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Share Your Safari Experience',
    description: 'Share your wildlife safari story with SafariKannadiga. Your experience can inspire others to explore the wild.',
};

export default function ShareExperienceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
