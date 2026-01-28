'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import Image from 'next/image';

type GalleryImage = {
    name: string;
    path: string;
    url: string;
    isCover?: boolean;
};

type GalleryLocation = {
    name: string;
    slug: string;
    country: string;
    description: string;
    wildlife: string[];
    coverImage: string | null;
    images: GalleryImage[];
};

type GalleryContinent = {
    name: string;
    slug: string;
    locations: GalleryLocation[];
};

export default function AdminPage() {
    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);
    
    const [structure, setStructure] = useState<GalleryContinent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeContinentName, setActiveContinentName] = useState<string>('');
    const [activeLocationName, setActiveLocationName] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    
    // Add location modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationCountry, setNewLocationCountry] = useState('');
    const [newLocationDescription, setNewLocationDescription] = useState('');
    const [addingLocation, setAddingLocation] = useState(false);

    // Edit location state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const [editWildlife, setEditWildlife] = useState('');
    const [editCountry, setEditCountry] = useState('');
    const [savingLocation, setSavingLocation] = useState(false);

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/admin/auth/check');
            const data = await res.json();
            setIsAuthenticated(data.authenticated);
            if (data.authenticated) {
                fetchStructure();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setAuthChecking(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoggingIn(true);
        
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            
            if (res.ok) {
                setIsAuthenticated(true);
                setPassword('');
                fetchStructure();
            } else {
                const data = await res.json();
                setLoginError(data.error || 'Invalid password');
            }
        } catch (error) {
            setLoginError('Login failed. Please try again.');
        } finally {
            setLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/auth', { method: 'DELETE' });
            setIsAuthenticated(false);
            setStructure([]);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchStructure();
        }
    }, [isAuthenticated]);

    const fetchStructure = async () => {
        try {
            const res = await fetch('/api/admin/gallery');
            const data = await res.json();
            setStructure(data);
            setLoading(false);

            // Set initial selection if not set
            if (data.length > 0 && !activeContinentName) {
                setActiveContinentName(data[0].name);
                if (data[0].locations.length > 0) {
                    setActiveLocationName(data[0].locations[0].name);
                }
            }
        } catch (error) {
            console.error('Failed to load gallery', error);
            setLoading(false);
        }
    };

    const activeContinent = structure.find(c => c.name === activeContinentName);
    const activeLocation = activeContinent?.locations.find(l => l.name === activeLocationName);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !activeContinentName || !activeLocationName) return;

        setUploading(true);
        const files = Array.from(e.target.files);

        // Upload sequentially
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('continent', activeContinentName);
            formData.append('location', activeLocationName);

            try {
                await fetch('/api/admin/gallery', {
                    method: 'POST',
                    body: formData,
                });
            } catch (err) {
                console.error('Upload failed for', file.name, err);
            }
        }

        setUploading(false);
        setUploadProgress('');
        fetchStructure(); // Refresh
        // Clear input
        e.target.value = '';
    };

    const handleDelete = async (imagePath: string) => {
        if (!confirm('Are you sure you want to delete this photo?')) return;

        try {
            const res = await fetch('/api/admin/gallery', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePath }),
            });

            if (res.ok) {
                fetchStructure(); // Refresh
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            alert('Error deleting file');
        }
    };

    const handleSetCover = async (imagePath: string) => {
        if (!activeContinentName || !activeLocationName) return;
        
        try {
            const res = await fetch('/api/admin/gallery', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    continent: activeContinentName,
                    location: activeLocationName,
                    imagePath: imagePath
                }),
            });

            if (res.ok) {
                fetchStructure(); // Refresh to show updated cover
            } else {
                alert('Failed to set cover photo');
            }
        } catch (error) {
            alert('Error setting cover photo');
        }
    };

    const handleAddLocation = async () => {
        if (!newLocationName.trim() || !newLocationCountry.trim()) {
            alert('Please enter location name and country');
            return;
        }
        
        const activeContinent = structure.find(c => c.name === activeContinentName);
        if (!activeContinent) return;
        
        setAddingLocation(true);
        
        try {
            const res = await fetch('/api/admin/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    continentSlug: activeContinent.slug,
                    name: newLocationName.trim(),
                    country: newLocationCountry.trim(),
                    description: newLocationDescription.trim() || undefined
                }),
            });

            const data = await res.json();
            
            if (res.ok) {
                setShowAddModal(false);
                setNewLocationName('');
                setNewLocationCountry('');
                setNewLocationDescription('');
                fetchStructure();
                // Select the new location
                setActiveLocationName(newLocationName.trim());
            } else {
                alert(data.error || 'Failed to add location');
            }
        } catch (error) {
            alert('Error adding location');
        } finally {
            setAddingLocation(false);
        }
    };

    const openEditModal = () => {
        const activeContinent = structure.find(c => c.name === activeContinentName);
        const location = activeContinent?.locations.find(l => l.name === activeLocationName);
        if (location) {
            setEditDescription(location.description || '');
            setEditWildlife((location.wildlife || []).join(', '));
            setEditCountry(location.country || '');
            setShowEditModal(true);
        }
    };

    const handleSaveLocation = async () => {
        const activeContinent = structure.find(c => c.name === activeContinentName);
        const location = activeContinent?.locations.find(l => l.name === activeLocationName);
        if (!activeContinent || !location) return;

        setSavingLocation(true);
        
        try {
            const res = await fetch('/api/admin/locations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    continentSlug: activeContinent.slug,
                    locationSlug: location.slug,
                    description: editDescription.trim(),
                    wildlife: editWildlife.split(',').map(w => w.trim()).filter(w => w),
                    country: editCountry.trim()
                }),
            });

            if (res.ok) {
                setShowEditModal(false);
                fetchStructure();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update location');
            }
        } catch (error) {
            alert('Error updating location');
        } finally {
            setSavingLocation(false);
        }
    };

    const handleDeleteLocation = async (locationName: string, locationSlug: string) => {
        const activeContinent = structure.find(c => c.name === activeContinentName);
        if (!activeContinent) return;
        
        const location = activeContinent.locations.find(l => l.name === locationName);
        const imageCount = location?.images.length || 0;
        
        const confirmMsg = imageCount > 0 
            ? `Are you sure you want to delete "${locationName}" and all ${imageCount} photos? This cannot be undone.`
            : `Are you sure you want to delete "${locationName}"? This cannot be undone.`;
            
        if (!confirm(confirmMsg)) return;
        
        try {
            const res = await fetch('/api/admin/locations', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    continentSlug: activeContinent.slug,
                    locationSlug: locationSlug
                }),
            });

            if (res.ok) {
                // If we deleted the active location, clear it
                if (activeLocationName === locationName) {
                    setActiveLocationName('');
                }
                fetchStructure();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete location');
            }
        } catch (error) {
            alert('Error deleting location');
        }
    };

    // Auth checking state
    if (authChecking) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-neutral-cream">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-safari-gold mx-auto mb-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-neutral-gray">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Login form
    if (!isAuthenticated) {
        return (
            <section className="min-h-screen pt-32 pb-20 bg-neutral-cream flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-safari-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold font-heading">Admin Login</h1>
                        <p className="text-neutral-gray text-sm mt-2">Enter password to access the gallery admin</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                autoFocus
                            />
                        </div>
                        
                        {loginError && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {loginError}
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={loggingIn || !password}
                            className="w-full bg-safari-gold text-white py-3 rounded-lg font-bold hover:bg-safari-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loggingIn ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Login
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-neutral-cream">
                <p className="text-safari-gold font-bold">Loading Gallery Data...</p>
            </div>
        );
    }

    return (
        <section className="min-h-screen pt-32 pb-20 bg-neutral-cream">
            <Container>
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-display">Gallery Admin</h1>
                        <p className="text-neutral-gray text-sm mt-2">
                            Manage photos for Africa and Asia safari destinations.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-neutral-gray">
                            {structure.reduce((sum, c) => sum + c.locations.reduce((s, l) => s + l.images.length, 0), 0)} total photos
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Continent Tabs */}
                <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200 pb-4">
                    {structure.map(continent => (
                        <button
                            key={continent.name}
                            onClick={() => {
                                setActiveContinentName(continent.name);
                                // Reset location to first in new continent
                                if (continent.locations.length > 0) setActiveLocationName(continent.locations[0].name);
                                else setActiveLocationName('');
                            }}
                            className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeContinentName === continent.name
                                    ? 'bg-safari-gold text-white shadow-lg'
                                    : 'bg-white text-neutral-gray hover:bg-gray-100'
                                }`}
                        >
                            {continent.name === 'Africa' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            {continent.name}
                            <span className="text-xs opacity-75">({continent.locations.length})</span>
                        </button>
                    ))}
                </div>

                {/* Location/Park Tabs */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    {activeContinent && activeContinent.locations.map(loc => (
                        <div key={loc.name} className="relative group/loc">
                            <button
                                onClick={() => setActiveLocationName(loc.name)}
                                className={`px-4 py-2 rounded text-sm font-semibold transition-all flex items-center gap-2 ${activeLocationName === loc.name
                                        ? 'bg-forest-green text-white'
                                        : 'bg-white border border-gray-200 text-neutral-charcoal hover:border-forest-green'
                                    }`}
                            >
                                {loc.name}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeLocationName === loc.name ? 'bg-white/20' : 'bg-gray-100'}`}>
                                    {loc.images.length}
                                </span>
                            </button>
                            {/* Delete location button - appears on hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLocation(loc.name, loc.slug);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/loc:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                                title={`Delete ${loc.name}`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    
                    {/* Add Location Button */}
                    {activeContinentName && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 rounded text-sm font-semibold border-2 border-dashed border-safari-gold text-safari-gold hover:bg-safari-gold hover:text-white transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Safari
                        </button>
                    )}
                </div>
                
                {activeContinent && activeContinent.locations.length === 0 && (
                    <p className="mb-8 text-neutral-gray italic">No safari destinations found. Click "Add Safari" to create one.</p>
                )}

                {/* Main Content Area */}
                <div className="bg-white rounded-card shadow-card p-6 min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold font-heading">
                                {activeLocationName ? `${activeLocationName} Photos` : 'Select a Safari Destination'}
                            </h2>
                            {activeLocation && (
                                <p className="text-sm text-neutral-gray mt-1">
                                    {activeLocation.country} • {activeLocation.description?.slice(0, 60)}{activeLocation.description && activeLocation.description.length > 60 ? '...' : ''}
                                </p>
                            )}
                            {uploading && uploadProgress && (
                                <p className="text-sm text-safari-gold mt-1">{uploadProgress}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {activeContinentName && activeLocationName && (
                                <button
                                    onClick={openEditModal}
                                    className="bg-gray-100 hover:bg-gray-200 text-neutral-charcoal font-bold py-2 px-4 rounded-full transition-all shadow-sm flex items-center gap-2"
                                    title="Edit location details"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Info
                                </button>
                            )}

                            {activeContinentName && activeLocationName && (
                                <label className={`cursor-pointer bg-safari-gold hover:bg-safari-gold-dark text-white font-bold py-2 px-6 rounded-full transition-all shadow-md flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Photos
                                    </>
                                )}
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                            )}
                        </div>
                    </div>

                    {!activeLocationName ? (
                        <div className="text-center py-20 text-neutral-gray">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Select a safari destination to manage photos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {activeLocation?.images.map((img) => (
                                <div key={img.path} className={`group relative aspect-square rounded overflow-hidden bg-gray-100 border-2 ${img.isCover ? 'border-safari-gold ring-2 ring-safari-gold' : 'border-gray-200'}`}>
                                    <Image
                                        src={img.url}
                                        alt={img.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Cover Badge */}
                                    {img.isCover && (
                                        <div className="absolute top-2 left-2 bg-safari-gold text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            COVER
                                        </div>
                                    )}
                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {!img.isCover && (
                                            <button
                                                onClick={() => handleSetCover(img.url)}
                                                className="bg-safari-gold text-white p-2 rounded-full hover:bg-safari-gold-dark shadow-lg transform hover:scale-110 transition-transform"
                                                title="Set as Cover Photo"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(img.path)}
                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition-transform"
                                            title="Delete Photo"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    {/* Name Tag */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate text-center">
                                        {img.name}
                                    </div>
                                </div>
                            ))}
                            {activeLocation?.images.length === 0 && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-300 rounded-xl text-neutral-gray">
                                    No photos yet. Click "Add Photos" to upload.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Container>
            
            {/* Add Location Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-heading">Add New Safari Location</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewLocationName('');
                                    setNewLocationCountry('');
                                    setNewLocationDescription('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-600">
                                    Adding to: <span className="font-bold text-safari-gold">{activeContinentName}</span>
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Safari / Park Name *
                                </label>
                                <input
                                    type="text"
                                    value={newLocationName}
                                    onChange={(e) => setNewLocationName(e.target.value)}
                                    placeholder="e.g., Serengeti, Ranthambore"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Country / State *
                                </label>
                                <input
                                    type="text"
                                    value={newLocationCountry}
                                    onChange={(e) => setNewLocationCountry(e.target.value)}
                                    placeholder="e.g., Tanzania, Rajasthan, India"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={newLocationDescription}
                                    onChange={(e) => setNewLocationDescription(e.target.value)}
                                    placeholder="Brief description of the safari location..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewLocationName('');
                                    setNewLocationCountry('');
                                    setNewLocationDescription('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddLocation}
                                disabled={addingLocation || !newLocationName.trim() || !newLocationCountry.trim()}
                                className="flex-1 px-4 py-2 bg-safari-gold text-white rounded-lg hover:bg-safari-gold-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {addingLocation ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Safari
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Location Modal */}
            {showEditModal && activeLocation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-card p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold font-heading mb-4">Edit {activeLocationName}</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-charcoal mb-1">Country</label>
                                <input
                                    type="text"
                                    value={editCountry}
                                    onChange={(e) => setEditCountry(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                    placeholder="e.g., Kenya"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-neutral-charcoal mb-1">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent resize-none"
                                    placeholder="Describe this safari destination..."
                                />
                                <p className="text-xs text-gray-500 mt-1">This text appears on the gallery cards and location page.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-neutral-charcoal mb-1">Wildlife Tags</label>
                                <input
                                    type="text"
                                    value={editWildlife}
                                    onChange={(e) => setEditWildlife(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                    placeholder="Lion, Elephant, Giraffe"
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate with commas. Shown as tags on gallery cards.</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveLocation}
                                disabled={savingLocation}
                                className="flex-1 px-4 py-2 bg-safari-gold text-white rounded-lg hover:bg-safari-gold-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {savingLocation ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
