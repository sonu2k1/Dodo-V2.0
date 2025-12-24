const express = require('express');
const calendarService = require('../services/calendar.service');
const gmailService = require('../services/gmail.service');
const driveService = require('../services/drive.service');
const fileService = require('../services/file.service');
const { authenticate, requireRoles } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const { supabaseAdmin } = require('../config/database');

const router = express.Router();

// ======= GOOGLE CALENDAR =======

/**
 * POST /google/calendar/sync-task
 * Sync single task to Google Calendar
 */
router.post('/calendar/sync-task', authenticate, asyncHandler(async (req, res) => {
    const { taskId } = req.body;
    const accessToken = req.headers['x-google-token'];

    if (!accessToken) {
        return res.status(400).json({ success: false, message: 'Google access token required' });
    }

    await calendarService.initialize(accessToken);

    // Get task
    const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .select('*, project:projects(name)')
        .eq('id', taskId)
        .single();

    if (error) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.due_date) {
        return res.status(400).json({ success: false, message: 'Task has no due date' });
    }

    const result = await calendarService.createTaskEvent({
        ...task,
        project_name: task.project?.name,
    });

    // Save event ID to task
    await supabaseAdmin
        .from('tasks')
        .update({ calendar_event_id: result.eventId })
        .eq('id', taskId);

    res.json({ success: true, data: result });
}));

/**
 * POST /google/calendar/sync-all
 * Sync all tasks with due dates to calendar
 */
router.post('/calendar/sync-all', authenticate, asyncHandler(async (req, res) => {
    const accessToken = req.headers['x-google-token'];

    if (!accessToken) {
        return res.status(400).json({ success: false, message: 'Google access token required' });
    }

    await calendarService.initialize(accessToken);

    // Get all user's tasks with due dates
    const { data: tasks } = await supabaseAdmin
        .from('tasks')
        .select('*, project:projects(name)')
        .eq('assigned_to', req.user.id)
        .not('due_date', 'is', null)
        .in('status', ['todo', 'in_progress']);

    const results = await calendarService.syncTasks(
        tasks.map(t => ({ ...t, project_name: t.project?.name }))
    );

    // Update event IDs
    for (const result of results) {
        if (result.eventId) {
            await supabaseAdmin
                .from('tasks')
                .update({ calendar_event_id: result.eventId })
                .eq('id', result.taskId);
        }
    }

    res.json({ success: true, data: results });
}));

/**
 * GET /google/calendar/upcoming
 * Get upcoming calendar events
 */
router.get('/calendar/upcoming', authenticate, asyncHandler(async (req, res) => {
    const accessToken = req.headers['x-google-token'];

    if (!accessToken) {
        return res.status(400).json({ success: false, message: 'Google access token required' });
    }

    await calendarService.initialize(accessToken);
    const events = await calendarService.getUpcomingEvents();

    res.json({ success: true, data: events });
}));

// ======= GOOGLE DRIVE AUTO-FOLDER =======

/**
 * POST /google/drive/create-client-folder
 * Auto-create folder for new client
 */
router.post('/drive/create-client-folder', authenticate, asyncHandler(async (req, res) => {
    const { clientId, clientName } = req.body;

    if (!driveService.isConfigured()) {
        return res.status(503).json({ success: false, message: 'Drive not configured' });
    }

    // Check if folder exists
    const existing = await fileService.getClientFolder(clientId);
    if (existing) {
        return res.json({ success: true, data: existing, message: 'Folder already exists' });
    }

    // Create folders
    const folders = await driveService.createClientFolders(clientName, clientId);
    const record = await fileService.saveClientFolder(clientId, folders);

    res.status(201).json({ success: true, data: record });
}));

// ======= GMAIL EMAIL INGESTION =======

/**
 * POST /google/gmail/process-emails
 * Process DoDo-labeled emails and create tasks
 */
router.post('/gmail/process-emails', authenticate, asyncHandler(async (req, res) => {
    const accessToken = req.headers['x-google-token'];
    const { projectId } = req.body;

    if (!accessToken) {
        return res.status(400).json({ success: false, message: 'Google access token required' });
    }

    await gmailService.initialize(accessToken);
    const results = await gmailService.processDoDoEmails(req.user.id, projectId);

    res.json({ success: true, data: results });
}));

/**
 * GET /google/gmail/dodo-emails
 * Fetch emails with DoDo label
 */
router.get('/gmail/dodo-emails', authenticate, asyncHandler(async (req, res) => {
    const accessToken = req.headers['x-google-token'];

    if (!accessToken) {
        return res.status(400).json({ success: false, message: 'Google access token required' });
    }

    await gmailService.initialize(accessToken);
    const emails = await gmailService.fetchDoDoEmails(20);

    res.json({ success: true, data: emails });
}));

/**
 * POST /google/gmail/create-task-from-email
 * Create task from specific email
 */
router.post('/gmail/create-task-from-email', authenticate, asyncHandler(async (req, res) => {
    const accessToken = req.headers['x-google-token'];
    const { email, projectId } = req.body;

    if (!accessToken) {
        return res.status(400).json({ success: false, message: 'Google access token required' });
    }

    await gmailService.initialize(accessToken);
    const task = await gmailService.createTaskFromEmail(email, req.user.id, projectId);

    res.status(201).json({ success: true, data: task });
}));

/**
 * POST /google/gmail/setup-watch
 * Setup Gmail push notifications (requires Pub/Sub topic)
 */
router.post('/gmail/setup-watch', authenticate, asyncHandler(async (req, res) => {
    const accessToken = req.headers['x-google-token'];
    const { topicName } = req.body;

    if (!accessToken || !topicName) {
        return res.status(400).json({ success: false, message: 'Token and topic required' });
    }

    await gmailService.initialize(accessToken);
    const watch = await gmailService.setupWatch(topicName);

    res.json({ success: true, data: watch });
}));

module.exports = router;
