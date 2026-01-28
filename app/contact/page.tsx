'use client';

import { Container } from '@/components/ui/Container';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';

// ...

function ContactFormContent() {
    const searchParams = useSearchParams();
    const tourInterest = searchParams.get('tour');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();

    useEffect(() => {
        if (tourInterest) {
            setValue('interest', 'custom');
            setValue('message', `I'm interested in the ${tourInterest} tour. Please share more details regarding availability and pricing.`);
        }
    }, [tourInterest, setValue]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, type: 'contact' }),
            });

            if (response.ok) {
                alert('Thank you! Your inquiry has been sent successfully.');
                reset();
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Opening your email client instead.');
            const subject = `Safari Inquiry: ${data.interest} - ${data.firstName} ${data.lastName}`;
            const body = `Name: ${data.firstName} ${data.lastName}%0D%0AEmail: ${data.email}%0D%0AInterest: ${data.interest}%0D%0A%0D%0AMessage:%0D%0A${data.message}`;
            window.location.href = `mailto:samarthv080@Gmail.com?subject=${encodeURIComponent(subject)}&body=${body.replace(/\n/g, '%0D%0A')}`;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Info Side */}
            <div className="space-y-12">
                <div>
                    <span className="text-safari-gold font-bold uppercase tracking-widest text-sm mb-4 block">Get In Touch</span>
                    <h1 className="text-display mb-6">Let's Plan Your Dream Safari</h1>
                    <p className="text-neutral-gray text-lg leading-relaxed">
                        Whether you have a specific itinerary in mind or just started dreaming of the wild, our experts are here to help you craft the perfect adventure.
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-full bg-safari-gold/10 flex items-center justify-center text-safari-gold shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">Email Us</h3>
                            <a href="mailto:samarthv080@Gmail.com" className="text-neutral-gray hover:text-safari-gold transition-colors">samarthv080@Gmail.com</a>
                        </div>
                    </div>

                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-full bg-safari-gold/10 flex items-center justify-center text-safari-gold shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">Call Us</h3>
                            <p className="text-neutral-gray">+254 726 088361</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-full bg-safari-gold/10 flex items-center justify-center text-safari-gold shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">Visit Us</h3>
                            <p className="text-neutral-gray">Nairobi, Kenya & Bangalore, India</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-neutral-cream rounded-card border border-neutral-gray/10">
                    <h3 className="text-xl font-bold mb-4 font-heading">Connect Instantly</h3>
                    <p className="text-sm text-neutral-gray mb-6">Need a quick answer? Our team is available on WhatsApp for immediate assistance.</p>
                    <a href="https://wa.me/254726088361" target="_blank" rel="noopener noreferrer" className="btn-secondary w-full gap-3">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        Message on WhatsApp
                    </a>
                </div>
            </div>

            {/* Form Side */}
            <div className="bg-white p-10 rounded-card shadow-2xl border border-neutral-gray/5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">First Name</label>
                            <input
                                {...register("firstName", { required: true })}
                                className={cn("w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all", errors.firstName ? "border-red-400" : "border-transparent focus:border-safari-gold")}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Last Name</label>
                            <input
                                {...register("lastName", { required: true })}
                                className={cn("w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all", errors.lastName ? "border-red-400" : "border-transparent focus:border-safari-gold")}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Email Address</label>
                        <input
                            type="email"
                            {...register("email", { required: true })}
                            className={cn("w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all", errors.email ? "border-red-400" : "border-transparent focus:border-safari-gold")}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Interest</label>
                        <select
                            {...register("interest")}
                            className="w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 border-transparent focus:border-safari-gold appearance-none"
                        >
                            <option value="photography">Photography Safari</option>
                            <option value="luxury">Luxury Wildlife Tour</option>
                            <option value="family">Family Adventure</option>
                            <option value="custom">Custom Itinerary</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Message</label>
                        <textarea
                            rows={4}
                            {...register("message", { required: true })}
                            className={cn("w-full bg-neutral-cream rounded-card px-4 py-3 outline-none border-2 transition-all resize-none", errors.message ? "border-red-400" : "border-transparent focus:border-safari-gold")}
                            placeholder="Tell us about your dream safari..."
                        />
                    </div>

                    <div className="space-y-4">
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ContactPage() {
    return (
        <div className="pt-24 md:pt-32 pb-section">
            <Container>
                <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
                    <ContactFormContent />
                </Suspense>
            </Container>
        </div>
    );
}
