const express = require('express');
const authRoutes = require('./auth.routes');
const chatRoutes = require('./chat.routes');
const leadRoutes = require('./lead.routes');
const timeRoutes = require('./time.routes');
const fileRoutes = require('./file.routes');
const clientPortalRoutes = require('./clientPortal.routes');

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

/**
 * API Routes
 */
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/leads', leadRoutes);
router.use('/time', timeRoutes);
router.use('/files', fileRoutes);
router.use('/client-portal', clientPortalRoutes);

// Optional: Google routes (require googleapis)
try {
    const googleRoutes = require('./google.routes');
    router.use('/google', googleRoutes);
    console.log('✓ Google routes loaded');
} catch (err) {
    console.warn('⚠ Google routes skipped:', err.message);
}

// Optional: AI routes (require @google-cloud/vertexai)
try {
    const aiRoutes = require('./ai.routes');
    router.use('/ai', aiRoutes);
    console.log('✓ AI routes loaded');
} catch (err) {
    console.warn('⚠ AI routes skipped:', err.message);
}

module.exports = router;
