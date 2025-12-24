const winston = require('winston');
const path = require('path');

// Log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
};

// Colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston.addColors(colors);

// Format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    ),
);

// File format (no colors)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Transports - Only use console in production/serverless (Vercel has read-only filesystem)
// Check for VERCEL env var which is auto-set by Vercel, or NODE_ENV production
const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';

const transports = [
    // Console (always)
    new winston.transports.Console({ format }),
];

// Only add file transports in development (not on serverless platforms like Vercel)
if (!isServerless) {
    transports.push(
        // Error file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Combined file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            format: fileFormat,
            maxsize: 5242880,
            maxFiles: 5,
        })
    );
}

// Create logger
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});

// HTTP request logging format
logger.httpFormat = (req, res, responseTime) => {
    return {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        userId: req.user?.id,
    };
};

module.exports = logger;
