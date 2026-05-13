'use client';

import { useState, useEffect } from 'react';

interface AdminUser {
    email: string;
    addedAt: string | null;
    addedBy: string;
}

interface AdminsAdminProps {
    currentEmail?: string;
}

export function AdminsAdmin({ currentEmail }: AdminsAdminProps) {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok && data.success) {
                setAdmins(data.admins);
            } else {
                console.error('Failed to load admins:', data.error);
            }
        } catch (error) {
            console.error('Error fetching admin list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim()) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: `Successfully whitelisted ${newEmail.toLowerCase()}`, type: 'success' });
                setNewEmail('');
                fetchAdmins();
            } else {
                setMessage({ text: data.error || 'Failed to add administrator', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'An unexpected network error occurred', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevokeAccess = async (email: string) => {
        const normalizedEmail = email.toLowerCase();
        if (currentEmail?.toLowerCase() === normalizedEmail) {
            alert('Safety Block: You cannot revoke your own administrative access.');
            return;
        }

        if (!confirm(`Are you absolutely sure you want to revoke administrative access for ${email}? They will be immediately blocked from accessing the admin panel.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/users?email=${encodeURIComponent(normalizedEmail)}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: `Access successfully revoked for ${normalizedEmail}`, type: 'success' });
                fetchAdmins();
            } else {
                alert(data.error || 'Failed to revoke access');
            }
        } catch (error) {
            console.error('Error revoking admin:', error);
            alert('An unexpected error occurred during revocation.');
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading && admins.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-safari-gold mx-auto" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-2 text-neutral-gray font-bold">Loading administrators...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Title & Description */}
            <div className="border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-bold font-heading text-neutral-charcoal">Admin Access Control</h2>
                <p className="text-sm text-neutral-gray mt-1">
                    Manage which Google accounts have authorization to access this administrative panel. Whitelisted emails can modify tours, galleries, and manage other administrators.
                </p>
            </div>

            {/* Feedback Message Banner */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.type === 'success' ? (
                        <svg className="w-5 h-5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )}
                    <span className="font-semibold flex-grow">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="text-neutral-gray hover:text-neutral-charcoal transition-colors font-bold text-lg leading-none">
                        &times;
                    </button>
                </div>
            )}

            {/* Grid Form & List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Whitelist New Email Form */}
                <div className="lg:col-span-1">
                    <div className="bg-neutral-cream/30 border border-gray-200/60 rounded-2xl p-6 sticky top-6">
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <svg className="w-5 h-5 text-safari-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Add Administrator
                        </h3>
                        <p className="text-xs text-neutral-gray mb-5">
                            Enter the precise Google email address of the person you'd like to invite.
                        </p>

                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <label htmlFor="email-input" className="block text-xs font-bold uppercase tracking-wider text-neutral-gray mb-2">
                                    Google Email Address
                                </label>
                                <input
                                    id="email-input"
                                    type="email"
                                    required
                                    placeholder="e.g. john.doe@gmail.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    disabled={submitting}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-safari-gold/20 focus:border-safari-gold outline-none transition-all placeholder-gray-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !newEmail.trim()}
                                className="w-full bg-safari-gold text-white py-3 rounded-xl font-bold hover:bg-safari-gold-dark transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-sm"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Adding to Whitelist...
                                    </>
                                ) : (
                                    'Authorize Account'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Whitelisted Admins Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-sm text-neutral-charcoal uppercase tracking-wider">
                                Whitelisted Administrators ({admins.length})
                            </h3>
                            <button 
                                onClick={fetchAdmins} 
                                className="text-neutral-gray hover:text-safari-gold text-xs flex items-center gap-1 transition-colors font-semibold"
                                title="Refresh List"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>

                        {admins.length === 0 ? (
                            <div className="text-center py-12 bg-white">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p className="text-neutral-gray font-medium">No custom admins found in Firestore.</p>
                                <p className="text-xs text-neutral-gray/70 mt-1">Add your first custom administrator using the form.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/40 border-b border-gray-100">
                                            <th scope="col" className="px-6 py-3 font-bold text-neutral-gray text-xs uppercase tracking-wider">Email Account</th>
                                            <th scope="col" className="px-6 py-3 font-bold text-neutral-gray text-xs uppercase tracking-wider hidden sm:table-cell">Authorized On</th>
                                            <th scope="col" className="px-6 py-3 text-right font-bold text-neutral-gray text-xs uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {admins.map((admin) => {
                                            const isSelf = currentEmail?.toLowerCase() === admin.email.toLowerCase();
                                            return (
                                                <tr key={admin.email} className={`hover:bg-gray-50/50 transition-colors ${isSelf ? 'bg-safari-gold/[0.02]' : ''}`}>
                                                    <td className="px-6 py-4 font-medium text-neutral-charcoal">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 ${
                                                                isSelf 
                                                                    ? 'bg-safari-gold text-white border-safari-gold' 
                                                                    : 'bg-neutral-cream text-neutral-gray border-transparent'
                                                            }`}>
                                                                {admin.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0 truncate">
                                                                <div className="font-bold flex items-center gap-2 truncate">
                                                                    {admin.email}
                                                                    {isSelf && (
                                                                        <span className="px-2 py-0.5 bg-safari-gold text-white text-[10px] font-black rounded-full select-none">
                                                                            YOU
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-neutral-gray/70 mt-0.5 truncate">
                                                                    Added by: <span className="font-semibold">{admin.addedBy}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-gray hidden sm:table-cell whitespace-nowrap text-xs font-medium">
                                                        {formatDate(admin.addedAt)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleRevokeAccess(admin.email)}
                                                            disabled={isSelf}
                                                            className={`p-2 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-bold ${
                                                                isSelf 
                                                                    ? 'text-gray-300 bg-transparent cursor-not-allowed opacity-50' 
                                                                    : 'text-red-500 hover:bg-red-50 bg-transparent'
                                                            }`}
                                                            title={isSelf ? "You cannot revoke your own account" : "Revoke administrative access"}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            <span className="hidden md:inline">Revoke</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
