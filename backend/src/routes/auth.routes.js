const express = require('express');
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
    registerValidator,
    loginValidator,
    refreshValidator,
} = require('../validators/auth.validator');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user with email/password
 * @access  Public
 */
router.post(
    '/register',
    registerValidator,
    validate,
    authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email/password
 * @access  Public
 */
router.post(
    '/login',
    loginValidator,
    validate,
    authController.login
);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login?error=google_auth_failed',
    }),
    authController.googleCallback
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token)
 */
router.post(
    '/refresh',
    refreshValidator,
    validate,
    authController.refresh
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout current session
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
