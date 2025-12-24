import apiClient from './client';

/**
 * Google Integrations API service
 */
export const googleApi = {
    // Store Google OAuth token in memory
    _googleToken: null,

    setGoogleToken(token) {
        this._googleToken = token;
    },

    getHeaders() {
        return this._googleToken ? { 'x-google-token': this._googleToken } : {};
    },

    // ======= CALENDAR =======

    /**
     * Sync single task to Google Calendar
     */
    syncTaskToCalendar: async (taskId) => {
        const response = await apiClient.post('/google/calendar/sync-task',
            { taskId },
            { headers: googleApi.getHeaders() }
        );
        return response.data;
    },

    /**
     * Sync all tasks to calendar
     */
    syncAllTasks: async () => {
        const response = await apiClient.post('/google/calendar/sync-all',
            {},
            { headers: googleApi.getHeaders() }
        );
        return response.data;
    },

    /**
     * Get upcoming calendar events
     */
    getUpcomingEvents: async () => {
        const response = await apiClient.get('/google/calendar/upcoming',
            { headers: googleApi.getHeaders() }
        );
        return response.data;
    },

    // ======= DRIVE =======

    /**
     * Create client folder
     */
    createClientFolder: async (clientId, clientName) => {
        const response = await apiClient.post('/google/drive/create-client-folder',
            { clientId, clientName }
        );
        return response.data;
    },

    // ======= GMAIL =======

    /**
     * Process DoDo labeled emails
     */
    processDoDoEmails: async (projectId = null) => {
        const response = await apiClient.post('/google/gmail/process-emails',
            { projectId },
            { headers: googleApi.getHeaders() }
        );
        return response.data;
    },

    /**
     * Get DoDo labeled emails
     */
    getDoDoEmails: async () => {
        const response = await apiClient.get('/google/gmail/dodo-emails',
            { headers: googleApi.getHeaders() }
        );
        return response.data;
    },

    /**
     * Create task from email
     */
    createTaskFromEmail: async (email, projectId = null) => {
        const response = await apiClient.post('/google/gmail/create-task-from-email',
            { email, projectId },
            { headers: googleApi.getHeaders() }
        );
        return response.data;
    },

    /**
     * Setup Gmail push notifications
     */
    setupGmailWatch: async (topicName) => {
        const response = await apiClient.post('/google/gmail/setup-watch',
            { topicName },
            { headers: googleApi.getHeaders() }
        );
        return response.data;
    },
};

export default googleApi;
