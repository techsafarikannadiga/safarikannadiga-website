'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export type GalleryImage = {
    name: string;
    path: string;
    url: string;
    isCover?: boolean;
    isContinentCover?: boolean;
    isUploading?: boolean;
};

export type GalleryLocation = {
    name: string;
    slug: string;
    country: string;
    description: string;
    wildlife: string[];
    coverImage: string | null;
    images: GalleryImage[];
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
    const [activeLocationName, setActiveLocationName] = useState<string>(initialStructure[0]?.locations[0]?.name || '');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form states
    const [newLocation, setNewLocation] = useState({ name: '', country: '', description: '' });
    const [editForm, setEditForm] = useState({ country: '', description: '', wildlife: '' });

    // Sync local structure with props
    useEffect(() => {
        if (!uploading) {
            setLocalStructure(initialStructure);
        }
    }, [initialStructure, uploading]);

    const normalizeUrl = (u: string) => u ? u.split('?')[0].split('#')[0] : '';

    const activeContinent = structure.find(c => c.name === activeContinentName);
    const activeLocation = activeContinent?.locations.find(l => l.name === activeLocationName);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !activeContinentName || !activeLocationName) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        e.target.value = '';

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
            setUploadProgress(`Uploading ${index + 1}/${files.length}: ${file.name}`);

            let fileToUpload = file;

            // CLIENT-SIDE COMPRESSION CHECK
            // If file is > 4.5MB, we must compress in browser to pass server limits
            if (file.size > 4.5 * 1024 * 1024) {
                try {
                    setUploadProgress(`Resizing large file... ${index + 1}/${files.length}`);
                    fileToUpload = await compressInBrowser(file);
                } catch (err) {
                    console.error('Browser compression failed', err);
                }
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('continent', activeContinentName);
            formData.append('location', activeLocationName);

            try {
                const res = await fetch('/api/admin/gallery', { method: 'POST', body: formData });

                if (!res.ok) {
                    const contentType = res.headers.get('content-type');
                    let errorMsg = `Upload failed (${res.status})`;

                    if (contentType?.includes('application/json')) {
                        const errData = await res.json();
                        errorMsg = errData.error || errorMsg;
                    } else {
                        const text = await res.text();
                        // If it's a giant HTML error page, don't alert the whole thing
                        errorMsg = text.length > 100 ? `Server Error (${res.status}): Please check if the file is too large or if the server is down.` : text;
                    }
                    throw new Error(errorMsg);
                }

                const data = await res.json();

                if (data.url) {
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
                                        path: data.path,
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

                // CRITICAL: Remove the stuck ghost image on failure
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

        // Helper for browser-side resizing
        async function compressInBrowser(file: File): Promise<File> {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new (window as any).Image();
                    img.src = event.target?.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Max 2000px resolution in browser to stay safe
                        const MAX_SIZE = 2000;
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
                        ctx?.drawImage(img, 0, 0, width, height);

                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
                            } else {
                                reject(new Error('Canvas blob construction failed'));
                            }
                        }, 'image/jpeg', 0.8);
                    };
                    img.onerror = () => reject(new Error('Image load failed'));
                };
                reader.onerror = () => reject(new Error('FileReader failed'));
            });
        }

        // Upload in parallel chunks (2 images at a time to avoid overwhelming server)
        for (let i = 0; i < files.length; i += 2) {
            const chunk = files.slice(i, i + 2);
            await Promise.all(chunk.map((file, idx) => uploadFile(file, pendingUploads[i + idx].path, i + idx)));
        }

        await fetchStructure();
        setUploading(false);
        setUploadProgress('');
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
                            setActiveLocationName(c.locations[0]?.name || '');
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

            {/* Locations Navigation */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {activeContinent?.locations.map(loc => (
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
                    onClick={() => setShowAddModal(true)}
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
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-3xl font-bold font-heading text-neutral-charcoal">{activeLocation.name}</h3>
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
                                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>

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
                                                    onClick={() => handleSetCover(img.url, false)}
                                                    className="w-full bg-white text-neutral-charcoal text-[10px] font-bold py-1.5 rounded-lg hover:bg-safari-gold hover:text-white transition-colors"
                                                >
                                                    Set Location Cover
                                                </button>
                                            )}
                                            {!img.isContinentCover && !img.isUploading && (
                                                <button
                                                    onClick={() => handleSetCover(img.url, true)}
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
                    </>
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
                            <h3 className="text-2xl font-bold font-heading text-neutral-charcoal">New Destination</h3>
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
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-safari-gold outline-none"
                                    placeholder="e.g. Tanzania"
                                    value={newLocation.country}
                                    onChange={e => setNewLocation({ ...newLocation, country: e.target.value })}
                                />
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
        </div>
    );
}
