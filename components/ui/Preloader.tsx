'use client';

import { useState, useEffect } from 'react';

// Pre-computed particle positions
const particles = [
    { top: 8, left: 12, delay: 0.0, duration: 3.2 },
    { top: 22, left: 85, delay: 1.1, duration: 4.1 },
    { top: 35, left: 42, delay: 0.5, duration: 2.8 },
    { top: 48, left: 68, delay: 2.3, duration: 3.6 },
    { top: 61, left: 25, delay: 1.7, duration: 4.5 },
    { top: 74, left: 91, delay: 0.3, duration: 2.4 },
    { top: 15, left: 55, delay: 2.8, duration: 3.9 },
    { top: 88, left: 38, delay: 0.9, duration: 2.6 },
    { top: 42, left: 7, delay: 1.4, duration: 4.3 },
    { top: 56, left: 78, delay: 2.1, duration: 3.1 },
    { top: 29, left: 63, delay: 0.7, duration: 4.8 },
    { top: 67, left: 18, delay: 1.9, duration: 2.9 },
    { top: 81, left: 50, delay: 0.2, duration: 3.7 },
    { top: 5, left: 33, delay: 2.5, duration: 4.0 },
    { top: 93, left: 72, delay: 1.3, duration: 2.2 },
    { top: 38, left: 95, delay: 0.6, duration: 3.4 },
    { top: 52, left: 15, delay: 2.0, duration: 4.6 },
    { top: 19, left: 47, delay: 1.6, duration: 2.7 },
    { top: 76, left: 82, delay: 0.4, duration: 3.3 },
    { top: 44, left: 28, delay: 2.7, duration: 4.2 },
];

export function Preloader() {
    const [showParticles, setShowParticles] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isGone, setIsGone] = useState(false);

    useEffect(() => {
        // Show particles only after hydration (avoids mismatch)
        setShowParticles(true);

        const fadeTimer = setTimeout(() => setIsFadingOut(true), 2200);
        const removeTimer = setTimeout(() => setIsGone(true), 2900);
        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (isGone) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a1a18] transition-opacity duration-700 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            suppressHydrationWarning
        >
            {/* Starfield — client-only to avoid hydration mismatch */}
            <div className="absolute inset-0 overflow-hidden" suppressHydrationWarning>
                {showParticles && particles.map((p, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-safari-gold/30 animate-twinkle"
                        style={{
                            top: `${p.top}%`,
                            left: `${p.left}%`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
            </div>

            {/* Horizon line */}
            <div className="absolute bottom-[35%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-safari-gold/30 to-transparent animate-horizon" />

            {/* Main content */}
            <div className="relative flex flex-col items-center gap-6 px-6">
                {/* Safari Sun / Golden Circle */}
                <div className="relative">
                    <div className="absolute inset-0 w-24 h-24 md:w-28 md:h-28 rounded-full bg-safari-gold/10 animate-pulse-ring" />
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-safari-gold to-safari-gold-dark flex items-center justify-center animate-sun-rise shadow-[0_0_60px_rgba(212,165,116,0.3)]">
                        <svg
                            className="w-10 h-10 md:w-12 md:h-12 text-white animate-icon-reveal"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                className="animate-draw-path"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                className="animate-draw-path-delay"
                            />
                        </svg>
                    </div>
                </div>

                {/* Brand Name */}
                <div className="text-center animate-text-reveal">
                    <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-wider text-white">
                        <span className="text-safari-gold">Safari</span>Kannadiga
                    </h1>
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-white/40 mt-2 font-medium">
                        Wildlife Photography Expeditions
                    </p>
                </div>

                {/* Loading track */}
                <div className="w-48 md:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-gradient-to-r from-safari-gold-dark via-safari-gold to-safari-gold-light rounded-full animate-load-bar" />
                </div>

                {/* Paw prints walking */}
                <div className="flex items-center gap-3 mt-1">
                    {[0, 1, 2, 3].map((i) => (
                        <svg
                            key={i}
                            className="w-3 h-3 md:w-4 md:h-4 text-safari-gold/60 animate-paw-step"
                            style={{ animationDelay: `${i * 0.3}s` }}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 18c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4zm-4.5-6c.83 0 1.5-.67 1.5-1.5S8.33 9 7.5 9 6 9.67 6 10.5 6.67 12 7.5 12zm9 0c.83 0 1.5-.67 1.5-1.5S17.33 9 16.5 9 15 9.67 15 10.5s.67 1.5 1.5 1.5zm-6.5-2c.83 0 1.5-.67 1.5-1.5S10.83 7 10 7s-1.5.67-1.5 1.5S9.17 10 10 10zm4 0c.83 0 1.5-.67 1.5-1.5S14.83 7 14 7s-1.5.67-1.5 1.5S13.17 10 14 10z" />
                        </svg>
                    ))}
                </div>
            </div>
        </div>
    );
}
