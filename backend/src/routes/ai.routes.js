const express = require('express');
const vertexAIService = require('../services/vertexai.service');
const { authenticate, requireRoles } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const { supabaseAdmin } = require('../config/database');

const router = express.Router();

// Initialize Vertex AI on startup
vertexAIService.initialize();

// ======= CHAT SUMMARIZATION =======

/**
 * POST /ai/chat/summarize
 * Summarize chat thread
 */
router.post('/chat/summarize', authenticate, asyncHandler(async (req, res) => {
    const { roomId, saveForApproval } = req.body;

    // Fetch chat messages
    const { data: messages, error } = await supabaseAdmin
        .from('chat_messages')
        .select('content, sender:users!sender_id(full_name)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

    if (error || !messages?.length) {
        return res.status(404).json({ success: false, message: 'No messages found' });
    }

    const formattedMessages = messages.map(m => ({
        content: m.content,
        sender_name: m.sender?.full_name || 'Unknown',
    }));

    const result = await vertexAIService.summarizeChatThread(formattedMessages);

    // Save for human approval if requested
    if (saveForApproval) {
        const suggestion = await vertexAIService.saveSuggestion(
            'summary',
            roomId,
            result,
            req.user.id
        );
        result.suggestionId = suggestion.id;
    }

    res.json({ success: true, data: result });
}));

// ======= TASK SUB-TASK SUGGESTIONS =======

/**
 * POST /ai/task/suggest-subtasks
 * Generate sub-task suggestions for a task
 */
router.post('/task/suggest-subtasks', authenticate, asyncHandler(async (req, res) => {
    const { taskId } = req.body;

    // Fetch task
    const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .select('*, project:projects(name)')
        .eq('id', taskId)
        .single();

    if (error || !task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const taskWithProject = {
        ...task,
        project_name: task.project?.name,
    };

    const result = await vertexAIService.suggestSubtasks(taskWithProject);

    // Always save for approval
    const suggestion = await vertexAIService.saveSuggestion(
        'subtasks',
        taskId,
        result,
        req.user.id
    );

    res.json({
        success: true,
        data: {
            ...result,
            suggestionId: suggestion.id,
            requiresApproval: true,
        }
    });
}));

/**
 * POST /ai/task/apply-subtasks
 * Apply approved subtasks to a task
 */
router.post('/task/apply-subtasks', authenticate, asyncHandler(async (req, res) => {
    const { suggestionId, selectedSubtasks } = req.body;

    // Get suggestion
    const { data: suggestion, error: suggError } = await supabaseAdmin
        .from('ai_suggestions')
        .select('*')
        .eq('id', suggestionId)
        .single();

    if (suggError || !suggestion) {
        return res.status(404).json({ success: false, message: 'Suggestion not found' });
    }

    // Approve the suggestion
    await vertexAIService.approveSuggestion(suggestionId, req.user.id, selectedSubtasks);

    // Apply selected subtasks
    const subtasksToApply = selectedSubtasks || suggestion.suggestion_data.suggestions;
    const createdTasks = await vertexAIService.applySubtasks(
        suggestion.entity_id,
        subtasksToApply,
        req.user.id
    );

    res.json({ success: true, data: { created: createdTasks.length, tasks: createdTasks } });
}));

// ======= EMAIL SUMMARIZATION =======

/**
 * POST /ai/email/summarize
 * Summarize email thread
 */
router.post('/email/summarize', authenticate, asyncHandler(async (req, res) => {
    const { emails, threadId } = req.body;

    if (!emails?.length) {
        return res.status(400).json({ success: false, message: 'No emails provided' });
    }

    const result = await vertexAIService.summarizeEmailThread(emails);

    // Save for reference
    if (threadId) {
        await vertexAIService.saveSuggestion(
            'email_summary',
            threadId,
            result,
            req.user.id
        );
    }

    res.json({ success: true, data: result });
}));

// ======= SUGGESTION MANAGEMENT =======

/**
 * GET /ai/suggestions/pending
 * Get pending AI suggestions
 */
router.get('/suggestions/pending', authenticate, asyncHandler(async (req, res) => {
    const suggestions = await vertexAIService.getPendingSuggestions(req.user.id);
    res.json({ success: true, data: suggestions });
}));

/**
 * POST /ai/suggestions/:id/approve
 * Approve a suggestion
 */
router.post('/suggestions/:id/approve', authenticate, asyncHandler(async (req, res) => {
    const { selectedItems } = req.body;
    const suggestion = await vertexAIService.approveSuggestion(
        req.params.id,
        req.user.id,
        selectedItems
    );
    res.json({ success: true, data: suggestion });
}));

/**
 * POST /ai/suggestions/:id/reject
 * Reject a suggestion
 */
router.post('/suggestions/:id/reject', authenticate, asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const suggestion = await vertexAIService.rejectSuggestion(
        req.params.id,
        req.user.id,
        reason
    );
    res.json({ success: true, data: suggestion });
}));

/**
 * GET /ai/usage
 * Get token usage stats (admin only)
 */
router.get('/usage', authenticate, requireRoles('super_admin', 'admin'), (req, res) => {
    const usage = vertexAIService.getTokenUsage();
    res.json({ success: true, data: usage });
});

module.exports = router;
