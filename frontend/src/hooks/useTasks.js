import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { tasksApi } from '../services/api/tasks';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch current user's tasks
 */
export function useMyTasks(filters = {}) {
    const { user } = useAuth();

    return useQuery({
        queryKey: queryKeys.tasks.myTasks(user?.id),
        queryFn: () => tasksApi.getMyTasks(filters),
        enabled: !!user?.id,
    });
}

/**
 * Hook to fetch a single task
 */
export function useTask(taskId) {
    return useQuery({
        queryKey: queryKeys.tasks.detail(taskId),
        queryFn: () => tasksApi.getTask(taskId),
        enabled: !!taskId,
    });
}

/**
 * Hook to create a new task with optimistic update
 */
export function useCreateTask() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: tasksApi.createTask,
        onMutate: async (newTask) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });

            // Snapshot previous value
            const previousTasks = queryClient.getQueryData(queryKeys.tasks.myTasks(user?.id));

            // Optimistically add new task
            queryClient.setQueryData(queryKeys.tasks.myTasks(user?.id), (old) => ({
                ...old,
                data: [...(old?.data || []), {
                    ...newTask,
                    id: `temp-${Date.now()}`,
                    status: 'todo',
                    created_at: new Date().toISOString(),
                    _optimistic: true,
                }],
            }));

            return { previousTasks };
        },
        onError: (err, newTask, context) => {
            // Rollback on error
            queryClient.setQueryData(
                queryKeys.tasks.myTasks(user?.id),
                context.previousTasks
            );
        },
        onSettled: () => {
            // Refetch after mutation
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });
        },
    });
}

/**
 * Hook to update task with optimistic update
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: tasksApi.updateTask,
        onMutate: async ({ taskId, data }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });

            const previousTasks = queryClient.getQueryData(queryKeys.tasks.myTasks(user?.id));

            // Optimistically update task
            queryClient.setQueryData(queryKeys.tasks.myTasks(user?.id), (old) => ({
                ...old,
                data: old?.data?.map(task =>
                    task.id === taskId ? { ...task, ...data, _optimistic: true } : task
                ),
            }));

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(
                queryKeys.tasks.myTasks(user?.id),
                context.previousTasks
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });
        },
    });
}

/**
 * Hook to update task status with optimistic update
 */
export function useUpdateTaskStatus() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: tasksApi.updateStatus,
        onMutate: async ({ taskId, status }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });

            const previousTasks = queryClient.getQueryData(queryKeys.tasks.myTasks(user?.id));

            // Optimistically update status
            queryClient.setQueryData(queryKeys.tasks.myTasks(user?.id), (old) => ({
                ...old,
                data: old?.data?.map(task =>
                    task.id === taskId ? { ...task, status, _optimistic: true } : task
                ),
            }));

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(
                queryKeys.tasks.myTasks(user?.id),
                context.previousTasks
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });
        },
    });
}

/**
 * Hook to delete task with optimistic update
 */
export function useDeleteTask() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: tasksApi.deleteTask,
        onMutate: async (taskId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });

            const previousTasks = queryClient.getQueryData(queryKeys.tasks.myTasks(user?.id));

            // Optimistically remove task
            queryClient.setQueryData(queryKeys.tasks.myTasks(user?.id), (old) => ({
                ...old,
                data: old?.data?.filter(task => task.id !== taskId),
            }));

            return { previousTasks };
        },
        onError: (err, taskId, context) => {
            queryClient.setQueryData(
                queryKeys.tasks.myTasks(user?.id),
                context.previousTasks
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });
        },
    });
}

/**
 * Hook to add task dependency
 */
export function useAddDependency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tasksApi.addDependency,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) });
        },
    });
}

/**
 * Hook to remove task dependency
 */
export function useRemoveDependency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tasksApi.removeDependency,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) });
        },
    });
}

/**
 * Hook to assign task to user
 */
export function useAssignTask() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: tasksApi.assignTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myTasks(user?.id) });
        },
    });
}

export default {
    useMyTasks,
    useTask,
    useCreateTask,
    useUpdateTask,
    useUpdateTaskStatus,
    useDeleteTask,
    useAddDependency,
    useRemoveDependency,
    useAssignTask,
};
