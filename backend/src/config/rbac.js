/**
 * Role-Based Access Control (RBAC) Configuration
 * 
 * Defines permissions for each role in the system.
 * Roles hierarchy: super_admin > admin > employee > client
 */

const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    CLIENT: 'client',
};

const PERMISSIONS = {
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

    // Lead management (CRM)
    LEADS_READ: 'leads:read',
    LEADS_CREATE: 'leads:create',
    LEADS_UPDATE: 'leads:update',
    LEADS_DELETE: 'leads:delete',

    // Time tracking
    TIME_READ: 'time:read',
    TIME_CREATE: 'time:create',
    TIME_UPDATE: 'time:update',
    TIME_DELETE: 'time:delete',

    // Chat
    CHAT_READ: 'chat:read',
    CHAT_CREATE: 'chat:create',
    CHAT_UPDATE: 'chat:update',
    CHAT_DELETE: 'chat:delete',

    // Approvals
    APPROVALS_READ: 'approvals:read',
    APPROVALS_CREATE: 'approvals:create',
    APPROVALS_APPROVE: 'approvals:approve',
    APPROVALS_DELETE: 'approvals:delete',

    // Invoices
    INVOICES_READ: 'invoices:read',
    INVOICES_CREATE: 'invoices:create',
    INVOICES_UPDATE: 'invoices:update',
    INVOICES_DELETE: 'invoices:delete',

    // Audit logs
    AUDIT_LOGS_READ: 'audit_logs:read',

    // Admin panel
    ADMIN_ACCESS: 'admin:access',
};

/**
 * Role to permissions mapping
 */
const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions

    [ROLES.ADMIN]: [
        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.PROJECTS_CREATE,
        PERMISSIONS.PROJECTS_UPDATE,
        PERMISSIONS.PROJECTS_DELETE,
        PERMISSIONS.TASKS_READ,
        PERMISSIONS.TASKS_CREATE,
        PERMISSIONS.TASKS_UPDATE,
        PERMISSIONS.TASKS_DELETE,
        PERMISSIONS.LEADS_READ,
        PERMISSIONS.LEADS_CREATE,
        PERMISSIONS.LEADS_UPDATE,
        PERMISSIONS.LEADS_DELETE,
        PERMISSIONS.TIME_READ,
        PERMISSIONS.TIME_CREATE,
        PERMISSIONS.TIME_UPDATE,
        PERMISSIONS.TIME_DELETE,
        PERMISSIONS.CHAT_READ,
        PERMISSIONS.CHAT_CREATE,
        PERMISSIONS.CHAT_UPDATE,
        PERMISSIONS.APPROVALS_READ,
        PERMISSIONS.APPROVALS_CREATE,
        PERMISSIONS.APPROVALS_APPROVE,
        PERMISSIONS.INVOICES_READ,
        PERMISSIONS.INVOICES_CREATE,
        PERMISSIONS.INVOICES_UPDATE,
        PERMISSIONS.AUDIT_LOGS_READ,
        PERMISSIONS.ADMIN_ACCESS,
    ],

    [ROLES.EMPLOYEE]: [
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.TASKS_READ,
        PERMISSIONS.TASKS_CREATE,
        PERMISSIONS.TASKS_UPDATE,
        PERMISSIONS.LEADS_READ,
        PERMISSIONS.LEADS_CREATE,
        PERMISSIONS.LEADS_UPDATE,
        PERMISSIONS.TIME_READ,
        PERMISSIONS.TIME_CREATE,
        PERMISSIONS.TIME_UPDATE,
        PERMISSIONS.CHAT_READ,
        PERMISSIONS.CHAT_CREATE,
        PERMISSIONS.CHAT_UPDATE,
        PERMISSIONS.APPROVALS_READ,
        PERMISSIONS.APPROVALS_CREATE,
        PERMISSIONS.INVOICES_READ,
    ],

    [ROLES.CLIENT]: [
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.TASKS_READ,
        PERMISSIONS.CHAT_READ,
        PERMISSIONS.CHAT_CREATE,
        PERMISSIONS.APPROVALS_READ,
        PERMISSIONS.APPROVALS_APPROVE,
        PERMISSIONS.INVOICES_READ,
    ],
};

/**
 * Get permissions for a role
 * @param {string} role - User role
 * @returns {string[]} - Array of permission strings
 */
const getPermissionsForRole = (role) => {
    return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if role has specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
    const permissions = getPermissionsForRole(role);
    return permissions.includes(permission);
};

/**
 * Check if role has any of the given permissions
 * @param {string} role - User role
 * @param {string[]} requiredPermissions - Permissions to check
 * @returns {boolean}
 */
const hasAnyPermission = (role, requiredPermissions) => {
    const permissions = getPermissionsForRole(role);
    return requiredPermissions.some(perm => permissions.includes(perm));
};

/**
 * Check if role has all of the given permissions
 * @param {string} role - User role
 * @param {string[]} requiredPermissions - Permissions to check
 * @returns {boolean}
 */
const hasAllPermissions = (role, requiredPermissions) => {
    const permissions = getPermissionsForRole(role);
    return requiredPermissions.every(perm => permissions.includes(perm));
};

/**
 * Check if role1 is higher or equal to role2 in hierarchy
 * @param {string} role1 
 * @param {string} role2 
 * @returns {boolean}
 */
const isRoleHigherOrEqual = (role1, role2) => {
    const hierarchy = [ROLES.CLIENT, ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.SUPER_ADMIN];
    return hierarchy.indexOf(role1) >= hierarchy.indexOf(role2);
};

module.exports = {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    getPermissionsForRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRoleHigherOrEqual,
};
