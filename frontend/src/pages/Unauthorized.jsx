import { Link } from 'react-router-dom';

export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative text-center max-w-md">
                <div className="glass-panel p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center">
                        <span className="text-4xl">🚫</span>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-slate-400 mb-6">
                        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Link to="/dashboard" className="btn-primary">
                            Go to Dashboard
                        </Link>
                        <Link to="/login" className="btn-secondary">
                            Sign Out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
