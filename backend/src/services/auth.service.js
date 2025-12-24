const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/database');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    hashToken,
} = require('../utils/jwt');
const { getPermissionsForRole } = require('../config/rbac');

/**
 * Auth Service - Business logic for authentication
 */
class AuthService {
    /**
     * Register a new user with email/password
     */
    async register({ email, password, fullName, role = 'employee' }) {
        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            throw { statusCode: 409, message: 'Email already registered', code: 'EMAIL_EXISTS' };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                email,
                password_hash: passwordHash,
                full_name: fullName,
                role,
                is_active: true,
            })
            .select('id, email, full_name, role, avatar_url, created_at')
            .single();

        if (error) {
            throw { statusCode: 500, message: 'Failed to create user', code: 'CREATE_FAILED' };
        }

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return { user, ...tokens };
    }

    /**
     * Login with email/password
     */
    async login({ email, password }) {
        // Find user
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            throw { statusCode: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
        }

        if (!user.is_active) {
            throw { statusCode: 403, message: 'Account deactivated', code: 'ACCOUNT_DEACTIVATED' };
        }

        if (!user.password_hash) {
            throw { statusCode: 401, message: 'Please login with Google', code: 'USE_GOOGLE_LOGIN' };
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw { statusCode: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
        }

        // Update last login
        await supabaseAdmin
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);

        // Generate tokens
        const tokens = await this.generateTokens(user);

        // Remove sensitive data
        const { password_hash, ...safeUser } = user;

        return { user: safeUser, ...tokens };
    }

    /**
     * Handle Google OAuth callback
     */
    async handleGoogleLogin(user) {
        const tokens = await this.generateTokens(user);

        // Log audit
        await this.logAudit(user.id, 'LOGIN', 'users', user.id, null, { method: 'google' });

        return { user, ...tokens };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        // Verify refresh token
        const decoded = verifyToken(refreshToken, 'refresh');
        const tokenHash = hashToken(refreshToken);

        // Check if token exists and not revoked
        const { data: storedToken, error } = await supabaseAdmin
            .from('refresh_tokens')
            .select('*')
            .eq('token_hash', tokenHash)
            .eq('is_revoked', false)
            .single();

        if (error || !storedToken) {
            throw { statusCode: 401, message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' };
        }

        // Check expiry
        if (new Date(storedToken.expires_at) < new Date()) {
            throw { statusCode: 401, message: 'Refresh token expired', code: 'REFRESH_TOKEN_EXPIRED' };
        }

        // Get user
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, role, is_active, avatar_url')
            .eq('id', decoded.sub)
            .single();

        if (!user || !user.is_active) {
            throw { statusCode: 401, message: 'User not found or inactive', code: 'USER_INVALID' };
        }

        // Revoke old token
        await supabaseAdmin
            .from('refresh_tokens')
            .update({ is_revoked: true })
            .eq('id', storedToken.id);

        // Generate new tokens
        const tokens = await this.generateTokens(user);

        return { user, ...tokens };
    }

    /**
     * Logout - revoke refresh token
     */
    async logout(userId, refreshToken) {
        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);
            await supabaseAdmin
                .from('refresh_tokens')
                .update({ is_revoked: true })
                .eq('token_hash', tokenHash);
        }

        // Log audit
        await this.logAudit(userId, 'LOGOUT', 'users', userId, null, null);

        return { success: true };
    }

    /**
     * Logout from all devices
     */
    async logoutAll(userId) {
        await supabaseAdmin
            .from('refresh_tokens')
            .update({ is_revoked: true })
            .eq('user_id', userId);

        await this.logAudit(userId, 'LOGOUT_ALL', 'users', userId, null, null);

        return { success: true };
    }

    /**
     * Generate access and refresh tokens
     */
    async generateTokens(user) {
        const permissions = getPermissionsForRole(user.role);
        const accessToken = generateAccessToken(user, permissions);
        const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken(user);

        // Store refresh token hash
        await supabaseAdmin.from('refresh_tokens').insert({
            user_id: user.id,
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString(),
        });

        return { accessToken, refreshToken };
    }

    /**
     * Get current user profile
     */
    async getProfile(userId) {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, role, avatar_url, phone, created_at, last_login_at')
            .eq('id', userId)
            .single();

        if (error || !user) {
            throw { statusCode: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
        }

        return {
            ...user,
            permissions: getPermissionsForRole(user.role),
        };
    }

    /**
     * Log audit trail
     */
    async logAudit(userId, action, entityType, entityId, oldValues, newValues, req = null) {
        await supabaseAdmin.from('audit_logs').insert({
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_values: oldValues,
            new_values: newValues,
            ip_address: req?.ip || null,
            user_agent: req?.get?.('user-agent') || null,
        });
    }
}

module.exports = new AuthService();
