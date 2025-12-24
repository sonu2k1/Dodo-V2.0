const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

/**
 * JWT Token Structure:
 * {
 *   sub: userId (UUID),
 *   email: user email,
 *   role: user_role enum,
 *   permissions: string[],
 *   type: 'access' | 'refresh',
 *   iat: issued at timestamp,
 *   exp: expiration timestamp,
 *   iss: issuer (dodo-v2),
 *   lastActivity: last activity timestamp (for auto-logout)
 * }
 */

/**
 * Parse duration string to milliseconds
 * @param {string} duration - Duration string like '15m', '7d', '24h'
 * @returns {number} - Duration in milliseconds
 */
const parseDuration = (duration) => {
    const units = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid duration format: ${duration}`);
    return parseInt(match[1], 10) * units[match[2]];
};

/**
 * Generate access token
 * @param {Object} user - User object with id, email, role
 * @param {string[]} permissions - Array of permission strings
 * @returns {string} - JWT access token
 */
const generateAccessToken = (user, permissions = []) => {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions,
        type: 'access',
        lastActivity: Date.now(),
    };

    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.accessExpiry,
        issuer: config.jwt.issuer,
    });
};

/**
 * Generate refresh token
 * @param {Object} user - User object with id
 * @returns {Object} - Object with token and hash for storage
 */
const generateRefreshToken = (user) => {
    const payload = {
        sub: user.id,
        type: 'refresh',
        jti: crypto.randomUUID(), // Unique token ID
    };

    const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.refreshExpiry,
        issuer: config.jwt.issuer,
    });

    // Create hash for storage (don't store raw token)
    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const expiresAt = new Date(
        Date.now() + parseDuration(config.jwt.refreshExpiry)
    );

    return { token, tokenHash, expiresAt };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} expectedType - Expected token type ('access' | 'refresh')
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token, expectedType = 'access') => {
    try {
        const decoded = jwt.verify(token, config.jwt.secret, {
            issuer: config.jwt.issuer,
        });

        if (decoded.type !== expectedType) {
            throw new Error(`Invalid token type. Expected ${expectedType}`);
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

/**
 * Check if user has been inactive beyond threshold
 * @param {number} lastActivity - Timestamp of last activity
 * @returns {boolean} - True if user should be logged out
 */
const isInactiveTimeout = (lastActivity) => {
    const timeoutMs = config.inactivityTimeoutHours * 60 * 60 * 1000;
    return Date.now() - lastActivity > timeoutMs;
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Token or null
 */
const extractBearerToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};

/**
 * Hash refresh token for comparison
 * @param {string} token - Raw refresh token
 * @returns {string} - SHA256 hash
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    isInactiveTimeout,
    extractBearerToken,
    hashToken,
    parseDuration,
};
