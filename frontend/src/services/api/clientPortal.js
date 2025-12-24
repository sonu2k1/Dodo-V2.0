import apiClient from './client';

/**
 * Client Portal API service
 */
export const clientPortalApi = {
    // ======= PROJECTS =======
    getProjects: async () => {
        const response = await apiClient.get('/client-portal/projects');
        return response.data;
    },

    getProject: async (projectId) => {
        const response = await apiClient.get(`/client-portal/projects/${projectId}`);
        return response.data;
    },

    getCompletedTasks: async (projectId = null) => {
        const params = projectId ? `?projectId=${projectId}` : '';
        const response = await apiClient.get(`/client-portal/tasks/completed${params}`);
        return response.data;
    },

    // ======= APPROVALS =======
    getApprovals: async (status = null) => {
        const params = status ? `?status=${status}` : '';
        const response = await apiClient.get(`/client-portal/approvals${params}`);
        return response.data;
    },

    getPendingApprovals: async () => {
        const response = await apiClient.get('/client-portal/approvals/pending');
        return response.data;
    },

    submitDecision: async (approvalId, decision, feedback = null) => {
        const response = await apiClient.post(`/client-portal/approvals/${approvalId}/decision`, {
            decision,
            feedback,
        });
        return response.data;
    },

    // ======= FINANCIALS =======
    getFinancialSummary: async () => {
        const response = await apiClient.get('/client-portal/financials/summary');
        return response.data;
    },

    getInvoices: async () => {
        const response = await apiClient.get('/client-portal/invoices');
        return response.data;
    },

    getPayments: async () => {
        const response = await apiClient.get('/client-portal/payments');
        return response.data;
    },

    // ======= SUPPORT TICKETS =======
    getTickets: async (status = null) => {
        const params = status ? `?status=${status}` : '';
        const response = await apiClient.get(`/client-portal/tickets${params}`);
        return response.data;
    },

    createTicket: async (ticketData) => {
        const response = await apiClient.post('/client-portal/tickets', ticketData);
        return response.data;
    },

    getTicketMessages: async (ticketId) => {
        const response = await apiClient.get(`/client-portal/tickets/${ticketId}/messages`);
        return response.data;
    },

    addTicketMessage: async (ticketId, message) => {
        const response = await apiClient.post(`/client-portal/tickets/${ticketId}/messages`, { message });
        return response.data;
    },
};

export default clientPortalApi;
