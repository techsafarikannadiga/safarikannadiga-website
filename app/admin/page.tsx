'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { ToursAdmin } from '@/components/admin/ToursAdmin';
import { TestimonialsAdmin } from '@/components/admin/TestimonialsAdmin';
import { GalleryManager, GalleryContinent } from '@/components/admin/GalleryManager';
import { ActionOverlay } from '@/components/admin/ActionOverlay';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';

type MainTab = 'gallery' | 'tours' | 'testimonials';

export default function AdminPage() {
    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    // Data state
    const [structure, setStructure] = useState<GalleryContinent[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeMainTab, setActiveMainTab] = useState<MainTab>('gallery');
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/admin/auth/check');
            const data = await res.json();
            setIsAuthenticated(data.authenticated);
            if (data.authenticated) fetchStructure();
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
                localStorage.removeItem('login_attempts');
            } else {
                const data = await res.json();
                const attempts = parseInt(localStorage.getItem('login_attempts') || '0') + 1;
                localStorage.setItem('login_attempts', attempts.toString());

                if (attempts >= 5) {
                    setLoginError('Too many failed attempts. Suspicious activity logged.');
                } else {
                    setLoginError(data.error || 'Invalid password');
                }
            }
        } finally {
            setLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        setActionLoading('Logging out...');
        try {
            await fetch('/api/admin/auth', { method: 'DELETE' });
            setIsAuthenticated(false);
            setStructure([]);
        } finally {
            setActionLoading(null);
        }
    };

    const fetchStructure = async () => {
        try {
            const res = await fetch(`/api/admin/gallery?t=${Date.now()}`);
            const data = await res.json();
            setStructure(data);
            setLastUpdated(new Date().toLocaleTimeString());
        } finally {
            setLoading(false);
        }
    };

    if (authChecking) {
        return (
            <div className="min-h-screen pt-32 flex flex-col justify-center items-center bg-neutral-cream">
                <div className="w-12 h-12 border-4 border-safari-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-gray font-bold">Verifying Session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <section className="min-h-screen pt-32 pb-20 bg-neutral-cream flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-safari-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
                            <svg className="w-8 h-8 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold font-heading text-neutral-charcoal">Admin Access</h1>
                        <p className="text-neutral-gray text-sm mt-2">Enter credentials to manage SafariKannadiga</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-gray mb-2">Security Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-safari-gold outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {loginError && (
                            <div className="bg-red-50 text-red-600 text-xs p-4 rounded-xl flex items-center gap-3 animate-shake">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loggingIn || !password}
                            className="w-full bg-safari-gold hover:bg-safari-gold-dark text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loggingIn ? 'Authenticating...' : 'Access Dashboard'}
                        </button>
                    </form>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen pt-32 pb-20 bg-neutral-cream">
            <ActionOverlay message={actionLoading} />

            <Container>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold font-heading text-neutral-charcoal">Dashboard</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                            <p className="text-neutral-gray text-sm md:text-base">Welcome back, Admin</p>
                            {lastUpdated && (
                                <span className="text-[10px] text-neutral-gray/40 font-mono uppercase tracking-widest whitespace-nowrap">
                                    Last synced: {lastUpdated}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full sm:w-auto px-6 py-2.5 border border-red-200 text-red-500 rounded-full font-bold hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-1 p-1 bg-white rounded-2xl shadow-sm mb-10 w-full md:w-fit overflow-x-auto no-scrollbar">
                    {[
                        { id: 'gallery', label: 'Gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { id: 'tours', label: 'Tours', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { id: 'testimonials', label: 'Testimonials', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMainTab(tab.id as MainTab)}
                            className={`px-6 md:px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeMainTab === tab.id
                                ? 'bg-safari-gold text-white shadow-md'
                                : 'text-neutral-gray hover:bg-gray-50'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                            </svg>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Board */}
                <AdminErrorBoundary>
                    <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-10 border border-gray-50 min-h-[600px]">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-safari-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-neutral-gray font-bold">Fetching latest data...</p>
                            </div>
                        ) : (
                            <>
                                {activeMainTab === 'gallery' && (
                                    <GalleryManager
                                        structure={structure}
                                        fetchStructure={fetchStructure}
                                        setActionLoading={setActionLoading}
                                    />
                                )}
                                {activeMainTab === 'tours' && <ToursAdmin />}
                                {activeMainTab === 'testimonials' && <TestimonialsAdmin />}
                            </>
                        )}
                    </div>
                </AdminErrorBoundary>
            </Container>
        </section>
    );
}
