import apiClient from './client';

/**
 * Authentication API service
 */
export const authApi = {
    /**
     * Register new user
     */
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    /**
     * Login with email/password
     */
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    /**
     * Get Google OAuth URL
     */
    getGoogleAuthUrl: () => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
        return `${baseUrl}/auth/google`;
    },

    /**
     * Refresh access token
     */
    refresh: async () => {
        const response = await apiClient.post('/auth/refresh');
        return response.data;
    },

    /**
     * Logout
     */
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    /**
     * Logout from all devices
     */
    logoutAll: async () => {
        const response = await apiClient.post('/auth/logout-all');
        return response.data;
    },

    /**
     * Get current user profile
     */
    getProfile: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};

export default authApi;
