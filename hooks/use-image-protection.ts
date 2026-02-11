'use client';

import { useEffect } from 'react';

/**
 * Hook to globally protect images from right-click context menu
 */
export function useImageProtection() {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if the target is an image or inside an image container
            if (target.tagName === 'IMG' || target.closest('.protected-image')) {
                e.preventDefault();
            }
        };

        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                e.preventDefault();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent common shortcuts for saving (Ctrl+S, Command+S) if user is focusing an image
            // This is aggressive so we limit it to specific contexts if needed, 
            // but for now we'll just block context menu key
            if (e.key === 'ContextMenu') {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
}
