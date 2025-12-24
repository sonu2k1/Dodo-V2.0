const express = require('express');
const timeTrackingService = require('../services/timeTracking.service');
const { authenticate } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

const router = express.Router();

/**
 * POST /time/start
 * Start timer on a task
 */
router.post('/start', authenticate, asyncHandler(async (req, res) => {
    const { taskId, description } = req.body;

    if (!taskId) {
        return res.status(400).json({ success: false, message: 'Task ID required' });
    }

    const entry = await timeTrackingService.startTimer(req.user.id, taskId, description);
    res.status(201).json({ success: true, data: entry });
}));

/**
 * POST /time/stop
 * Stop running timer
 */
router.post('/stop', authenticate, asyncHandler(async (req, res) => {
    const { entryId } = req.body;
    const entry = await timeTrackingService.stopTimer(req.user.id, entryId);

    if (!entry) {
        return res.status(404).json({ success: false, message: 'No running timer found' });
    }

    res.json({ success: true, data: entry });
}));

/**
 * GET /time/running
 * Get current running timer
 */
router.get('/running', authenticate, asyncHandler(async (req, res) => {
    const timer = await timeTrackingService.getRunningTimer(req.user.id);
    res.json({ success: true, data: timer });
}));

/**
 * POST /time/manual
 * Create manual time entry
 */
router.post('/manual', authenticate, asyncHandler(async (req, res) => {
    const entry = await timeTrackingService.createManualEntry(req.user.id, req.body);
    res.status(201).json({ success: true, data: entry });
}));

/**
 * GET /time/entries
 * Get user's time entries
 */
router.get('/entries', authenticate, asyncHandler(async (req, res) => {
    const { startDate, endDate, taskId, limit } = req.query;

    const entries = await timeTrackingService.getEntries(req.user.id, {
        startDate,
        endDate,
        taskId,
        limit: parseInt(limit) || undefined,
    });

    res.json({ success: true, data: entries });
}));

/**
 * PATCH /time/entries/:id
 * Update time entry
 */
router.patch('/entries/:id', authenticate, asyncHandler(async (req, res) => {
    const entry = await timeTrackingService.updateEntry(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: entry });
}));

/**
 * DELETE /time/entries/:id
 * Delete time entry
 */
router.delete('/entries/:id', authenticate, asyncHandler(async (req, res) => {
    await timeTrackingService.deleteEntry(req.params.id, req.user.id);
    res.json({ success: true, message: 'Entry deleted' });
}));

/**
 * GET /time/summary/daily
 * Get daily summary
 */
router.get('/summary/daily', authenticate, asyncHandler(async (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const summary = await timeTrackingService.getDailySummary(req.user.id, date);
    res.json({ success: true, data: summary });
}));

/**
 * GET /time/summary/weekly
 * Get weekly summary
 */
router.get('/summary/weekly', authenticate, asyncHandler(async (req, res) => {
    // Default to start of current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = req.query.weekStart || new Date(today.setDate(diff)).toISOString().split('T')[0];

    const summary = await timeTrackingService.getWeeklySummary(req.user.id, weekStart);
    res.json({ success: true, data: summary });
}));

/**
 * GET /time/task/:taskId/summary
 * Get time summary for a specific task
 */
router.get('/task/:taskId/summary', authenticate, asyncHandler(async (req, res) => {
    const summary = await timeTrackingService.getTaskTimeSummary(req.params.taskId);
    res.json({ success: true, data: summary });
}));

module.exports = router;
