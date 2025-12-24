const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const config = require('../config/env');

/**
 * Security middleware configuration
 */

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.',
    },
});

// Helmet security headers
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", config.supabase?.url, "wss:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
});

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            config.frontend?.url,
            'http://localhost:5173',
            'http://localhost:3000',
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-google-token'],
};

// Request sanitization
const sanitizeRequest = (req, res, next) => {
    // Remove __proto__ and constructor from body
    if (req.body && typeof req.body === 'object') {
        delete req.body.__proto__;
        delete req.body.constructor;
    }
    next();
};

// JWT validation headers check
const validateAuthHeader = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authorization header format',
        });
    }
    next();
};

module.exports = {
    apiLimiter,
    authLimiter,
    helmetConfig,
    corsOptions,
    cors: cors(corsOptions),
    sanitizeRequest,
    validateAuthHeader,
};
