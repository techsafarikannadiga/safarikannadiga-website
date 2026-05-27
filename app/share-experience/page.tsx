'use client';

import { useState, useRef } from 'react';
import { Container } from '@/components/ui/Container';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface ExperienceFormData {
    name: string;
    email: string;
    safari: string;
    visitDate: string;
    rating: number;
    highlights: string;
    story: string;
    consent: boolean;
    website?: string; // Honeypot field
}

export default function ShareExperiencePage() {
    const [submitted, setSubmitted] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ExperienceFormData>({
        defaultValues: {
            safari: 'General Experience'
        }
    });

    const safaris = [
        'General Experience',
        'Masai Mara, Kenya',
        'Serengeti, Tanzania',
        'Amboseli, Kenya',
        'Kabini, Karnataka',
        'Bandipur, Karnataka',
        'Ranthambore, Rajasthan',
        'Bandhavgarh, Madhya Pradesh',
        'Kanha, Madhya Pradesh',
        'Jim Corbett, Uttarakhand',
        'Other'
    ];

    const MAX_CLIENT_PHOTO_BYTES = 10 * 1024 * 1024;

    const optimizePhotoForUpload = async (file: File): Promise<File> => {
        if (!file.type.startsWith('image/')) return file;

        // Optimize any image larger than 200KB to stay within serverless payload limits (4.5MB on Vercel, 6MB on Netlify)
        if (file.size <= 200 * 1024) {
            return file;
        }

        return new Promise((resolve) => {
            const objectUrl = URL.createObjectURL(file);
            const image = new window.Image();
            image.src = objectUrl;

            image.onload = () => {
                URL.revokeObjectURL(objectUrl);

                const canvas = document.createElement('canvas');
                let width = image.width;
                let height = image.height;
                const MAX_SIZE = 2400;

                if (width > height && width > MAX_SIZE) {
                    height = Math.round((height * MAX_SIZE) / width);
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width = Math.round((width * MAX_SIZE) / height);
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(file);
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(image, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob || blob.size >= file.size) {
                        resolve(file);
                        return;
                    }

                    const optimized = new File(
                        [blob],
                        file.name.replace(/\.[^.]+$/, '.jpg'),
                        { type: 'image/jpeg' }
                    );

                    resolve(optimized);
                }, 'image/jpeg', 0.82);
            };

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(file);
            };
        });
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedPhotos.length > 5) {
            alert('Maximum 5 photos allowed');
            return;
        }

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > MAX_CLIENT_PHOTO_BYTES) {
                alert(`${file.name} is too large (max 10MB per photo)`);
                return false;
            }
            return true;
        });

        setSelectedPhotos(prev => [...prev, ...validFiles]);

        // Create preview URLs
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ExperienceFormData) => {
        if (!rating) {
            alert("Please provide a rating");
            return;
        }
        setIsSubmitting(true);
        setUploadProgress('Preparing submission...');

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('safari', data.safari);
            formData.append('visit_date', data.visitDate || '');
            formData.append('rating', rating.toString());
            formData.append('story', data.story);
            formData.append('highlights', data.highlights || '');

            // Add photos
            if (selectedPhotos.length > 0) {
                const optimizedPhotos: File[] = [];

                for (let i = 0; i < selectedPhotos.length; i++) {
                    const photo = selectedPhotos[i];
                    setUploadProgress(`Optimizing photo ${i + 1}/${selectedPhotos.length}...`);
                    const optimized = await optimizePhotoForUpload(photo);
                    optimizedPhotos.push(optimized);
                }

                setUploadProgress(`Uploading ${optimizedPhotos.length} photo(s)...`);
                optimizedPhotos.forEach((photo, i) => {
                    formData.append(`photo_${i}`, photo);
                });
            }

            const res = await fetch('/api/testimonials', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const result = await res.json().catch(() => null);
                    throw new Error(result?.error || `Failed to submit (HTTP ${res.status})`);
                }

                const text = await res.text().catch(() => '');
                const fallbackMessage = text
                    ? text.slice(0, 180)
                    : `Failed to submit (HTTP ${res.status})`;

                throw new Error(fallbackMessage);
            }
        } catch (error) {
            console.error(error);

            const message = error instanceof Error
                ? error.message
                : 'Failed to submit. Please try again or email us directly.';

            alert(message);
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    if (submitted) {
        return (
            <div className="pt-32 pb-20 min-h-screen bg-neutral-cream">
                <Container>
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-20 h-20 bg-forest-green rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-display mb-4">Thank You for Sharing!</h1>
                        <p className="text-neutral-gray text-lg mb-8">
                            Your safari story has been received and is pending review. We love hearing about your adventures
                            and will feature your experience on our website once approved.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setRating(0);
                                    setSelectedPhotos([]);
                                    setPhotoPreviewUrls([]);
                                }}
                                className="btn-primary"
                            >
                                Share Another Experience
                            </button>
                            <Link href="/" className="btn-outline">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen bg-neutral-cream">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-4 block">
                            Your Story Matters
                        </span>
                        <h1 className="text-display mb-4">Share Your Safari Experience</h1>
                        <p className="text-neutral-gray text-lg max-w-2xl mx-auto">
                            Your adventure could inspire someone's dream trip. Share your story,
                            favorite moments, and wildlife encounters with our community.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 rounded-card shadow-xl">
                        <div className="space-y-8">
                            {/* Honeypot field for anti-spam */}
                            <input
                                type="text"
                                {...register("website")}
                                style={{ display: 'none' }}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        {...register("name", { required: true })}
                                        placeholder="John Doe"
                                        className={cn(
                                            "w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all",
                                            errors.name ? "border-red-400" : "border-transparent focus:border-safari-gold"
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        {...register("email", { required: true })}
                                        placeholder="john@example.com"
                                        className={cn(
                                            "w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all",
                                            errors.email ? "border-red-400" : "border-transparent focus:border-safari-gold"
                                        )}
                                    />
                                    <p className="text-xs text-neutral-gray mt-1">Your email won't be published</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                        Safari / Experience *
                                    </label>
                                    <select
                                        {...register("safari", { required: true })}
                                        className={cn(
                                            "w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all",
                                            errors.safari ? "border-red-400" : "border-transparent focus:border-safari-gold"
                                        )}
                                    >
                                        {safaris.map(safari => (
                                            <option key={safari} value={safari}>{safari}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                        When did you visit? (Optional)
                                    </label>
                                    <input
                                        type="month"
                                        {...register("visitDate")}
                                        className="w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 border-transparent focus:border-safari-gold transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-3">
                                    Rate Your Experience *
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                                setRating(star);
                                                setValue('rating', star);
                                            }}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <svg
                                                className={cn(
                                                    "w-10 h-10 transition-colors",
                                                    (hoverRating || rating) >= star
                                                        ? "fill-safari-gold text-safari-gold"
                                                        : "fill-transparent text-neutral-gray stroke-current"
                                                )}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                    Best Wildlife Sightings
                                </label>
                                <input
                                    {...register("highlights")}
                                    placeholder="e.g., Tiger, Leopard, Elephant herd, Great Migration..."
                                    className="w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 border-transparent focus:border-safari-gold transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                    Your Safari Story *
                                </label>
                                <textarea
                                    {...register("story", { required: true, minLength: 50 })}
                                    rows={6}
                                    placeholder="Tell us about your experience... What made it special? Any memorable moments?"
                                    className={cn(
                                        "w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all resize-none",
                                        errors.story ? "border-red-400" : "border-transparent focus:border-safari-gold"
                                    )}
                                />
                                <p className="text-xs text-neutral-gray mt-1">Minimum 50 characters</p>
                            </div>

                            {/* Photo Upload Section */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                    Share Your Photos (Optional)
                                </label>
                                <p className="text-sm text-neutral-gray mb-4">
                                    Upload up to 5 wildlife photos from your safari (max 10MB each).
                                    Images will be automatically optimized.
                                </p>

                                {/* Photo Previews */}
                                {photoPreviewUrls.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {photoPreviewUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <div className="w-24 h-24 rounded-lg overflow-hidden relative">
                                                    <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedPhotos.length < 5 && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-safari-gold hover:bg-safari-gold/5 transition-all"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoSelect}
                                            className="hidden"
                                        />
                                        <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-neutral-gray">
                                            Click to upload photos ({5 - selectedPhotos.length} remaining)
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    {...register("consent", { required: true })}
                                    id="consent"
                                    className="mt-1 w-5 h-5 rounded border-neutral-gray text-safari-gold focus:ring-safari-gold"
                                />
                                <label htmlFor="consent" className="text-sm text-neutral-gray">
                                    I agree that SafariKannadiga may use my story, photos, and name on their website
                                    and marketing materials. *
                                </label>
                            </div>

                            {uploadProgress && (
                                <div className="bg-safari-gold/10 border border-safari-gold rounded-lg p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-safari-gold font-semibold">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        {uploadProgress}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Submitting...' : 'Share My Experience'}
                                </button>
                                <Link
                                    href="/gallery"
                                    className="btn-outline flex-1 py-4 text-lg text-center"
                                >
                                    View Our Gallery
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </Container>
        </div>
    );
}
