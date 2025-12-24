import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * OAuth Callback Handler
 * Handles the redirect from backend after Google OAuth
 */
export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const { handleOAuthCallback } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            navigate('/login?error=oauth_failed', { replace: true });
            return;
        }

        if (accessToken) {
            handleOAuthCallback(accessToken, refreshToken);
        } else {
            navigate('/login', { replace: true });
        }
    }, [searchParams, handleOAuthCallback, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">Completing authentication...</p>
            </div>
        </div>
    );
}
