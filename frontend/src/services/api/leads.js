import apiClient from './client';

/**
 * Leads API service
 */
export const leadsApi = {
    /**
     * Get all leads
     */
    getLeads: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.source) params.append('source', filters.source);
        if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
        if (filters.search) params.append('search', filters.search);

        const response = await apiClient.get(`/leads?${params.toString()}`);
        return response.data;
    },

    /**
     * Get lead by ID
     */
    getLead: async (leadId) => {
        const response = await apiClient.get(`/leads/${leadId}`);
        return response.data;
    },

    /**
     * Get lead statistics
     */
    getStats: async () => {
        const response = await apiClient.get('/leads/stats');
        return response.data;
    },

    /**
     * Get employees for assignment
     */
    getEmployees: async () => {
        const response = await apiClient.get('/leads/employees');
        return response.data;
    },

    /**
     * Create new lead
     */
    createLead: async (leadData) => {
        const response = await apiClient.post('/leads', leadData);
        return response.data;
    },

    /**
     * Update lead
     */
    updateLead: async (leadId, data) => {
        const response = await apiClient.patch(`/leads/${leadId}`, data);
        return response.data;
    },

    /**
     * Update lead status
     */
    updateStatus: async (leadId, status) => {
        const response = await apiClient.patch(`/leads/${leadId}/status`, { status });
        return response.data;
    },

    /**
     * Assign lead
     */
    assignLead: async (leadId, assignedTo) => {
        const response = await apiClient.patch(`/leads/${leadId}/assign`, { assignedTo });
        return response.data;
    },

    /**
     * Convert lead
     */
    convertLead: async (leadId, result, notes) => {
        const response = await apiClient.post(`/leads/${leadId}/convert`, { result, notes });
        return response.data;
    },

    /**
     * Get lead activity
     */
    getActivity: async (leadId) => {
        const response = await apiClient.get(`/leads/${leadId}/activity`);
        return response.data;
    },

    /**
     * Add note to lead
     */
    addNote: async (leadId, note) => {
        const response = await apiClient.post(`/leads/${leadId}/notes`, { note });
        return response.data;
    },

    /**
     * Delete lead
     */
    deleteLead: async (leadId) => {
        const response = await apiClient.delete(`/leads/${leadId}`);
        return response.data;
    },

    // ======= AI FEATURES =======

    /**
     * Get AI summary of emails
     */
    getAISummary: async (leadId, emails) => {
        const response = await apiClient.post(`/leads/${leadId}/ai/summary`, { emails });
        return response.data;
    },

    /**
     * Get AI insights for lead
     */
    getAIInsights: async (leadId) => {
        const response = await apiClient.get(`/leads/${leadId}/ai/insights`);
        return response.data;
    },

    /**
     * Get AI follow-up suggestion
     */
    getAIFollowUp: async (leadId, context) => {
        const response = await apiClient.post(`/leads/${leadId}/ai/follow-up`, { context });
        return response.data;
    },
};

export default leadsApi;
