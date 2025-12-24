import apiClient from './client';

/**
 * Files API service
 */
export const filesApi = {
    /**
     * Upload file
     */
    uploadFile: async (file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        if (options.entityType) formData.append('entityType', options.entityType);
        if (options.entityId) formData.append('entityId', options.entityId);
        if (options.folderId) formData.append('folderId', options.folderId);

        const response = await apiClient.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Get files for entity
     */
    getEntityFiles: async (entityType, entityId) => {
        const response = await apiClient.get(`/files/entity/${entityType}/${entityId}`);
        return response.data;
    },

    /**
     * Get recent files
     */
    getRecentFiles: async (limit = 10) => {
        const response = await apiClient.get(`/files/recent?limit=${limit}`);
        return response.data;
    },

    /**
     * Search files
     */
    searchFiles: async (query, entityType = null, entityId = null) => {
        const params = new URLSearchParams({ q: query });
        if (entityType) params.append('entityType', entityType);
        if (entityId) params.append('entityId', entityId);

        const response = await apiClient.get(`/files/search?${params.toString()}`);
        return response.data;
    },

    /**
     * Get file details
     */
    getFile: async (fileId) => {
        const response = await apiClient.get(`/files/${fileId}`);
        return response.data;
    },

    /**
     * Update file visibility
     */
    updateVisibility: async (fileId, isVisibleToClient) => {
        const response = await apiClient.patch(`/files/${fileId}/visibility`, { isVisibleToClient });
        return response.data;
    },

    /**
     * Delete file
     */
    deleteFile: async (fileId, deleteFromDrive = false) => {
        const response = await apiClient.delete(`/files/${fileId}?deleteFromDrive=${deleteFromDrive}`);
        return response.data;
    },

    /**
     * Create client folder
     */
    createClientFolder: async (clientId, clientName) => {
        const response = await apiClient.post(`/files/client/${clientId}/folder`, { clientName });
        return response.data;
    },

    /**
     * Get client folder
     */
    getClientFolder: async (clientId) => {
        const response = await apiClient.get(`/files/client/${clientId}/folder`);
        return response.data;
    },

    /**
     * List Drive folder contents
     */
    listDriveFolder: async (folderId, pageToken = null) => {
        const params = pageToken ? `?pageToken=${pageToken}` : '';
        const response = await apiClient.get(`/files/drive/list/${folderId}${params}`);
        return response.data;
    },
};

export default filesApi;
