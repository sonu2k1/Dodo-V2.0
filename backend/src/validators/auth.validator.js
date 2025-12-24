const { body } = require('express-validator');

/**
 * Auth validators using express-validator
 */

const registerValidator = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be 2-100 characters'),
];

const loginValidator = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const refreshValidator = [
    body('refreshToken')
        .optional()
        .isString()
        .withMessage('Refresh token must be a string'),
];

module.exports = {
    registerValidator,
    loginValidator,
    refreshValidator,
};
