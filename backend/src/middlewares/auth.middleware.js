const {
    verifyToken,
    extractBearerToken,
    isInactiveTimeout,
    generateAccessToken,
} = require('../utils/jwt');
const { getPermissionsForRole, hasPermission, hasAnyPermission, hasAllPermissions } = require('../config/rbac');
const { supabaseAdmin } = require('../config/database');

/**
 * Authenticate JWT token and attach user to request
 * Also handles auto-logout after inactivity
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractBearerToken(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
                code: 'TOKEN_REQUIRED',
            });
        }

        // Verify token
        const decoded = verifyToken(token, 'access');

        // Check inactivity timeout (auto-logout after 24 hours)
        if (isInactiveTimeout(decoded.lastActivity)) {
            return res.status(401).json({
                success: false,
                message: 'Session expired due to inactivity',
                code: 'INACTIVITY_TIMEOUT',
            });
        }

        // Fetch fresh user data from database
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, role, is_active, avatar_url')
            .eq('id', decoded.sub)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND',
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated',
                code: 'ACCOUNT_DEACTIVATED',
            });
        }

        // Attach user and permissions to request
        req.user = {
            ...user,
            permissions: getPermissionsForRole(user.role),
        };
        req.token = decoded;

        next();
    } catch (error) {
        if (error.message === 'Token has expired') {
            return res.status(401).json({
                success: false,
                message: 'Access token has expired',
                code: 'TOKEN_EXPIRED',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid access token',
            code: 'INVALID_TOKEN',
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractBearerToken(authHeader);

        if (!token) {
            return next();
        }

        const decoded = verifyToken(token, 'access');

        if (!isInactiveTimeout(decoded.lastActivity)) {
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('id, email, full_name, role, is_active, avatar_url')
                .eq('id', decoded.sub)
                .single();

            if (user && user.is_active) {
                req.user = {
                    ...user,
                    permissions: getPermissionsForRole(user.role),
                };
                req.token = decoded;
            }
        }

        next();
    } catch {
        // Ignore errors for optional auth
        next();
    }
};

/**
 * Require specific roles
 * @param {...string} allowedRoles - Roles that are allowed access
 */
const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient role privileges',
                code: 'INSUFFICIENT_ROLE',
                required: allowedRoles,
                current: req.user.role,
            });
        }

        next();
    };
};

/**
 * Require specific permission
 * @param {string} permission - Permission required
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }

        if (!hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSION',
                required: permission,
            });
        }

        next();
    };
};

/**
 * Require any of the specified permissions
 * @param {...string} permissions - Permissions (any one required)
 */
const requireAnyPermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }

        if (!hasAnyPermission(req.user.role, permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSION',
                required: permissions,
            });
        }

        next();
    };
};

/**
 * Require all specified permissions
 * @param {...string} permissions - All permissions required
 */
const requireAllPermissions = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }

        if (!hasAllPermissions(req.user.role, permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSION',
                required: permissions,
            });
        }

        next();
    };
};

/**
 * Require owner or specific roles
 * Checks if user owns the resource or has elevated role
 * @param {Function} getOwnerId - Function to get owner ID from request
 * @param {...string} allowedRoles - Roles that bypass ownership check
 */
const requireOwnerOrRoles = (getOwnerId, ...allowedRoles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
        }

        // Check if user has elevated role
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }

        // Check ownership
        const ownerId = await getOwnerId(req);
        if (ownerId === req.user.id) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied',
            code: 'ACCESS_DENIED',
        });
    };
};

module.exports = {
    authenticate,
    optionalAuth,
    requireRoles,
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireOwnerOrRoles,
};
