const { validationResult } = require('express-validator');

/**
 * Validation middleware - checks express-validator results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }

    next();
};

module.exports = { validate };
