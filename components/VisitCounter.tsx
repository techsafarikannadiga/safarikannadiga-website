'use client';

import { useEffect, useState, useRef } from 'react';

export function VisitCounter() {
    const [count, setCount] = useState<number | null>(null);
    const hasIncremented = useRef(false);

    useEffect(() => {
        // 1. Fetch current count immediately for display
        fetch('/api/visit')
            .then(res => res.json())
            .then(data => setCount(data.count))
            .catch(err => console.error('Failed to fetch visit count:', err));

        // 2. Increment count (once per session/mount)
        // In strict mode (dev), this effect runs twice, so we use a ref to prevent double counting
        if (!hasIncremented.current) {
            hasIncremented.current = true;

            // Wait a bit to ensure it's a real visit (optional, but good practice)
            const timer = setTimeout(() => {
                fetch('/api/visit', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.count) setCount(data.count);
                    })
                    .catch(err => console.error('Failed to increment visit:', err));
            }, 2000); // 2 second delay to count as "visit"

            return () => clearTimeout(timer);
        }
    }, []);

    if (count === null) return null; // Don't show until loaded

    // Format with commas
    const formattedCount = count.toLocaleString();

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#BFA15F] mb-1">
                Website Visits
            </div>
            <div className="flex items-center gap-2 bg-[#1A1A1A] px-4 py-2 rounded-lg border border-[#333]">
                <div className="flex gap-1">
                    {formattedCount.split('').map((char, index) => (
                        <span
                            key={index}
                            className={`font-mono text-lg font-bold ${char === ',' ? 'text-gray-500' : 'text-white'}`}
                        >
                            {char}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
