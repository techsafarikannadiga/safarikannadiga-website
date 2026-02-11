'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * AdminErrorBoundary - Prevents a single component crash from breaking the whole dashboard.
 * Provides a graceful fallback UI with error details.
 */
export class AdminErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[AdminError] Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[2rem] text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-charcoal mb-2">Something went wrong</h2>
                    <p className="text-neutral-gray text-sm mb-6 max-w-md mx-auto">
                        The component failed to load. Try refreshing the page or contact support if the issue persists.
                    </p>
                    <div className="bg-white p-4 rounded-xl text-left overflow-auto max-h-40 mb-6 border border-red-100">
                        <code className="text-[11px] text-red-500 whitespace-pre">
                            {this.state.error?.toString()}
                        </code>
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="bg-neutral-charcoal text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
