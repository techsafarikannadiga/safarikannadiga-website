import { Container } from '@/components/ui/Container';

export default function Loading() {
    return (
        <div className="pt-24 pb-20">
            <div className="bg-neutral-cream py-12 mb-8">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="h-10 w-64 bg-neutral-gray/20 rounded-lg mx-auto mb-4 animate-pulse" />
                        <div className="h-5 w-96 bg-neutral-gray/10 rounded mx-auto animate-pulse" />
                    </div>
                </Container>
            </div>
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-neutral-gray/5 rounded-card overflow-hidden">
                            <div className="h-48 bg-neutral-gray/10 animate-pulse" />
                            <div className="p-6 space-y-3">
                                <div className="h-4 w-32 bg-neutral-gray/10 rounded animate-pulse" />
                                <div className="h-6 w-48 bg-neutral-gray/10 rounded animate-pulse" />
                                <div className="h-4 w-full bg-neutral-gray/10 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}
