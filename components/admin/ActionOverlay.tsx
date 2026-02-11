'use client';

interface ActionOverlayProps {
    message: string | null;
}

export function ActionOverlay({ message }: ActionOverlayProps) {
    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center animate-scale-in">
                <div className="w-16 h-16 border-4 border-safari-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold font-heading mb-2">
                    Processing...
                </h3>
                <p className="text-neutral-gray whitespace-pre-wrap">
                    {message}
                </p>
            </div>
        </div>
    );
}
