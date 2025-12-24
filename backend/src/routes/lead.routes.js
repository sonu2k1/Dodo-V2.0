const express = require('express');
const leadService = require('../services/lead.service');
const geminiService = require('../services/gemini.service');
const { authenticate, requireRoles, requirePermission } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const { ROLES, PERMISSIONS } = require('../config/rbac');

const router = express.Router();

/**
 * GET /leads
 * Get all leads (filtered by role)
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
    const { status, source, assignedTo, search } = req.query;

    const leads = await leadService.getLeads(
        { status, source, assignedTo, search },
        req.user.id,
        req.user.role
    );

    res.json({ success: true, data: leads });
}));

/**
 * GET /leads/stats
 * Get lead statistics
 */
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
    const stats = await leadService.getLeadStats(req.user.id, req.user.role);
    res.json({ success: true, data: stats });
}));

/**
 * GET /leads/employees
 * Get employees for assignment dropdown
 */
router.get('/employees', authenticate, asyncHandler(async (req, res) => {
    const employees = await leadService.getEmployeesForAssignment();
    res.json({ success: true, data: employees });
}));

/**
 * GET /leads/:id
 * Get single lead by ID
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const lead = await leadService.getLeadById(req.params.id);

    if (!lead) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Check access for employees
    if (req.user.role === 'employee' && lead.assigned_to !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: lead });
}));

/**
 * POST /leads
 * Create new lead
 */
router.post('/',
    authenticate,
    requirePermission(PERMISSIONS.LEADS_CREATE),
    asyncHandler(async (req, res) => {
        const lead = await leadService.createLead(req.body, req.user.id);
        res.status(201).json({ success: true, data: lead });
    })
);

/**
 * PATCH /leads/:id
 * Update lead
 */
router.patch('/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const lead = await leadService.updateLead(req.params.id, req.body, req.user.id);
        res.json({ success: true, data: lead });
    })
);

/**
 * PATCH /leads/:id/status
 * Update lead status
 */
router.patch('/:id/status',
    authenticate,
    asyncHandler(async (req, res) => {
        const { status } = req.body;
        const lead = await leadService.updateStatus(req.params.id, status, req.user.id);
        res.json({ success: true, data: lead });
    })
);

/**
 * PATCH /leads/:id/assign
 * Assign lead to employee
 */
router.patch('/:id/assign',
    authenticate,
    requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        const { assignedTo } = req.body;
        const lead = await leadService.assignLead(req.params.id, assignedTo, req.user.id);
        res.json({ success: true, data: lead });
    })
);

/**
 * POST /leads/:id/convert
 * Convert lead (won/lost)
 */
router.post('/:id/convert',
    authenticate,
    asyncHandler(async (req, res) => {
        const { result, notes } = req.body;
        const lead = await leadService.convertLead(req.params.id, result, notes, req.user.id);
        res.json({ success: true, data: lead });
    })
);

/**
 * GET /leads/:id/activity
 * Get lead activity history
 */
router.get('/:id/activity', authenticate, asyncHandler(async (req, res) => {
    const activity = await leadService.getLeadActivity(req.params.id);
    res.json({ success: true, data: activity });
}));

/**
 * POST /leads/:id/notes
 * Add note to lead
 */
router.post('/:id/notes', authenticate, asyncHandler(async (req, res) => {
    const { note } = req.body;
    await leadService.addNote(req.params.id, note, req.user.id);
    res.json({ success: true, message: 'Note added' });
}));

/**
 * DELETE /leads/:id
 * Delete lead
 */
router.delete('/:id',
    authenticate,
    requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        await leadService.deleteLead(req.params.id, req.user.id);
        res.json({ success: true, message: 'Lead deleted' });
    })
);

// ======= AI FEATURES =======

/**
 * POST /leads/:id/ai/summary
 * Generate AI summary of email thread
 */
router.post('/:id/ai/summary',
    authenticate,
    asyncHandler(async (req, res) => {
        const { emails } = req.body;

        if (!geminiService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'AI features not available. Configure GEMINI_API_KEY.'
            });
        }

        const result = await geminiService.summarizeEmailThread(emails);
        res.json({ success: true, data: result });
    })
);

/**
 * GET /leads/:id/ai/insights
 * Generate AI insights for lead
 */
router.get('/:id/ai/insights',
    authenticate,
    asyncHandler(async (req, res) => {
        if (!geminiService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'AI features not available'
            });
        }

        const lead = await leadService.getLeadById(req.params.id);
        const result = await geminiService.generateLeadInsights(lead);
        res.json({ success: true, data: result });
    })
);

/**
 * POST /leads/:id/ai/follow-up
 * Generate AI follow-up suggestion
 */
router.post('/:id/ai/follow-up',
    authenticate,
    asyncHandler(async (req, res) => {
        const { context } = req.body;

        if (!geminiService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'AI features not available'
            });
        }

        const lead = await leadService.getLeadById(req.params.id);
        const result = await geminiService.suggestFollowUp(lead, context || {});
        res.json({ success: true, data: result });
    })
);

module.exports = router;
