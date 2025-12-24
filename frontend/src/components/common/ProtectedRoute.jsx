import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route - requires authentication
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Save the attempted URL for redirect after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children || <Outlet />;
}

/**
 * Role-based Route - requires specific role(s)
 * @param {Object} props
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access
 * @param {string} props.fallback - Route to redirect if unauthorized
 */
export function RoleRoute({ allowedRoles, fallback = '/unauthorized', children }) {
    const { isAuthenticated, hasRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!hasRole(allowedRoles)) {
        return <Navigate to={fallback} replace />;
    }

    return children || <Outlet />;
}

/**
 * Permission-based Route - requires specific permission(s)
 * @param {Object} props
 * @param {string|string[]} props.requiredPermissions - Permission(s) required
 * @param {boolean} props.requireAll - If true, all permissions required. If false, any one.
 * @param {string} props.fallback - Route to redirect if unauthorized
 */
export function PermissionRoute({
    requiredPermissions,
    requireAll = false,
    fallback = '/unauthorized',
    children
}) {
    const { isAuthenticated, hasPermission, hasAllPermissions, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const hasAccess = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasPermission(requiredPermissions);

    if (!hasAccess) {
        return <Navigate to={fallback} replace />;
    }

    return children || <Outlet />;
}

/**
 * Guest Route - only accessible when NOT authenticated
 * Useful for login/register pages
 */
export function GuestRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children || <Outlet />;
}

export default ProtectedRoute;
