'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
    src?: string | null;
    name: string;
    sizeClasses?: string;
    textSizeClasses?: string;
}

export function Avatar({ src, name, sizeClasses = "w-10 h-10", textSizeClasses = "text-sm" }: AvatarProps) {
    const [imageError, setImageError] = useState(false);
    const initials = name ? name.charAt(0).toUpperCase() : '?';

    // Common styles for fallback
    const fallbackStyles = `flex items-center justify-center font-bold text-white bg-gradient-to-br from-safari-gold to-sunset-orange rounded-full shrink-0 ${sizeClasses} ${textSizeClasses}`;

    if (!src || imageError) {
        return (
            <div className={fallbackStyles} aria-label={name}>
                {initials}
            </div>
        );
    }

    return (
        <div className={`${sizeClasses} rounded-full overflow-hidden shrink-0 relative bg-gray-100`}>
            <Image
                src={src}
                alt={`${name}'s avatar`}
                fill
                className="object-cover"
                sizes="48px"
                onError={() => setImageError(true)}
                unoptimized={true} // Prevents strict format blocking if user avatar source is dynamic
            />
        </div>
    );
}
