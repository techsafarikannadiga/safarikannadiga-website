'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { normalizeImageUrl } from '@/lib/image-utils';
import { GalleryImage } from '@/lib/gallery-cloud';

interface Props {
    images: GalleryImage[];
    title: string;
}

export default function GalleryLocationClient({ images, title }: Props) {
    const [index, setIndex] = useState(-1);

    const displayPhotos = images.map(p => ({
        src: normalizeImageUrl(p.src),
        alt: p.alt
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
                            className="break-inside-avoid rounded-card overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                            onClick={() => setIndex(i)}
                        >
                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
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
