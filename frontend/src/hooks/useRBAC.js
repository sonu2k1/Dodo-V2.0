import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for role-based rendering
 * @param {string|string[]} allowedRoles - Role(s) that are allowed
 * @returns {boolean} - Whether user has the role
 */
export function useRequireRole(allowedRoles) {
    const { hasRole, isAuthenticated } = useAuth();
    return isAuthenticated && hasRole(allowedRoles);
}

/**
 * Custom hook for permission-based rendering
 * @param {string|string[]} requiredPermissions - Permission(s) required
 * @param {boolean} requireAll - If true, all permissions required
 * @returns {boolean} - Whether user has the permission(s)
 */
export function useRequirePermission(requiredPermissions, requireAll = false) {
    const { hasPermission, hasAllPermissions, isAuthenticated } = useAuth();

    if (!isAuthenticated) return false;

    return requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasPermission(requiredPermissions);
}

/**
 * Roles constants for easy access
 */
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    CLIENT: 'client',
};

/**
 * Permissions constants
 */
export const PERMISSIONS = {
    // User management
    USERS_READ: 'users:read',
    USERS_CREATE: 'users:create',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',

    // Project management
    PROJECTS_READ: 'projects:read',
    PROJECTS_CREATE: 'projects:create',
    PROJECTS_UPDATE: 'projects:update',
    PROJECTS_DELETE: 'projects:delete',

    // Task management
    TASKS_READ: 'tasks:read',
    TASKS_CREATE: 'tasks:create',
    TASKS_UPDATE: 'tasks:update',
    TASKS_DELETE: 'tasks:delete',

    // Lead management
    LEADS_READ: 'leads:read',
    LEADS_CREATE: 'leads:create',
    LEADS_UPDATE: 'leads:update',
    LEADS_DELETE: 'leads:delete',

    // Invoices
    INVOICES_READ: 'invoices:read',
    INVOICES_CREATE: 'invoices:create',
    INVOICES_UPDATE: 'invoices:update',
    INVOICES_DELETE: 'invoices:delete',

    // Audit logs
    AUDIT_LOGS_READ: 'audit_logs:read',

    // Admin access
    ADMIN_ACCESS: 'admin:access',
};

export default { useRequireRole, useRequirePermission, ROLES, PERMISSIONS };
