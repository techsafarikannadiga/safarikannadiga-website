'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from './canvasUtils';
import { GalleryImage } from './GalleryManager';

interface MediaManagerModalProps {
    image: GalleryImage;
    isOpen: boolean;
    onClose: () => void;
    onSaveEdit: (file: File) => Promise<void>;
    onSaveCover: (focal: { x: number; y: number }, zoom: number) => Promise<void>;
    initialFocalPoint?: { x: number; y: number };
    initialZoom?: number;
}

const NewMediaManagerModal: React.FC<MediaManagerModalProps> = ({
    image,
    isOpen,
    onClose,
    onSaveEdit,
    onSaveCover,
    initialFocalPoint = { x: 50, y: 50 },
    initialZoom = 1.0
}) => {
    // --- MODE STATE ---
    const [mode, setMode] = useState<'transform' | 'focal'>('transform');
    const [isSaving, setIsSaving] = useState(false);

    // --- TRANSFORM STATE ---
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [editorImageSrc, setEditorImageSrc] = useState<string | null>(null);

    // --- FOCAL POINT STATE ---
    const [coverFocalPoint, setCoverFocalPoint] = useState(initialFocalPoint);
    const [coverZoomLevel, setCoverZoomLevel] = useState(initialZoom);
    const [isDraggingFocal, setIsDraggingFocal] = useState(false);

    // Initialize Editor Source
    useEffect(() => {
        if (isOpen && image) {
            setEditorImageSrc(image.url);
        }
    }, [isOpen, image]);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (mode === 'transform') {
                if (!croppedAreaPixels || !editorImageSrc) return;
                // V3: Uses new optimized getCroppedImg with resizing
                const croppedBlob = await getCroppedImg(editorImageSrc, croppedAreaPixels, rotation);
                if (croppedBlob) {
                    // Create a meaningful name: edited-[original-name] or edited-[timestamp].jpg
                    const originalName = image.name.replace(/\.[^/.]+$/, ""); // Remove extension
                    const fileName = `edited-${originalName}-${Date.now()}.jpg`;
                    const file = new File([croppedBlob], fileName, { type: 'image/jpeg' });
                    await onSaveEdit(file);
                }
            } else {
                await onSaveCover(coverFocalPoint, coverZoomLevel);
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    // --- ICONS (SVG) ---
    const IconTransform = () => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );

    const IconFocus = () => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const IconRotate = () => (
        <svg className="w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    );

    return (
        // z-[100000] overrides WhatsApp button (z-50)
        <div className="fixed inset-0 z-[100000] bg-black flex flex-col h-screen w-screen overflow-hidden text-white animate-in fade-in duration-200">

            {/* --- HEADER --- */}
            <header className="h-14 bg-[#18181b] flex items-center justify-between px-4 border-b border-white/5 shrink-0">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 text-white/90 font-medium text-[15px] hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <h2 className="text-white font-bold text-[16px] tracking-wide">Photo Editor</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-2 -mr-2 text-[#47a5f6] font-bold text-[15px] hover:text-[#2d8ce2] transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : (mode === 'transform' ? 'Save Copy' : 'Save Cover')}
                </button>
            </header>

            {/* --- MAIN CANVAS --- */}
            <main className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {/* TRANSFORM MODE */}
                {mode === 'transform' && editorImageSrc && (
                    <div className="absolute inset-0">
                        <Cropper
                            image={editorImageSrc}
                            crop={crop}
                            rotation={rotation}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            showGrid={true}
                            mediaProps={{ crossOrigin: 'anonymous' }}
                            classes={{
                                containerClassName: "bg-black",
                                cropAreaClassName: "border border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]"
                            }}
                        />
                    </div>
                )}

                {/* FOCAL MODE PREVIEW */}
                {mode === 'focal' && (
                    <div className="relative w-full h-full flex items-center justify-center p-8 bg-[#09090b]">
                        <div
                            className="relative w-[300px] aspect-[4/5] bg-neutral-800 rounded-sm overflow-hidden shadow-2xl ring-1 ring-white/10"
                            onMouseDown={() => setIsDraggingFocal(true)}
                            onMouseUp={() => setIsDraggingFocal(false)}
                            onMouseLeave={() => setIsDraggingFocal(false)}
                            onMouseMove={(e) => {
                                if (!isDraggingFocal) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
                                const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
                                setCoverFocalPoint({ x, y });
                            }}
                            onTouchStart={() => setIsDraggingFocal(true)}
                            onTouchEnd={() => setIsDraggingFocal(false)}
                            onTouchMove={(e) => {
                                if (!isDraggingFocal) return;
                                const touch = e.touches[0];
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = Math.min(100, Math.max(0, ((touch.clientX - rect.left) / rect.width) * 100));
                                const y = Math.min(100, Math.max(0, ((touch.clientY - rect.top) / rect.height) * 100));
                                setCoverFocalPoint({ x, y });
                            }}
                        >
                            <Image
                                src={image.url}
                                alt="Preview"
                                fill
                                sizes="300px"
                                className="pointer-events-none select-none object-cover"
                                style={{
                                    objectPosition: `${coverFocalPoint.x}% ${coverFocalPoint.y}%`,
                                    transform: `scale(${coverZoomLevel})`,
                                    transition: isDraggingFocal ? 'none' : 'object-position 0.1s ease-out'
                                }}
                            />
                            {/* Target Reticle */}
                            <div
                                className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-white rounded-full shadow-lg flex items-center justify-center pointer-events-none"
                                style={{ left: `${coverFocalPoint.x}%`, top: `${coverFocalPoint.y}%` }}
                            >
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="absolute bottom-12 text-white/30 text-[11px] font-medium uppercase tracking-widest animate-pulse pointer-events-none">
                            Drag to Set Focal Point
                        </div>
                    </div>
                )}
            </main>

            {/* --- BOTTOM CONTROLS --- */}
            <footer className="bg-[#18181b] border-t border-white/5 pb-safe shrink-0 flex flex-col pt-2">

                {/* LEVEL 1: ACTIVE TOOL CONTROLS */}
                <div className="h-14 flex items-center justify-center px-4 w-full">
                    {mode === 'transform' ? (
                        <div className="flex items-center gap-6 w-full max-w-md animate-fade-in">
                            {/* Rotation */}
                            <div className="flex-1 flex items-center gap-3">
                                <IconRotate />
                                <input
                                    type="range" min={-45} max={45} step={1}
                                    value={rotation}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/30"
                                />
                                <span className="text-[10px] font-mono text-white/50 w-8 text-right">{rotation}°</span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-6 bg-white/10"></div>

                            {/* Ratios */}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setAspect(undefined)}
                                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${!aspect ? 'bg-white text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                                >
                                    Free
                                </button>
                                <button
                                    onClick={() => setAspect(4 / 5)}
                                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${aspect === 4 / 5 ? 'bg-white text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                                >
                                    4:5
                                </button>
                                <button
                                    onClick={() => setAspect(1)}
                                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${aspect === 1 ? 'bg-white text-black' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                                >
                                    1:1
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 w-full max-w-xs animate-fade-in">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest w-12 text-right">Zoom</span>
                            <input
                                type="range" min={1} max={3} step={0.1}
                                value={coverZoomLevel}
                                onChange={(e) => setCoverZoomLevel(Number(e.target.value))}
                                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/30"
                            />
                            <span className="text-[10px] font-mono text-white/80 w-8">{coverZoomLevel.toFixed(1)}x</span>
                        </div>
                    )}
                </div>

                {/* LEVEL 2: MAIN TABS */}
                <div className="h-14 flex border-t border-white/5">
                    <button
                        onClick={() => setMode('transform')}
                        className={`flex-1 flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors ${mode === 'transform' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <IconTransform />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Crop & Rotate</span>
                    </button>
                    <button
                        onClick={() => setMode('focal')}
                        className={`flex-1 flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors ${mode === 'focal' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <IconFocus />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Focal Point</span>
                    </button>
                </div>

            </footer>
        </div>
    );
};

export default NewMediaManagerModal;
