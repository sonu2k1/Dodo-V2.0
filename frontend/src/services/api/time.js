import apiClient from './client';

/**
 * Time Tracking API service
 */
export const timeApi = {
    /**
     * Start timer
     */
    startTimer: async (taskId, description = '') => {
        const response = await apiClient.post('/time/start', { taskId, description });
        return response.data;
    },

    /**
     * Stop timer
     */
    stopTimer: async (entryId = null) => {
        const response = await apiClient.post('/time/stop', { entryId });
        return response.data;
    },

    /**
     * Get running timer
     */
    getRunningTimer: async () => {
        const response = await apiClient.get('/time/running');
        return response.data;
    },

    /**
     * Create manual entry
     */
    createManualEntry: async (data) => {
        const response = await apiClient.post('/time/manual', data);
        return response.data;
    },

    /**
     * Get entries
     */
    getEntries: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.taskId) params.append('taskId', filters.taskId);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/time/entries?${params.toString()}`);
        return response.data;
    },

    /**
     * Update entry
     */
    updateEntry: async (entryId, data) => {
        const response = await apiClient.patch(`/time/entries/${entryId}`, data);
        return response.data;
    },

    /**
     * Delete entry
     */
    deleteEntry: async (entryId) => {
        const response = await apiClient.delete(`/time/entries/${entryId}`);
        return response.data;
    },

    /**
     * Get daily summary
     */
    getDailySummary: async (date) => {
        const response = await apiClient.get(`/time/summary/daily?date=${date}`);
        return response.data;
    },

    /**
     * Get weekly summary
     */
    getWeeklySummary: async (weekStart) => {
        const response = await apiClient.get(`/time/summary/weekly?weekStart=${weekStart}`);
        return response.data;
    },

    /**
     * Get task time summary
     */
    getTaskSummary: async (taskId) => {
        const response = await apiClient.get(`/time/task/${taskId}/summary`);
        return response.data;
    },
};

export default timeApi;
