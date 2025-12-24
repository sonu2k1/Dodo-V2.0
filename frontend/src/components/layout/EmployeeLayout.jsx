import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Icons
const Icons = {
    Dashboard: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Tasks: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
    Time: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Chat: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    Calendar: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
    { name: 'Work Cockpit', path: '/employee', icon: Icons.Dashboard },
    { name: 'My Tasks', path: '/employee/tasks', icon: Icons.Tasks },
    { name: 'Time Tracking', path: '/employee/time', icon: Icons.Time },
    { name: 'Messages', path: '/employee/chat', icon: Icons.Chat },
    { name: 'Calendar', path: '/employee/calendar', icon: Icons.Calendar },
];

export default function EmployeeLayout({ children }) {
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">DoDo</h1>
                            <span className="text-xs text-slate-400">Work Cockpit</span>
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
                            end={item.path === '/employee'}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive
                                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
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
                                <p className="text-xs text-slate-400 truncate">Employee</p>
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

                        <div className="flex-1 flex items-center gap-4 ml-4 lg:ml-0">
                            <h2 className="text-lg font-semibold text-white hidden lg:block">Work Cockpit</h2>
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
