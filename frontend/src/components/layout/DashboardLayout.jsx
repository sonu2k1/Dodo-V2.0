import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Icons (simplified SVG icons)
const Icons = {
    Dashboard: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    Users: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    Settings: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Audit: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Broadcast: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
    ),
    Logout: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    Menu: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    Close: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: Icons.Dashboard },
    { name: 'User Management', path: '/admin/users', icon: Icons.Users },
    { name: 'System Settings', path: '/admin/settings', icon: Icons.Settings },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: Icons.Audit },
    { name: 'Announcements', path: '/admin/announcements', icon: Icons.Broadcast },
];

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 
        bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">DoDo</h1>
                            <span className="text-xs text-slate-400">v2.0 Admin</span>
                        </div>
                    </div>
                    <button
                        className="lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Icons.Close />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }
              `}
                        >
                            <item.icon />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
                    <div className="glass-card p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-white font-semibold">
                                        {user?.full_name?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{user?.full_name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Icons.Logout />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:ml-72">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                    <div className="flex items-center justify-between h-full px-4 lg:px-8">
                        <button
                            className="lg:hidden text-slate-400 hover:text-white"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Icons.Menu />
                        </button>

                        <div className="flex-1 lg:flex-none">
                            {/* Search could go here */}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
