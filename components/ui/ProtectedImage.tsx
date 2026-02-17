'use client';

import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProtectedImageProps extends ImageProps {
    containerClassName?: string;
}

export function ProtectedImage({ className, containerClassName, alt, ...props }: ProtectedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            className={cn("relative overflow-hidden select-none", containerClassName)}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="absolute inset-0 z-10 bg-transparent" />

            <Image
                className={cn(
                    "pointer-events-none select-none transition-opacity duration-300 opacity-100", // Force visible
                    // isLoaded ? "opacity-100" : "opacity-0",
                    className
                )}
                alt={alt}
                draggable={false}
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    console.error('Image failed to load:', props.src);
                    setIsLoaded(true); // Force show (broken image icon) so it's not invisible
                }}
                {...props}
            />
        </div>
    );
}
