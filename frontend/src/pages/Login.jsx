import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
            </div>

            {/* Login card */}
            <div className="relative w-full max-w-md">
                <div className="glass-panel p-8 animate-slide-up">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                            <span className="text-white font-bold text-2xl">D</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">DoDo v2.0</h1>
                        <p className="text-slate-400 text-sm mt-1">Internal Operations System</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@kuava.in"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Powered by KUAVA
                    </p>
                </div>
            </div>
        </div>
    );
}
