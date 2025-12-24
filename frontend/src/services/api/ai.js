import apiClient from './client';

/**
 * AI (Vertex AI) API service
 */
export const aiApi = {
    // ======= CHAT =======

    /**
     * Summarize chat thread
     */
    summarizeChatThread: async (roomId, saveForApproval = false) => {
        const response = await apiClient.post('/ai/chat/summarize', {
            roomId,
            saveForApproval,
        });
        return response.data;
    },

    // ======= TASKS =======

    /**
     * Get sub-task suggestions for a task
     */
    suggestSubtasks: async (taskId) => {
        const response = await apiClient.post('/ai/task/suggest-subtasks', { taskId });
        return response.data;
    },

    /**
     * Apply approved subtasks
     */
    applySubtasks: async (suggestionId, selectedSubtasks = null) => {
        const response = await apiClient.post('/ai/task/apply-subtasks', {
            suggestionId,
            selectedSubtasks,
        });
        return response.data;
    },

    // ======= EMAIL =======

    /**
     * Summarize email thread
     */
    summarizeEmailThread: async (emails, threadId = null) => {
        const response = await apiClient.post('/ai/email/summarize', {
            emails,
            threadId,
        });
        return response.data;
    },

    // ======= SUGGESTIONS =======

    /**
     * Get pending AI suggestions
     */
    getPendingSuggestions: async () => {
        const response = await apiClient.get('/ai/suggestions/pending');
        return response.data;
    },

    /**
     * Approve suggestion
     */
    approveSuggestion: async (suggestionId, selectedItems = null) => {
        const response = await apiClient.post(`/ai/suggestions/${suggestionId}/approve`, {
            selectedItems,
        });
        return response.data;
    },

    /**
     * Reject suggestion
     */
    rejectSuggestion: async (suggestionId, reason = null) => {
        const response = await apiClient.post(`/ai/suggestions/${suggestionId}/reject`, {
            reason,
        });
        return response.data;
    },

    /**
     * Get usage stats (admin only)
     */
    getUsageStats: async () => {
        const response = await apiClient.get('/ai/usage');
        return response.data;
    },
};

export default aiApi;
