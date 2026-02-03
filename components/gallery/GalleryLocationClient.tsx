'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { normalizeImageUrl } from '@/lib/image-utils';
import { GalleryImage } from '@/lib/gallery-cloud';

interface Props {
    images: GalleryImage[];
    title: string;
}

interface LikeState {
    count: number;
    liked: boolean;
}

export default function GalleryLocationClient({ images, title }: Props) {
    const [index, setIndex] = useState(-1);
    const [likes, setLikes] = useState<Record<string, LikeState>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Fetch likes in batch
        const fetchLikes = async () => {
            try {
                const paths = images.map(img => img.src); // Using src as unique identifier path
                const res = await fetch('/api/gallery/likes-batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paths }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setLikes(data);
                }
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        };

        if (images.length > 0) {
            fetchLikes();
        }
    }, [images]);

    const toggleLike = async (path: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Optimistic update
        const current = likes[path] || { count: 0, liked: false };
        setLikes(prev => ({
            ...prev,
            [path]: {
                count: current.liked ? current.count - 1 : current.count + 1,
                liked: !current.liked
            }
        }));

        try {
            const res = await fetch('/api/gallery/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePath: path }),
            });

            if (res.ok) {
                const data = await res.json();
                setLikes(prev => ({
                    ...prev,
                    [path]: { count: data.count, liked: data.liked }
                }));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setLikes(prev => ({
                ...prev,
                [path]: current
            }));
        }
    };

    const displayPhotos = images.map(p => ({
        src: normalizeImageUrl(p.src),
        alt: p.alt,
        original: p.src
    }));

    return (
        <>
            <h2 className="text-h2 mb-8">Photo Gallery</h2>
            {images.length === 0 ? (
                <p className="text-neutral-gray italic">No photos found in this album yet.</p>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {displayPhotos.map((photo, i) => (
                        <div
                            key={i}
                            className="break-inside-avoid rounded-card overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
                            onClick={() => setIndex(i)}
                        >
                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                width={800}
                                height={600}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Like Button Overlay */}
                            {mounted && (
                                <button
                                    onClick={(e) => toggleLike(photo.original, e)}
                                    className="absolute bottom-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all flex items-center gap-2 z-20"
                                >

                                    <svg
                                        className={`w-5 h-5 transition-colors ${likes[photo.original]?.liked ? 'fill-red-500 text-red-500' : 'fill-transparent text-white stroke-current'}`}
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                    <span className="text-sm font-bold">{likes[photo.original]?.count || 0}</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Lightbox
                index={index}
                slides={displayPhotos}
                open={index >= 0}
                close={() => setIndex(-1)}
            />
        </>
    );
}
