'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from './canvasUtils';

interface ImageEditorModalProps {
    image: string | File | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (croppedFile: File) => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ image, isOpen, onClose, onSave }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState<number | undefined>(undefined); // Default to free aspect
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Prepare the image source URL
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    React.useEffect(() => {
        if (!image) {
            setImageSrc(null);
            return;
        }

        let url = '';
        if (typeof image === 'string') {
            url = image;
        } else {
            url = URL.createObjectURL(image);
        }
        setImageSrc(url);

        // Cleanup
        return () => {
            if (typeof image !== 'string') URL.revokeObjectURL(url);
        };
    }, [image]);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            if (!croppedAreaPixels || !imageSrc) return;

            // For existing images (strings), we need a filename. 
            // For new files, we use the file name.
            const fileName = (image instanceof File) ? image.name : 'edited-image.jpg';

            const croppedBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation
            );
            if (croppedBlob) {
                const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
                onSave(croppedFile);
                onClose();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-5xl h-[90vh] bg-[#1a1a1a] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121212]">
                    <h3 className="text-white font-bold text-lg">Edit Image</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-[#0a0a0a] overflow-hidden">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        rotation={rotation}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        mediaProps={{
                            crossOrigin: 'anonymous',
                            style: { backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)' } // Performance fix
                        }}
                        classes={{
                            containerClassName: "bg-[#0a0a0a]",
                            cropAreaClassName: "border-2 border-safari-gold shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]"
                        }}
                    />
                </div>

                {/* Controls Area */}
                <div className="px-8 py-6 bg-[#121212] border-t border-white/10 space-y-6">

                    {/* Sliders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-white/60 uppercase tracking-wider">
                                <span>Zoom</span>
                                <span>{(zoom * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-safari-gold hover:accent-safari-gold-light"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-white/60 uppercase tracking-wider">
                                <span>Rotation</span>
                                <span>{rotation}°</span>
                            </div>
                            <input
                                type="range"
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                aria-labelledby="Rotation"
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-safari-gold hover:accent-safari-gold-light"
                            />
                        </div>
                    </div>

                    {/* Aspect Ratio & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-2">
                        {/* Ratios */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                            {[
                                { label: 'Free', value: undefined },
                                { label: '1:1', value: 1 / 1 },
                                { label: '4:5', value: 4 / 5 },
                                { label: '16:9', value: 16 / 9 },
                            ].map((ratio) => (
                                <button
                                    key={ratio.label}
                                    onClick={() => setAspect(ratio.value)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${aspect === ratio.value
                                        ? 'bg-safari-gold border-safari-gold text-white shadow-lg shadow-safari-gold/20'
                                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {ratio.label}
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={onClose}
                                className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 md:flex-none px-8 py-3 bg-safari-gold text-white rounded-xl font-bold shadow-lg hover:bg-safari-gold-dark hover:scale-105 active:scale-95 transition-all"
                            >
                                Save Edits
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorModal;
