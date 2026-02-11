import { Container } from '@/components/ui/Container';

export default function Loading() {
    return (
        <section className="pt-32 pb-20 bg-neutral-cream min-h-screen">
            <Container>
                {/* Header Skeleton */}
                <div className="mb-12">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    <div className="h-10 w-64 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    <div className="h-4 w-full max-w-lg bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="flex gap-4 mt-6">
                        <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Location Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-card overflow-hidden shadow-card">
                            <div className="aspect-[4/3] bg-gray-200 animate-pulse relative"></div>
                            <div className="p-6">
                                <div className="h-3 w-20 bg-gray-300 rounded mb-2"></div>
                                <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
                                <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 w-2/3 bg-gray-300 rounded mb-4"></div>
                                <div className="flex gap-2">
                                    <div className="h-4 w-12 bg-gray-300 rounded-full"></div>
                                    <div className="h-4 w-12 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
