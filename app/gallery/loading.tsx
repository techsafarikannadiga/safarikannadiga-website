import { Container } from '@/components/ui/Container';

export default function Loading() {
    return (
        <section className="pt-32 pb-20 bg-neutral-cream min-h-screen">
            <Container>
                {/* Header Skeleton */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
                    <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-6 animate-pulse"></div>
                    <div className="h-4 w-full max-w-lg bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>

                {/* Continent Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[1, 2].map((i) => (
                        <div key={i} className="aspect-[16/10] rounded-2xl bg-gray-200 animate-pulse relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="h-4 w-40 bg-gray-300 rounded mb-4"></div>
                                <div className="h-10 w-48 bg-gray-300 rounded mb-4"></div>
                                <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats Skeleton */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-card shadow-card text-center h-24 flex flex-col items-center justify-center">
                            <div className="h-8 w-12 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
