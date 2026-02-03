'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Tour {
    id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    spots_total: number;
    spots_left: number;
    image_url: string | null;
    brochure_url: string | null;
    highlights: string[];
    description: string | null;
    status: 'upcoming' | 'sold-out' | 'completed';
    featured: boolean;
    created_at: string;
}

export function ToursAdmin() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTour, setEditingTour] = useState<Tour | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        start_date: '',
        end_date: '',
        spots_total: 12,
        spots_left: 12,
        highlights: '',
        description: '',
        brochure_url: '',
        status: 'upcoming' as 'upcoming' | 'sold-out' | 'completed',
        featured: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            const res = await fetch('/api/admin/tours');
            const data = await res.json();
            setTours(data);
        } catch (error) {
            console.error('Failed to fetch tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            destination: '',
            start_date: '',
            end_date: '',
            spots_total: 12,
            spots_left: 12,
            highlights: '',
            description: '',
            brochure_url: '',
            status: 'upcoming',
            featured: true,
        });
        setImageFile(null);
        setImagePreview('');
        setEditingTour(null);
    };

    const openEditModal = (tour: Tour) => {
        setEditingTour(tour);
        setFormData({
            title: tour.title,
            destination: tour.destination,
            start_date: tour.start_date,
            end_date: tour.end_date,
            spots_total: tour.spots_total,
            spots_left: tour.spots_left,
            highlights: tour.highlights.join(', '),
            description: tour.description || '',
            brochure_url: tour.brochure_url || '',
            status: tour.status,
            featured: tour.featured,
        });
        setImagePreview(tour.image_url || '');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formDataObj = new FormData();
            formDataObj.append('title', formData.title);
            formDataObj.append('destination', formData.destination);
            formDataObj.append('start_date', formData.start_date);
            formDataObj.append('end_date', formData.end_date);
            formDataObj.append('spots_total', formData.spots_total.toString());
            formDataObj.append('spots_left', formData.spots_left.toString());
            formDataObj.append('highlights', JSON.stringify(formData.highlights.split(',').map(h => h.trim()).filter(h => h)));
            formDataObj.append('description', formData.description);
            formDataObj.append('brochure_url', formData.brochure_url);
            formDataObj.append('status', formData.status);
            formDataObj.append('featured', formData.featured.toString());

            if (imageFile) {
                formDataObj.append('image', imageFile);
            }

            if (editingTour) {
                formDataObj.append('id', editingTour.id);
            }

            const res = await fetch('/api/admin/tours', {
                method: editingTour ? 'PUT' : 'POST',
                body: formDataObj,
            });

            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchTours();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save tour');
            }
        } catch (error) {
            alert('Error saving tour');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (tourId: string, action: 'complete' | 'sold-out' | 'reopen') => {
        try {
            const res = await fetch('/api/admin/tours', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tourId, action }),
            });

            if (res.ok) {
                fetchTours();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleDelete = async (tourId: string) => {
        if (!confirm('Are you sure you want to delete this tour?')) return;

        try {
            const res = await fetch('/api/admin/tours', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tourId }),
            });

            if (res.ok) {
                fetchTours();
            } else {
                alert('Failed to delete tour');
            }
        } catch (error) {
            alert('Error deleting tour');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'bg-green-100 text-green-800';
            case 'sold-out': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-safari-gold mx-auto" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-2 text-neutral-gray">Loading tours...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-heading">Upcoming Tours</h2>
                    <p className="text-sm text-neutral-gray">Manage safari tour packages</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-safari-gold text-white px-6 py-2 rounded-full font-bold hover:bg-safari-gold-dark transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Tour
                </button>
            </div>

            {/* Tours List */}
            {tours.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-neutral-gray">No tours yet. Click "Add Tour" to create one.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tours.map((tour) => (
                        <div key={tour.id} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
                            {/* Image */}
                            <div className="w-32 h-24 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                {tour.image_url ? (
                                    <Image src={tour.image_url} alt={tour.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-lg truncate">{tour.title}</h3>
                                        <p className="text-sm text-neutral-gray">{tour.destination}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tour.status)}`}>
                                        {tour.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-neutral-gray">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDate(tour.start_date)} - {formatDate(tour.end_date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {tour.spots_left}/{tour.spots_total} spots
                                    </span>
                                    {tour.featured && (
                                        <span className="text-safari-gold font-bold">★ Featured</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                {tour.status === 'upcoming' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(tour.id, 'complete')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Mark as Completed"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(tour.id, 'sold-out')}
                                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                            title="Mark as Sold Out"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                                {tour.status !== 'upcoming' && (
                                    <button
                                        onClick={() => handleStatusChange(tour.id, 'reopen')}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Reopen Tour"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => openEditModal(tour)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit Tour"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(tour.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Tour"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-heading">
                                {editingTour ? 'Edit Tour' : 'Add New Tour'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tour Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Kenya Safari Adventure"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Destination *</label>
                                    <input
                                        type="text"
                                        value={formData.destination}
                                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        placeholder="e.g., Masai Mara, Kenya"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Total Spots</label>
                                    <input
                                        type="number"
                                        value={formData.spots_total}
                                        onChange={(e) => setFormData({ ...formData, spots_total: parseInt(e.target.value) || 12 })}
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Spots Left</label>
                                    <input
                                        type="number"
                                        value={formData.spots_left}
                                        onChange={(e) => setFormData({ ...formData, spots_left: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        max={formData.spots_total}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Highlights (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.highlights}
                                        onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                                        placeholder="e.g., Great Migration, Big Five, Luxury Camps"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detailed description of the tour..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent resize-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Brochure URL</label>
                                    <input
                                        type="url"
                                        value={formData.brochure_url}
                                        onChange={(e) => setFormData({ ...formData, brochure_url: e.target.value })}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safari-gold focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tour Image</label>
                                    <div className="flex items-center gap-4">
                                        {imagePreview && (
                                            <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                            </div>
                                        )}
                                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold text-gray-700 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {imagePreview ? 'Change Image' : 'Upload Image'}
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        className="w-4 h-4 text-safari-gold rounded focus:ring-safari-gold"
                                    />
                                    <label htmlFor="featured" className="text-sm font-semibold text-gray-700">Featured on Homepage</label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-safari-gold text-white rounded-lg hover:bg-safari-gold-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        editingTour ? 'Update Tour' : 'Create Tour'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
