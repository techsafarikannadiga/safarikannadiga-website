import { Container } from '@/components/ui/Container';

export default function GalleryLoading() {
    return (
        <section className="pt-32 pb-20 bg-neutral-cream min-h-screen">
            <Container>
                {/* Header Skeleton */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="h-4 w-32 bg-safari-gold/20 rounded-full mx-auto mb-4 animate-pulse" />
                    <div className="h-10 w-80 bg-neutral-gray/20 rounded-lg mx-auto mb-6 animate-pulse" />
                    <div className="h-5 w-96 bg-neutral-gray/10 rounded mx-auto animate-pulse" />
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[1, 2].map((i) => (
                        <div key={i} className="aspect-[16/10] rounded-2xl bg-neutral-gray/10 animate-pulse" />
                    ))}
                </div>

                {/* Stats Skeleton */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-card shadow-card">
                            <div className="h-8 w-16 bg-neutral-gray/10 rounded mx-auto mb-2 animate-pulse" />
                            <div className="h-4 w-24 bg-neutral-gray/10 rounded mx-auto animate-pulse" />
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
