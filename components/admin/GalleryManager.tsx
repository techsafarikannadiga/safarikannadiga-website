'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UploadQueueModal } from './UploadQueueModal';
import MediaManagerModal from './NewMediaManagerModal'; // V3 Import

// Types for Gallery
export type GalleryImage = {
    name: string;
    path: string;
    url: string;
    isCover?: boolean;
    isContinentCover?: boolean;
    isUploading?: boolean;
};


export type GalleryLocation = {
    id: string; // Added ID for DB operations
    name: string;
    slug: string;
    country: string;
    description: string;
    wildlife: string[];
    coverImage: string | null;
    images: GalleryImage[];
    isFeatured?: boolean;
    focalX?: number;
    focalY?: number;
    zoom?: number;
};

export type GalleryContinent = {
    name: string;
    slug: string;
    locations: GalleryLocation[];
};

interface GalleryManagerProps {
    structure: GalleryContinent[];
    fetchStructure: () => Promise<void>;
    setActionLoading: (msg: string | null) => void;
}

export function GalleryManager({ structure: initialStructure, fetchStructure, setActionLoading }: GalleryManagerProps) {
    const [structure, setLocalStructure] = useState<GalleryContinent[]>(initialStructure);
    const [activeContinentName, setActiveContinentName] = useState<string>(initialStructure[0]?.name || '');

    // Derived state for countries in the active continent
    const getCountriesForContinent = (continentName: string, currentStructure: GalleryContinent[]) => {
        const continent = currentStructure.find(c => c.name === continentName);
        if (!continent) return [];
        return Array.from(new Set(continent.locations.map(l => l.country).filter(Boolean))).sort();
    };

    const [activeCountry, setActiveCountry] = useState<string>(() => {
        const countries = getCountriesForContinent(initialStructure[0]?.name, initialStructure);
        return countries[0] || '';
    });

    const [activeLocationName, setActiveLocationName] = useState<string>(() => {
        const continent = initialStructure.find(c => c.name === initialStructure[0]?.name);
        const location = continent?.locations.find(l => l.country === (getCountriesForContinent(initialStructure[0]?.name, initialStructure)[0]));
        return location?.name || '';
    });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [uploadQueue, setUploadQueue] = useState<File[]>([]);
    const [showQueueModal, setShowQueueModal] = useState(false);
    const [mediaManagerImage, setMediaManagerImage] = useState<GalleryImage | null>(null);

    // Form states
    const [newLocation, setNewLocation] = useState({ name: '', country: '', description: '' });
    const [editForm, setEditForm] = useState({ country: '', description: '', wildlife: '' });

    // Sync local structure with props
    useEffect(() => {
        if (!uploading) {
            setLocalStructure(initialStructure);
        }
    }, [initialStructure, uploading]);

    // Update derived states when activeContinentName changes
    useEffect(() => {
        const countries = getCountriesForContinent(activeContinentName, structure);
        if (!countries.includes(activeCountry)) {
            const newCountry = countries[0] || '';
            setActiveCountry(newCountry);

            // Update location based on new country
            const continent = structure.find(c => c.name === activeContinentName);
            const firstLoc = continent?.locations.find(l => l.country === newCountry);
            setActiveLocationName(firstLoc?.name || '');
        }
    }, [activeContinentName, structure]);

    // Update location when activeCountry changes
    useEffect(() => {
        const continent = structure.find(c => c.name === activeContinentName);
        const firstLoc = continent?.locations.find(l => l.country === activeCountry);
        if (firstLoc && firstLoc.name !== activeLocationName) {
            setActiveLocationName(firstLoc.name);
        }
        // If no locations for this country (e.g. newly added empty country - though we plan to add with location), handle gracefully
    }, [activeCountry]);


    const normalizeUrl = (u: string) => u ? u.split('?')[0].split('#')[0] : '';

    const activeContinent = structure.find(c => c.name === activeContinentName);
    // Filter locations by activeCountry
    const activeLocation = activeContinent?.locations.find(l => l.name === activeLocationName);

    // Get visible locations (filtered by country)
    const visibleLocations = activeContinent?.locations.filter(l => l.country === activeCountry) || [];

    const handleFileUploadRequest = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);

        // Filter out zero byte files
        const validFiles = newFiles.filter(f => f.size > 0);
        if (validFiles.length < newFiles.length) {
            alert(`Skipped ${newFiles.length - validFiles.length} empty or corrupted files.`);
        }

        if (validFiles.length > 0) {
            setUploadQueue(validFiles);
            setShowQueueModal(true);
        }
        e.target.value = ''; // Reset input to allow re-selecting same files
    };

    const handleUploadConfirmed = async (filesToUpload: File[]) => {
        setShowQueueModal(false); // Close queue modal immediately
        setUploadQueue([]); // Clear queue state

        if (!activeContinentName || !activeLocationName) return;

        setUploading(true);
        const files = filesToUpload;

        // Optimistic UI: Create temporary ghost images
        const pendingUploads = files.map(file => ({
            name: file.name,
            path: `temp-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file), // Local preview
            isUploading: true
        }));

        setLocalStructure(prev => prev.map(c => {
            if (c.name !== activeContinentName) return c;
            return {
                ...c,
                locations: c.locations.map(l => {
                    if (l.name !== activeLocationName) return l;
                    return { ...l, images: [...l.images, ...pendingUploads] };
                })
            };
        }));

        const uploadFile = async (file: File, ghostPath: string, index: number) => {
            try {
                // Auto-compress large files to stay under ImageKit's 25MB limit
                let uploadableFile = file;
                if (file.size > 10 * 1024 * 1024) {
                    setUploadProgress(`Compressing large file ${index + 1}/${files.length}: ${file.name}...`);
                    uploadableFile = await compressInBrowser(file);
                }

                setUploadProgress(`Uploading ${index + 1}/${files.length}: ${file.name} (${(uploadableFile.size / 1024 / 1024).toFixed(1)}MB)`);
                // 1. Get Authentication Parameters from our backend
                const authRes = await fetch('/api/admin/gallery/auth');
                const authData = await authRes.json();

                if (!authRes.ok) throw new Error('Failed to get upload authorization');

                // 2. Prepare Direct Upload to ImageKit
                const ikFormData = new FormData();
                ikFormData.append('file', uploadableFile);
                ikFormData.append('fileName', file.name);
                ikFormData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');
                ikFormData.append('signature', authData.signature);
                ikFormData.append('expire', authData.expire);
                ikFormData.append('token', authData.token);

                // Construct the folder path (safari-gallery/Continent/Country/Location)
                // We need to sanitize similarly to backend
                const sanitize = (s: string) => s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').replace(/-+/g, '-');

                let folderPath = `safari-gallery/${sanitize(activeContinentName)}`;
                if (activeLocation && activeLocation.country) {
                    folderPath += `/${sanitize(activeLocation.country)}`;
                }
                folderPath += `/${sanitize(activeLocationName)}`;
                ikFormData.append('folder', folderPath);
                ikFormData.append('useUniqueFileName', 'false');

                // 3. Perform the actual upload to ImageKit
                const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    body: ikFormData
                });

                if (!uploadRes.ok) {
                    const errorText = await uploadRes.text();
                    throw new Error(`Cloud storage rejected the file: ${errorText}`);
                }

                const data = await uploadRes.json();

                if (data.url) {
                    // 4. Trigger server-side revalidation to clear cache
                    await fetch('/api/admin/gallery/revalidate', { method: 'POST' });

                    // Update local ghost image with real data immediately
                    setLocalStructure(prev => prev.map(c => {
                        if (c.name !== activeContinentName) return c;
                        return {
                            ...c,
                            locations: c.locations.map(l => {
                                if (l.name !== activeLocationName) return l;
                                return {
                                    ...l,
                                    images: l.images.map(img => img.path === ghostPath ? {
                                        ...img,
                                        path: data.fileId,
                                        url: data.url,
                                        isUploading: false
                                    } : img)
                                };
                            })
                        };
                    }));
                }
            } catch (err: any) {
                console.error('Upload error', err);
                alert(`Failed to upload ${file.name}: ${err.message || 'Check your internet or try a smaller file.'}`);

                // Remove the stuck ghost image on failure
                setLocalStructure(prev => prev.map(c => {
                    if (c.name !== activeContinentName) return c;
                    return {
                        ...c,
                        locations: c.locations.map(l => ({
                            ...l,
                            images: l.images.filter(img => img.path !== ghostPath)
                        }))
                    };
                }));
            } finally {
                URL.revokeObjectURL(pendingUploads.find(p => p.path === ghostPath)?.url || '');
            }
        };

        // Helper for browser-side resizing with memory efficiency
        async function compressInBrowser(file: File): Promise<File> {
            return new Promise((resolve, reject) => {
                const objectUrl = URL.createObjectURL(file);
                const img = new (window as any).Image();
                img.src = objectUrl;

                img.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Aim for a high-quality but manageable resolution
                    const MAX_SIZE = 3000;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    // Use better image smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    // Target 0.8 quality - sweet spot for web
                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Ensure the final file is actually smaller than 25MB
                            if (blob.size > 24 * 1024 * 1024) {
                                // If still too large, try again with lower quality
                                canvas.toBlob((smallerBlob) => {
                                    if (smallerBlob) {
                                        resolve(new File([smallerBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
                                    } else {
                                        reject(new Error('Secondary compression failed'));
                                    }
                                }, 'image/jpeg', 0.6);
                            } else {
                                resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
                            }
                        } else {
                            reject(new Error('Canvas blob construction failed'));
                        }
                    }, 'image/jpeg', 0.8);
                };

                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Image failed to load in browser for compression'));
                };
            });
        }

        // Upload in parallel chunks (2 images at a time)
        for (let i = 0; i < files.length; i += 2) {
            const chunk = files.slice(i, i + 2);
            await Promise.all(chunk.map((file, idx) => uploadFile(file, pendingUploads[i + idx].path, i + idx)));
        }

        await fetchStructure();

        setUploading(false);
        setUploadProgress('');
    };

    const handleSaveMediaEdit = async (file: File) => {
        if (!activeContinentName || !activeLocationName || !mediaManagerImage) return;

        // 1. Upload the new file
        // We'll use a modified version of handleUploadConfirmed for a single file
        // but we need to track it to potentially update covers
        setUploading(true);
        try {
            // ... (Reuse core upload logic, simplified for single file replacement)
            // Ideally we refactor upload logic to be reusable, but for safety we'll use the queue mechanism
            // or just call uploadFile directly if we expose it.
            // Let's reuse handleUploadConfirmed by tricking it into "editing mode" via a side effect?
            // Better: Just call handleUploadConfirmed([file]) and handle the cover update POST-upload.
            // BUT: We need to know which image was replaced to update covers.

            // Strategy: We will upload, and THEN checking the result, update the covers if needed.
            // Since handleUploadConfirmed is complex/optimized for queues, let's just trigger it
            // and relying on the user to re-set the cover is annoying. 
            // Let's use the Smart logic:

            setMediaManagerImage(null); // Close modal first
            await handleUploadConfirmed([file]);

            // Note: Optimistic UI will show the new image. 
            // Automatic cover replacement is tricky because we don't know the NEW URL yet.
            // We'll trust the user to set it for now, or add a TODO for V2 Smart Replace.
        } finally {
            setUploading(false);
        }
    };

    const handleSaveMediaCover = async (focal: { x: number; y: number }, zoom: number) => {
        if (!activeLocation || !mediaManagerImage) return;

        // Optimistic UI Update
        const targetLocationName = activeLocation.name;

        // We are updating the location settings, NOT the image itself.
        // Wait, the previous logic stored focalX/Y on the LOCATION, not the image.
        // So this applies to the CURRENT active location's cover settings.

        setLocalStructure(prev => prev.map(c => {
            if (c.name !== activeContinentName) return c;
            return {
                ...c,
                locations: c.locations.map(l => {
                    if (l.name !== targetLocationName) return l;
                    return { ...l, focalX: focal.x, focalY: focal.y, zoom: zoom };
                })
            };
        }));

        try {
            // Need a new API endpoint or modify existing one to accept focal points
            // Assuming we use the existing 'advanced-cover' endpoint or similar
            // Since we don't have one explicitly shown in the summary, we might need to mock or reuse 'locations' patch
            // Re-using the logic from the deleted handleAdvancedCover -> it seemed to just set local state.
            // Actually, we must save this to the DB.

            await fetch('/api/admin/locations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    continentSlug: activeContinent?.slug,
                    locationSlug: activeLocation.slug,
                    // We need to support these fields in the API
                    coverImage: mediaManagerImage.url, // Required for setting cover in DB
                    focalX: focal.x,
                    focalY: focal.y,
                    zoom: zoom
                }),
            });
        } catch (error) {
            console.error('Failed to save cover settings', error);
            fetchStructure();
        }
    };

    const handleDelete = async (imagePath: string) => {
        // Optimistic delete
        setLocalStructure(prev => prev.map(c => {
            if (c.name !== activeContinentName) return c;
            return {
                ...c,
                locations: c.locations.map(l => {
                    if (l.name !== activeLocationName) return l;
                    return { ...l, images: l.images.filter(img => img.path !== imagePath) };
                })
            };
        }));

        try {
            const res = await fetch('/api/admin/gallery', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePath }),
            });
            if (!res.ok) {
                alert('Failed to delete');
                fetchStructure();
            }
        } catch (error) {
            alert('Error deleting file');
            fetchStructure();
        }
    };

    const handleSetCover = async (imagePath: string, isContinent: boolean = false) => {
        // Optimistic cover set
        setLocalStructure(prev => prev.map(c => {
            if (c.name !== activeContinentName) return c;
            return {
                ...c,
                locations: c.locations.map(l => {
                    const isTargetLocation = l.name === activeLocationName;
                    return {
                        ...l,
                        // If setting location cover, update this location's coverImage
                        coverImage: (isTargetLocation && !isContinent) ? imagePath : l.coverImage,
                        // Map images to update covers
                        images: l.images.map(img => {
                            const isMatch = normalizeUrl(img.url) === normalizeUrl(imagePath);
                            return {
                                ...img,
                                // If setting location cover, mark this image as cover and others as not (within this location)
                                isCover: (!isContinent && isTargetLocation) ? isMatch : img.isCover,
                                // If setting continent cover, mark this image as continent cover and EVERY other image in EVERY location as not
                                isContinentCover: isContinent ? isMatch : img.isContinentCover
                            };
                        })
                    };
                })
            };
        }));

        try {
            const res = await fetch('/api/admin/gallery', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    continent: activeContinentName,
                    location: isContinent ? undefined : activeLocationName,
                    imagePath: imagePath
                }),
            });
            if (!res.ok) fetchStructure();
        } catch (error) {
            fetchStructure();
        }
    };

    const handleToggleFeatured = async () => {
        if (!activeLocation) return;
        const newState = !activeLocation.isFeatured;

        // Optimistic UI
        setLocalStructure(prev => prev.map(c => {
            if (c.name !== activeContinentName) return c;
            return {
                ...c,
                locations: c.locations.map(l =>
                    l.name === activeLocationName ? { ...l, isFeatured: newState } : l
                )
            };
        }));

        try {
            const res = await fetch('/api/admin/locations/featured', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationId: activeLocation.id,
                    isFeatured: newState
                }),
            });
            if (!res.ok) fetchStructure();
        } catch (error) {
            fetchStructure();
        }
    };



    const handleAddLocation = async () => {
        if (!newLocation.name || !newLocation.country) return alert('Name and country are required');

        setActionLoading('Creating location...');
        try {
            const res = await fetch('/api/admin/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    continentSlug: activeContinent?.slug,
                    name: newLocation.name,
                    country: newLocation.country,
                    description: newLocation.description
                }),
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewLocation({ name: '', country: '', description: '' });
                await fetchStructure();
                setActiveLocationName(newLocation.name);
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditLocation = async () => {
        if (!activeLocation) return;
        setActionLoading('Updating details...');
        try {
            const res = await fetch('/api/admin/locations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    continentSlug: activeContinent?.slug,
                    locationSlug: activeLocation.slug,
                    description: editForm.description,
                    country: editForm.country,
                    wildlife: editForm.wildlife.split(',').map(s => s.trim()).filter(Boolean)
                }),
            });
            if (res.ok) {
                setShowEditModal(false);
                fetchStructure();
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteLocation = async (locName: string, locSlug: string) => {
        if (!confirm(`Are you sure you want to delete "${locName}" and all its photos? This cannot be undone.`)) return;
        setActionLoading('Deleting everything...');
        try {
            const res = await fetch('/api/admin/locations', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ continentSlug: activeContinent?.slug, locationSlug: locSlug }),
            });
            if (res.ok) {
                if (activeLocationName === locName) setActiveLocationName('');
                fetchStructure();
            }
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = () => {
        if (!activeLocation) return;
        setEditForm({
            country: activeLocation.country || '',
            description: activeLocation.description || '',
            wildlife: (activeLocation.wildlife || []).join(', ')
        });
        setShowEditModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Standard non-blocking upload toast */}
            {uploading && (
                <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-5 z-[250] border-l-4 border-safari-gold flex items-center gap-4 animate-slide-up">
                    <div className="w-8 h-8 border-2 border-safari-gold border-t-transparent rounded-full animate-spin"></div>
                    <div>
                        <h4 className="font-bold text-neutral-charcoal">Processing Uploads</h4>
                        <p className="text-xs text-neutral-gray">{uploadProgress}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-neutral-charcoal">Gallery Manager</h2>
                    <p className="text-sm text-neutral-gray mt-1">Organize photos by continent and safari destination</p>
                </div>
                <div className="text-[10px] md:text-xs font-bold text-safari-gold bg-safari-gold/10 px-4 py-2 rounded-full border border-safari-gold/20 whitespace-nowrap">
                    {structure.reduce((sum, c) => sum + (c.locations?.reduce((s, l) => s + (l.images?.length || 0), 0) || 0), 0)} TOTAL PHOTOS
                </div>
            </div>

            {/* Continents Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100/50 rounded-2xl w-full md:w-fit overflow-x-auto pb-2">
                {structure.map(c => (
                    <button
                        key={c.name}
                        onClick={() => {
                            setActiveContinentName(c.name);
                            // Country and Location updates handled by useEffect
                        }}
                        className={`px-6 md:px-8 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeContinentName === c.name
                            ? 'bg-white text-safari-gold shadow-md'
                            : 'text-neutral-gray hover:text-neutral-charcoal'
                            }`}
                    >
                        {c.name}
                    </button>
                ))}
            </div>

            {/* Country Tabs (New Layer) */}
            {activeContinent && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {getCountriesForContinent(activeContinentName, structure).map(country => (
                        <button
                            key={country}
                            onClick={() => setActiveCountry(country)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${activeCountry === country
                                ? 'bg-neutral-charcoal text-white border-neutral-charcoal shadow-lg'
                                : 'bg-white text-neutral-gray border-gray-100 hover:border-neutral-gray/50'
                                }`}
                        >
                            {country}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            setNewLocation({ name: '', country: '', description: '' }); // Reset
                            // We might need a separate "New Country" mode or just use the same modal with different title?
                            // For now let's reuse add modal but maybe pre-set nothing?
                            // Or better: Use a "isAddingCountry" flag or just let user type new country in modal.
                            // Let's open the modal, clear country, and maybe focus it.
                            setShowAddModal(true);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-dashed border-gray-300 text-neutral-gray hover:text-safari-gold hover:border-safari-gold transition-all whitespace-nowrap flex items-center gap-1"
                    >
                        <span>+</span> New Country
                    </button>
                </div>
            )}

            {/* Locations Navigation */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {visibleLocations.map(loc => (
                    <div key={loc.name} className="relative group shrink-0">
                        <button
                            onClick={() => setActiveLocationName(loc.name)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${activeLocationName === loc.name
                                ? 'bg-forest-green border-forest-green text-white shadow-lg'
                                : 'bg-white border-gray-100 text-neutral-charcoal hover:border-forest-green'
                                }`}
                        >
                            {loc.name}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeLocationName === loc.name ? 'bg-white/20' : 'bg-gray-100'}`}>
                                {loc.images.length}
                            </span>
                        </button>
                        <button
                            onClick={() => handleDeleteLocation(loc.name, loc.slug)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-10 font-bold"
                            title="Delete Safari"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => {
                        setNewLocation({ name: '', country: activeCountry, description: '' }); // Pre-fill country
                        setShowAddModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 border-dashed border-safari-gold/30 text-safari-gold hover:bg-safari-gold hover:text-white transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    New Safari
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 min-h-[500px]">
                {activeLocation ? (
                    <div className="space-y-10">
                        {/* Location Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-3xl font-bold font-heading text-neutral-charcoal">{activeLocation.name}</h3>

                                    {/* Star Pin Toggle */}
                                    <button
                                        onClick={handleToggleFeatured}
                                        className={`p-2 rounded-full transition-all shadow-sm hover:shadow-md ${activeLocation.isFeatured
                                            ? 'bg-safari-gold text-white'
                                            : 'bg-white text-neutral-gray hover:text-safari-gold'
                                            }`}
                                        title={activeLocation.isFeatured ? "Unpin from Homepage" : "Pin to Homepage"}
                                    >
                                        <svg className="w-5 h-5" fill={activeLocation.isFeatured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={openEditModal}
                                        className="p-2 bg-white rounded-full text-neutral-gray hover:text-safari-gold shadow-sm hover:shadow-md transition-all"
                                        title="Edit Details"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center text-sm text-neutral-gray">
                                    <span className="bg-white px-3 py-1 rounded-full border border-gray-100 font-semibold">{activeLocation.country}</span>
                                    {activeLocation.wildlife?.map(w => (
                                        <span key={w} className="bg-forest-green/5 text-forest-green px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">{w}</span>
                                    ))}
                                </div>
                            </div>

                            <label className={`cursor-pointer bg-safari-gold hover:bg-safari-gold-dark text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center gap-3 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload Images
                                <input type="file" multiple accept="image/*" onChange={handleFileUploadRequest} className="hidden" />
                            </label>
                        </div>

                        <UploadQueueModal
                            files={uploadQueue}
                            isOpen={showQueueModal}
                            onClose={() => {
                                setShowQueueModal(false);
                                setUploadQueue([]);
                            }}
                            onUpload={handleUploadConfirmed}
                            onFilesChange={setUploadQueue}
                        />

                        {/* Image Grid */}
                        {activeLocation.images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-neutral-gray/40">
                                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xl font-heading font-bold">No photos yet</p>
                                <p className="text-sm">Click the upload button to add your first batch of photos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {activeLocation.images.map((img, idx) => (
                                    <div key={img.path} className={`group relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 border-4 ${img.isCover ? 'border-safari-gold' : 'border-white'}`}>
                                        <Image
                                            src={img.url}
                                            alt=""
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                            priority={idx < 4}
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4 gap-2">
                                            {!img.isCover && !img.isUploading && (
                                                <button
                                                    onClick={() => handleSetCover(img.path, false)}
                                                    className="w-full bg-white text-neutral-charcoal text-[10px] font-bold py-1.5 rounded-lg hover:bg-safari-gold hover:text-white transition-colors"
                                                >
                                                    Set Location Cover
                                                </button>
                                            )}
                                            {!img.isContinentCover && !img.isUploading && (
                                                <button
                                                    onClick={() => handleSetCover(img.path, true)}
                                                    className="w-full bg-safari-gold text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-white hover:text-safari-gold transition-colors"
                                                >
                                                    Set Continent Cover
                                                </button>
                                            )}
                                            {!img.isUploading && (
                                                <button
                                                    onClick={() => handleDelete(img.path)}
                                                    className="w-full bg-red-500/80 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                            {!img.isUploading && (
                                                <button
                                                    onClick={() => setMediaManagerImage(img)}
                                                    className="w-full bg-white/90 backdrop-blur-sm text-neutral-charcoal text-[11px] font-bold py-2 rounded-xl hover:bg-safari-gold hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Manage Media
                                                </button>
                                            )}
                                        </div>

                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                            {img.isCover && (
                                                <div className="bg-safari-gold text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg tracking-wider uppercase">
                                                    Location Cover
                                                </div>
                                            )}
                                            {img.isContinentCover && (
                                                <div className="bg-forest-green text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg tracking-wider uppercase">
                                                    Continent Cover
                                                </div>
                                            )}
                                        </div>

                                        {img.isUploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-gray/40 py-20">
                        <svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A2 2 0 013 15.382V6.618a2 2 0 011.106-1.789L9 2l5.447 2.724A2 2 0 0115.553 6.618v8.764a2 2 0 01-1.106 1.789L9 20z" />
                        </svg>
                        <p className="text-2xl font-heading font-bold">Select a Destination</p>
                        <p>Choose a safari park above to manage its content</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-scale-in border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-heading text-neutral-charcoal">
                                {newLocation.country ? `New Safari in ${newLocation.country}` : 'New Country & Safari'}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-neutral-gray hover:text-neutral-charcoal">×</button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Location Name</label>
                                <input
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-safari-gold outline-none"
                                    placeholder="e.g. Serengeti National Park"
                                    value={newLocation.name}
                                    onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Country</label>
                                <input
                                    className={`w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-safari-gold outline-none ${newLocation.country && activeCountry === newLocation.country ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    placeholder="e.g. Tanzania"
                                    value={newLocation.country}
                                    onChange={e => setNewLocation({ ...newLocation, country: e.target.value })}
                                    list="country-suggestions"
                                // Lock country if we are adding a safari to an ACTIVE country (and it was pre-filled correctly)
                                // Use a simpler check: if we clicked "New Safari", we pre-filled it. 
                                // If we clicked "New Country", we cleared it.
                                // But actually, letting them edit it even in "New Safari" might be okay, but logically they should be in "New Country" mode if they want a new one.
                                // Let's just allow editing but suggest current ones.
                                />
                                <datalist id="country-suggestions">
                                    {Array.from(new Set(structure.flatMap(c => c.locations.map(l => l.country)))).sort().map(country => (
                                        <option key={country} value={country} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Description</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-safari-gold outline-none h-32 resize-none"
                                    placeholder="Brief background about this park..."
                                    value={newLocation.description}
                                    onChange={e => setNewLocation({ ...newLocation, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-neutral-gray hover:bg-gray-50 rounded-2xl transition-colors">Cancel</button>
                                <button onClick={handleAddLocation} className="flex-1 py-4 bg-safari-gold text-white font-bold rounded-2xl shadow-lg hover:bg-safari-gold-dark transition-all">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-scale-in border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-heading text-neutral-charcoal">Edit Safari Details</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-neutral-gray hover:text-neutral-charcoal">×</button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Country</label>
                                <input
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-safari-gold outline-none"
                                    value={editForm.country}
                                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Wildlife (Comma Separated)</label>
                                <input
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-safari-gold outline-none"
                                    placeholder="e.g. Lions, Elephants, Leopards"
                                    value={editForm.wildlife}
                                    onChange={e => setEditForm({ ...editForm, wildlife: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Description</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-safari-gold outline-none h-32 resize-none"
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 font-bold text-neutral-gray hover:bg-gray-50 rounded-2xl transition-colors">Cancel</button>
                                <button onClick={handleEditLocation} className="flex-1 py-4 bg-forest-green text-white font-bold rounded-2xl shadow-lg hover:bg-forest-green-dark transition-all">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Unified Media Manager */}
            {mediaManagerImage && activeLocation && (
                <MediaManagerModal
                    image={mediaManagerImage}
                    isOpen={!!mediaManagerImage}
                    onClose={() => setMediaManagerImage(null)}
                    onSaveEdit={handleSaveMediaEdit}
                    onSaveCover={handleSaveMediaCover}
                    initialFocalPoint={activeLocation.focalX ? { x: activeLocation.focalX, y: activeLocation.focalY! } : undefined}
                    initialZoom={activeLocation.zoom}
                />
            )}
        </div>
    );
}

