'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Testimonial {
    id: string;
    name: string;
    email: string;
    safari: string;
    visit_date: string | null;
    rating: number;
    story: string;
    highlights: string | null;
    photos: string[];
    approved: boolean;
    created_at: string;
    source?: 'website' | 'google' | 'facebook';
    avatar_url?: string;
}

export function TestimonialsAdmin() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch('/api/admin/testimonials');
            const data = await res.json();
            setTestimonials(data);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovalToggle = async (testimonialId: string, currentlyApproved: boolean) => {
        try {
            const res = await fetch('/api/admin/testimonials', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: testimonialId, approved: !currentlyApproved }),
            });

            if (res.ok) {
                fetchTestimonials();
            } else {
                alert('Failed to update approval status');
            }
        } catch (error) {
            alert('Error updating testimonial');
        }
    };

    const handleDelete = async (testimonialId: string) => {
        if (!confirm('Are you sure you want to delete this testimonial? This cannot be undone.')) return;

        try {
            const res = await fetch('/api/admin/testimonials', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: testimonialId }),
            });

            if (res.ok) {
                setSelectedTestimonial(null);
                fetchTestimonials();
            } else {
                alert('Failed to delete testimonial');
            }
        } catch (error) {
            alert('Error deleting testimonial');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-safari-gold fill-safari-gold' : 'text-gray-300'}`}
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-safari-gold mx-auto" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-2 text-neutral-gray">Loading testimonials...</p>
            </div>
        );
    }

    const pendingCount = testimonials.filter(t => !t.approved).length;
    const approvedCount = testimonials.filter(t => t.approved).length;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-heading">Testimonials</h2>
                    <p className="text-sm text-neutral-gray">
                        Manage user-submitted testimonials •
                        <span className="text-green-600 font-semibold ml-1">{approvedCount} approved</span> •
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (confirm('Start sync with Google & Facebook? This might take a few seconds.')) {
                                try {
                                    const res = await fetch('/api/admin/sync', { method: 'POST' });
                                    const data = await res.json();
                                    if (data.success) {
                                        alert(`Sync Complete!\nGoogle: ${data.results.google.added} added\nFacebook: ${data.results.facebook.added} added`);
                                        fetchTestimonials();
                                    } else {
                                        alert('Sync failed - Check API Keys');
                                    }
                                } catch (e) {
                                    alert('Error syncing');
                                }
                            }
                        }}
                        className="bg-white border border-gray-300 text-neutral-charcoal px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sync API
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="bg-safari-gold text-white px-4 py-2 rounded-lg font-bold hover:bg-safari-gold-dark transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Import / Add
                    </button>
                </div>
            </div>

            {/* Testimonials List */}
            {testimonials.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="text-neutral-gray">No testimonials yet. They will appear here when users submit them.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className={`bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${!testimonial.approved ? 'border-l-4 border-yellow-400' : ''
                                }`}
                            onClick={() => setSelectedTestimonial(testimonial)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-safari-gold/20 flex items-center justify-center shrink-0 font-bold text-safari-gold">
                                    {testimonial.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold">{testimonial.name}</h3>
                                            <p className="text-sm text-neutral-gray">{testimonial.safari}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!testimonial.approved && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                                    PENDING
                                                </span>
                                            )}
                                            <div className="flex">{renderStars(testimonial.rating)}</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-gray mt-1 line-clamp-2">{testimonial.story}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-gray">
                                        <span>{formatDate(testimonial.created_at)}</span>
                                        {testimonial.photos.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {testimonial.photos.length} photo{testimonial.photos.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleApprovalToggle(testimonial.id, testimonial.approved)}
                                        className={`p-2 rounded-lg transition-colors ${testimonial.approved
                                            ? 'text-gray-400 hover:bg-gray-100'
                                            : 'text-green-600 hover:bg-green-50'
                                            }`}
                                        title={testimonial.approved ? 'Unapprove' : 'Approve'}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(testimonial.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedTestimonial && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-safari-gold/20 flex items-center justify-center font-bold text-2xl text-safari-gold overflow-hidden relative">
                                    {selectedTestimonial.avatar_url ? (
                                        <Image src={selectedTestimonial.avatar_url} alt={selectedTestimonial.name} fill className="object-cover" />
                                    ) : (
                                        selectedTestimonial.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedTestimonial.name}</h3>
                                    <p className="text-neutral-gray">{selectedTestimonial.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">{renderStars(selectedTestimonial.rating)}</div>
                                        {selectedTestimonial.source && selectedTestimonial.source !== 'website' && (
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full capitalize ${selectedTestimonial.source === 'google' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-[#1877F2]'}`}>
                                                {selectedTestimonial.source} Review
                                            </span>
                                        )}
                                        {!selectedTestimonial.approved && (
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                                PENDING APPROVAL
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTestimonial(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-neutral-gray">Safari:</span>
                                    <span className="ml-2 font-semibold">{selectedTestimonial.safari}</span>
                                </div>
                                {selectedTestimonial.visit_date && (
                                    <div>
                                        <span className="text-neutral-gray">Visit Date:</span>
                                        <span className="ml-2 font-semibold">{selectedTestimonial.visit_date}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-neutral-gray">Submitted:</span>
                                    <span className="ml-2 font-semibold">{formatDate(selectedTestimonial.created_at)}</span>
                                </div>
                                {selectedTestimonial.highlights && (
                                    <div>
                                        <span className="text-neutral-gray">Highlights:</span>
                                        <span className="ml-2 font-semibold">{selectedTestimonial.highlights}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Story</h4>
                                <p className="text-neutral-gray bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                                    {selectedTestimonial.story}
                                </p>
                            </div>

                            {selectedTestimonial.photos.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Photos ({selectedTestimonial.photos.length})</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedTestimonial.photos.map((photo, index) => (
                                            <a
                                                key={index}
                                                href={photo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="aspect-square relative rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                                            >
                                                <Image src={photo} alt={`Photo ${index + 1}`} fill className="object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => {
                                    handleApprovalToggle(selectedTestimonial.id, selectedTestimonial.approved);
                                    setSelectedTestimonial(null);
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${selectedTestimonial.approved
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {selectedTestimonial.approved ? 'Unapprove' : 'Approve & Publish'}
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete(selectedTestimonial.id);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => {
                    setShowImportModal(false);
                    fetchTestimonials();
                }}
            />
        </div>
    );
}

function ImportModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    if (!isOpen) return null;

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            name: formData.get('name'),
            source: formData.get('source'), // google, facebook
            rating: Number(formData.get('rating')),
            story: formData.get('story'),
            safari: formData.get('safari') || 'General Experience',
            visit_date: formData.get('visit_date') || new Date().toISOString().split('T')[0],
            email: 'imported@external.com', // Placeholder
            avatar_url: formData.get('avatar_url'),
            approved: true
        };

        try {
            const res = await fetch('/api/admin/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                onSuccess();
            } else {
                alert('Failed to import');
            }
        } catch (err) {
            console.error(err);
            alert('Error importing');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                <h3 className="text-xl font-bold mb-4">Import Testimonial</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Name</label>
                            <input name="name" required className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Source</label>
                            <select name="source" className="w-full border rounded p-2">
                                <option value="google">Google Review</option>
                                <option value="facebook">Facebook Review</option>
                                <option value="website">Direct / Manual</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Avatar URL (Optional)</label>
                        <input name="avatar_url" placeholder="https://..." className="w-full border rounded p-2 text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Rating</label>
                            <select name="rating" className="w-full border rounded p-2">
                                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                <option value="4">⭐⭐⭐⭐ (4)</option>
                                <option value="3">⭐⭐⭐ (3)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Date</label>
                            <input name="visit_date" type="date" className="w-full border rounded p-2" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Review Content</label>
                        <textarea name="story" required rows={4} className="w-full border rounded p-2"></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-safari-gold text-white rounded font-bold hover:bg-safari-gold-dark">
                            {submitting ? 'Importing...' : 'Import Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
