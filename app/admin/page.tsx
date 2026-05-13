'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { ToursAdmin } from '@/components/admin/ToursAdmin';
import { TestimonialsAdmin } from '@/components/admin/TestimonialsAdmin';
import { GalleryManager, GalleryContinent } from '@/components/admin/GalleryManager';
import { ActionOverlay } from '@/components/admin/ActionOverlay';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { signInWithGoogle } from '@/lib/firebase-client';
import { AdminsAdmin } from '@/components/admin/AdminsAdmin';

type MainTab = 'gallery' | 'tours' | 'testimonials' | 'admins';

export default function AdminPage() {
    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [adminEmail, setAdminEmail] = useState('');
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
            if (data.authenticated) {
                setAdminEmail(data.email || '');
                fetchStructure();
            } else {
                setAdminEmail('');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setAuthChecking(false);
        }
    };

    const handleLogin = async () => {
        setLoginError('');
        setLoggingIn(true);
        try {
            const googleAuth = await signInWithGoogle();
            if (!googleAuth.success) {
                setLoginError(googleAuth.error || 'Failed to sign in with Google');
                return;
            }

            // Send token to backend for verification
            const res = await fetch('/api/admin/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: googleAuth.idToken }),
            });

            const data = await res.json();
            if (res.ok) {
                setIsAuthenticated(true);
                setAdminEmail(data.email || googleAuth.email || '');
                fetchStructure();
                localStorage.removeItem('login_attempts');
            } else {
                setIsAuthenticated(false);
                setAdminEmail('');
                const attempts = parseInt(localStorage.getItem('login_attempts') || '0') + 1;
                localStorage.setItem('login_attempts', attempts.toString());

                if (attempts >= 5) {
                    setLoginError('Too many failed attempts. Suspicious activity logged.');
                } else {
                    setLoginError(data.error || 'Access denied');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('An error occurred. Please try again.');
        } finally {
            setLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        setActionLoading('Logging out...');
        try {
            await fetch('/api/admin/auth', { method: 'DELETE' });
            setIsAuthenticated(false);
            setAdminEmail('');
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
                        <p className="text-neutral-gray text-sm mt-2">Sign in with your Google account</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleLogin}
                            disabled={loggingIn}
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 py-4 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 border border-gray-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {loggingIn ? 'Signing in...' : 'Sign in with Google'}
                        </button>

                        {loginError && (
                            <div className="bg-red-50 text-red-600 text-xs p-4 rounded-xl flex items-center gap-3 animate-shake">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {loginError}
                            </div>
                        )}

                        <p className="text-xs text-neutral-gray text-center pt-2">
                            Only authorized administrators can access this panel.
                        </p>
                    </div>
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
                            <p className="text-neutral-gray text-sm md:text-base">
                                Welcome back{adminEmail ? `, ${adminEmail}` : ', Admin'}
                            </p>
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
                <div className="flex gap-1 p-1 bg-white rounded-2xl shadow-sm mb-10 w-full md:w-fit overflow-x-auto pb-2">
                    {[
                        { id: 'gallery', label: 'Gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { id: 'tours', label: 'Tours', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { id: 'testimonials', label: 'Testimonials', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
                        { id: 'admins', label: 'Admins', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
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
                                {activeMainTab === 'admins' && <AdminsAdmin currentEmail={adminEmail} />}
                            </>
                        )}
                    </div>
                </AdminErrorBoundary>
            </Container>
        </section>
    );
}
