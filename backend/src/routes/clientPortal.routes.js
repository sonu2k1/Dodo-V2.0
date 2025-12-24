const express = require('express');
const clientPortalService = require('../services/clientPortal.service');
const { authenticate, requireRoles } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const { ROLES } = require('../config/rbac');

const router = express.Router();

// All routes require client role
const requireClient = requireRoles(ROLES.CLIENT, ROLES.SUPER_ADMIN, ROLES.ADMIN);

/**
 * GET /client-portal/projects
 * Get client's projects with progress
 */
router.get('/projects', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;

    if (!clientId) {
        return res.status(400).json({ success: false, message: 'Client ID required' });
    }

    const projects = await clientPortalService.getClientProjects(clientId);
    res.json({ success: true, data: projects });
}));

/**
 * GET /client-portal/projects/:id
 * Get project details
 */
router.get('/projects/:id', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const project = await clientPortalService.getProjectDetails(req.params.id, clientId);

    if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
}));

/**
 * GET /client-portal/tasks/completed
 * Get completed tasks (read-only)
 */
router.get('/tasks/completed', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const { projectId } = req.query;

    const tasks = await clientPortalService.getCompletedTasks(clientId, projectId);
    res.json({ success: true, data: tasks });
}));

// ======= APPROVALS =======

/**
 * GET /client-portal/approvals
 * Get approvals
 */
router.get('/approvals', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const { status } = req.query;

    const approvals = await clientPortalService.getApprovals(clientId, status);
    res.json({ success: true, data: approvals });
}));

/**
 * GET /client-portal/approvals/pending
 * Get pending approvals
 */
router.get('/approvals/pending', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const approvals = await clientPortalService.getPendingApprovals(clientId);
    res.json({ success: true, data: approvals });
}));

/**
 * POST /client-portal/approvals/:id/decision
 * Submit approval decision
 */
router.post('/approvals/:id/decision', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const { decision, feedback } = req.body;

    if (!['approve', 'request_changes'].includes(decision)) {
        return res.status(400).json({ success: false, message: 'Invalid decision' });
    }

    const approval = await clientPortalService.submitApprovalDecision(
        req.params.id,
        clientId,
        decision,
        feedback
    );

    res.json({ success: true, data: approval });
}));

// ======= FINANCIALS =======

/**
 * GET /client-portal/financials/summary
 * Get financial summary
 */
router.get('/financials/summary', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const summary = await clientPortalService.getFinancialSummary(clientId);
    res.json({ success: true, data: summary });
}));

/**
 * GET /client-portal/invoices
 * Get invoices
 */
router.get('/invoices', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const invoices = await clientPortalService.getInvoices(clientId);
    res.json({ success: true, data: invoices });
}));

/**
 * GET /client-portal/payments
 * Get payment history
 */
router.get('/payments', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const payments = await clientPortalService.getPaymentHistory(clientId);
    res.json({ success: true, data: payments });
}));

// ======= SUPPORT TICKETS =======

/**
 * GET /client-portal/tickets
 * Get support tickets
 */
router.get('/tickets', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const { status } = req.query;

    const tickets = await clientPortalService.getSupportTickets(clientId, status);
    res.json({ success: true, data: tickets });
}));

/**
 * POST /client-portal/tickets
 * Create support ticket
 */
router.post('/tickets', authenticate, requireClient, asyncHandler(async (req, res) => {
    const clientId = req.user.client_id || req.query.clientId;
    const ticket = await clientPortalService.createSupportTicket(clientId, req.user.id, req.body);
    res.status(201).json({ success: true, data: ticket });
}));

/**
 * GET /client-portal/tickets/:id/messages
 * Get ticket messages
 */
router.get('/tickets/:id/messages', authenticate, requireClient, asyncHandler(async (req, res) => {
    const isClient = req.user.role === 'client';
    const messages = await clientPortalService.getTicketMessages(req.params.id, isClient);
    res.json({ success: true, data: messages });
}));

/**
 * POST /client-portal/tickets/:id/messages
 * Add message to ticket
 */
router.post('/tickets/:id/messages', authenticate, requireClient, asyncHandler(async (req, res) => {
    const { message } = req.body;
    const isInternal = req.user.role !== 'client' && req.body.isInternal;

    const newMessage = await clientPortalService.addTicketMessage(
        req.params.id,
        req.user.id,
        message,
        isInternal
    );

    res.status(201).json({ success: true, data: newMessage });
}));

module.exports = router;
