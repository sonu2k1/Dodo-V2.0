import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await register(formData.email, formData.password, formData.fullName);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="glass-panel p-8 animate-slide-up">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-white font-bold text-2xl">D</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-slate-400 text-sm mt-1">Join DoDo v2.0</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="you@kuava.in"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full btn-primary py-3">
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
