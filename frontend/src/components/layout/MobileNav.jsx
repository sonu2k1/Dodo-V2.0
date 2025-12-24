import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Mobile Bottom Navigation
 */
export default function MobileNav() {
    const location = useLocation();
    const { user } = useAuth();

    const navItems = [
        { path: '/dashboard', icon: '🏠', label: 'Home' },
        { path: '/chat', icon: '💬', label: 'Chat' },
        { path: '/time', icon: '⏱️', label: 'Time' },
        { path: '/files', icon: '📁', label: 'Files' },
    ];

    // Add portal for clients
    if (user?.role === 'client') {
        navItems.splice(1, 0, { path: '/portal', icon: '🏢', label: 'Portal' });
    }

    // Add CRM for employees/admins
    if (['super_admin', 'admin', 'employee'].includes(user?.role)) {
        navItems.push({ path: '/crm', icon: '📊', label: 'CRM' });
    }

    // Limit to 5 items
    const displayItems = navItems.slice(0, 5);

    return (
        <nav className="mobile-nav md:hidden">
            <div className="flex items-center justify-around">
                {displayItems.map(item => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`mobile-menu-btn tap-target ${isActive ? 'active' : ''}`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-xs">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
