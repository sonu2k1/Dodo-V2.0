const authService = require('../services/auth.service');
const config = require('../config/env');

/**
 * Auth Controller - HTTP handlers for authentication
 */
class AuthController {
    /**
     * POST /auth/register
     */
    async register(req, res, next) {
        try {
            const { email, password, fullName } = req.body;

            const result = await authService.register({
                email,
                password,
                fullName,
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const result = await authService.login({ email, password });

            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /auth/google
     * Initiates Google OAuth flow (handled by Passport)
     */

    /**
     * GET /auth/google/callback
     * Google OAuth callback handler
     */
    async googleCallback(req, res, next) {
        try {
            if (!req.user) {
                return res.redirect(`${config.frontendUrl}/login?error=google_auth_failed`);
            }

            const result = await authService.handleGoogleLogin(req.user);

            // Redirect to frontend with tokens
            const params = new URLSearchParams({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });

            res.redirect(`${config.frontendUrl}/auth/callback?${params.toString()}`);
        } catch (error) {
            res.redirect(`${config.frontendUrl}/login?error=google_auth_failed`);
        }
    }

    /**
     * POST /auth/refresh
     */
    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token required',
                    code: 'REFRESH_TOKEN_REQUIRED',
                });
            }

            const result = await authService.refreshToken(refreshToken);

            // Update refresh token cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: 'Token refreshed',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /auth/logout
     */
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            await authService.logout(req.user.id, refreshToken);

            // Clear cookie
            res.clearCookie('refreshToken');

            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /auth/logout-all
     */
    async logoutAll(req, res, next) {
        try {
            await authService.logoutAll(req.user.id);

            res.clearCookie('refreshToken');

            res.json({
                success: true,
                message: 'Logged out from all devices',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /auth/me
     */
    async getProfile(req, res, next) {
        try {
            const user = await authService.getProfile(req.user.id);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
