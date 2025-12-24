/**
 * Global error boundary and error handling utilities
 */

import { Component } from 'react';

/**
 * Error Boundary Component
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // Could send to error tracking service here
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
                    <div className="glass-panel p-8 max-w-md text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                        <p className="text-slate-400 mb-6">
                            An unexpected error occurred. Please try again.
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * API Error handler
 */
export const handleApiError = (error) => {
    const defaultMessage = 'Something went wrong. Please try again.';

    if (error.response) {
        // Server responded with error
        const { data, status } = error.response;

        if (status === 401) {
            // Handle unauthorized - redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return { message: 'Session expired. Please login again.' };
        }

        if (status === 403) {
            return { message: 'You do not have permission to perform this action.' };
        }

        if (status === 404) {
            return { message: data?.message || 'Resource not found.' };
        }

        if (status === 429) {
            return { message: 'Too many requests. Please wait a moment.' };
        }

        return { message: data?.message || defaultMessage, errors: data?.errors };
    }

    if (error.request) {
        // No response received
        return { message: 'Network error. Please check your connection.' };
    }

    return { message: error.message || defaultMessage };
};

/**
 * Toast notification helper
 */
export const showToast = (type, message) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed bottom-20 md:bottom-6 right-6 left-6 md:left-auto md:w-auto max-w-sm p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-slide-up ${type === 'success' ? 'bg-emerald-600' :
            type === 'error' ? 'bg-red-600' :
                type === 'warning' ? 'bg-amber-600' :
                    'bg-indigo-600'
        }`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';

    toast.innerHTML = `
    <span class="text-xl">${icon}</span>
    <span class="text-white text-sm flex-1">${message}</span>
  `;

    document.body.appendChild(toast);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

/**
 * Retry utility
 */
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, delay * (i + 1)));
            }
        }
    }

    throw lastError;
};

export default ErrorBoundary;
