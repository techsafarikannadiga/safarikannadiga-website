'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ExperienceFormData {
    name: string;
    email: string;
    safari: string;
    visitDate: string;
    rating: number;
    highlights: string;
    story: string;
    photos: FileList | null;
    consent: boolean;
}

export default function ShareExperiencePage() {
    const [submitted, setSubmitted] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ExperienceFormData>();

    const safaris = [
        'Masai Mara, Kenya',
        'Serengeti, Tanzania',
        'Amboseli, Kenya',
        'Kabini, Karnataka',
        'Bandipur, Karnataka',
        'Ranthambore, Rajasthan',
        'Bandhavgarh, Madhya Pradesh',
        'Other'
    ];

    const onSubmit = async (data: ExperienceFormData) => {
        if (!rating) {
            alert("Please provide a rating");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, rating, type: 'experience' }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            console.error(error);
            alert("Failed to submit. Please try again or email us directly.");
        } finally {
            setIsSubmitting(false);
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
                            Your safari story has been received. We love hearing about your adventures
                            and may feature your experience on our website.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                Also Leave a Google Review
                            </a>
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
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                        Which Safari? *
                                    </label>
                                    <select
                                        {...register("safari", { required: true })}
                                        className={cn(
                                            "w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all",
                                            errors.safari ? "border-red-400" : "border-transparent focus:border-safari-gold"
                                        )}
                                    >
                                        <option value="">Select a destination</option>
                                        {safaris.map(safari => (
                                            <option key={safari} value={safari}>{safari}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">
                                        When did you visit?
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

                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    {...register("consent", { required: true })}
                                    id="consent"
                                    className="mt-1 w-5 h-5 rounded border-neutral-gray text-safari-gold focus:ring-safari-gold"
                                />
                                <label htmlFor="consent" className="text-sm text-neutral-gray">
                                    I agree that SafariKannadiga may use my story and name on their website
                                    and marketing materials. *
                                </label>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Sending...' : 'Share My Experience'}
                                </button>
                                <a
                                    href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline flex-1 py-4 text-lg text-center"
                                >
                                    Or Leave Google Review
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </Container>
        </div>
    );
}
