const logger = require('../config/logger');

/**
 * Performance monitoring middleware
 */

// Request timing
const requestTimer = (req, res, next) => {
    req.startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - req.startTime;

        // Log slow requests
        if (duration > 1000) {
            logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
        }

        // Log HTTP request
        logger.http(JSON.stringify(logger.httpFormat(req, res, duration)));
    });

    next();
};

// Response compression check
const compressionCheck = (req, res, next) => {
    // Skip compression for small responses
    const originalSend = res.send;
    res.send = function (body) {
        if (Buffer.byteLength(body) < 1024) {
            res.removeHeader('Content-Encoding');
        }
        return originalSend.call(this, body);
    };
    next();
};

// Cache headers for static responses
const cacheControl = (maxAge = 300) => (req, res, next) => {
    if (req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${maxAge}`);
    }
    next();
};

// API response time header
const responseTimeHeader = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        res.set('X-Response-Time', `${time}ms`);
    });

    next();
};

// Memory usage monitoring
const memoryMonitor = () => {
    const usage = process.memoryUsage();
    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(usage.external / 1024 / 1024) + 'MB',
        rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    };
};

// Health check with metrics
const healthCheck = (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: memoryMonitor(),
        nodeVersion: process.version,
    });
};

module.exports = {
    requestTimer,
    compressionCheck,
    cacheControl,
    responseTimeHeader,
    memoryMonitor,
    healthCheck,
};
