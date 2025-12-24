const logger = require('../config/logger');

/**
 * Error classes for consistent error handling
 */

class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTH_ERROR');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, 'FORBIDDEN');
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT');
    }
}

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let code = err.code || 'SERVER_ERROR';

    // Log error
    if (statusCode >= 500) {
        logger.error(`${err.stack || err.message}`);
    } else {
        logger.warn(`${statusCode} - ${message} - ${req.originalUrl}`);
    }

    // Supabase errors
    if (err.code?.startsWith('PGRST')) {
        statusCode = 400;
        code = 'DATABASE_ERROR';
        message = 'Database operation failed';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Token expired';
    }

    // Validation errors (Joi/express-validator)
    if (err.isJoi || err.array) {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
    }

    // Response
    const response = {
        success: false,
        message,
        code,
    };

    // Include errors array for validation
    if (err.errors) {
        response.errors = err.errors;
    }

    // Include stack in development
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        code: 'NOT_FOUND',
    });
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    asyncHandler,
    errorHandler,
    notFoundHandler,
};
