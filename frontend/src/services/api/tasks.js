import apiClient from './client';

/**
 * Tasks API service
 */
export const tasksApi = {
    /**
     * Get all tasks for current user
     */
    getMyTasks: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.projectId) params.append('projectId', filters.projectId);
        if (filters.dueDate) params.append('dueDate', filters.dueDate);

        const response = await apiClient.get(`/tasks/my-tasks?${params.toString()}`);
        return response.data;
    },

    /**
     * Get single task by ID
     */
    getTask: async (taskId) => {
        const response = await apiClient.get(`/tasks/${taskId}`);
        return response.data;
    },

    /**
     * Create new task
     */
    createTask: async (taskData) => {
        const response = await apiClient.post('/tasks', taskData);
        return response.data;
    },

    /**
     * Update task
     */
    updateTask: async ({ taskId, data }) => {
        const response = await apiClient.patch(`/tasks/${taskId}`, data);
        return response.data;
    },

    /**
     * Delete task
     */
    deleteTask: async (taskId) => {
        const response = await apiClient.delete(`/tasks/${taskId}`);
        return response.data;
    },

    /**
     * Update task status
     */
    updateStatus: async ({ taskId, status }) => {
        const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
        return response.data;
    },

    /**
     * Add task dependency
     */
    addDependency: async ({ taskId, dependsOnTaskId }) => {
        const response = await apiClient.post(`/tasks/${taskId}/dependencies`, { dependsOnTaskId });
        return response.data;
    },

    /**
     * Remove task dependency
     */
    removeDependency: async ({ taskId, dependsOnTaskId }) => {
        const response = await apiClient.delete(`/tasks/${taskId}/dependencies/${dependsOnTaskId}`);
        return response.data;
    },

    /**
     * Get task dependencies
     */
    getDependencies: async (taskId) => {
        const response = await apiClient.get(`/tasks/${taskId}/dependencies`);
        return response.data;
    },

    /**
     * Assign task to user
     */
    assignTask: async ({ taskId, userId }) => {
        const response = await apiClient.patch(`/tasks/${taskId}/assign`, { userId });
        return response.data;
    },
};

export default tasksApi;
