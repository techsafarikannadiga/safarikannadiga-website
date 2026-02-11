'use client';

import { useImageProtection } from '@/hooks/use-image-protection';

export function ImageProtectionProvider() {
    useImageProtection();
    return null;
}
