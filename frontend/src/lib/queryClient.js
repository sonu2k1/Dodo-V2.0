import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client with optimistic update defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

// Query keys factory
export const queryKeys = {
    // Tasks
    tasks: {
        all: ['tasks'],
        lists: () => [...queryKeys.tasks.all, 'list'],
        list: (filters) => [...queryKeys.tasks.lists(), filters],
        details: () => [...queryKeys.tasks.all, 'detail'],
        detail: (id) => [...queryKeys.tasks.details(), id],
        myTasks: (userId) => [...queryKeys.tasks.all, 'my-tasks', userId],
    },
    // Projects
    projects: {
        all: ['projects'],
        lists: () => [...queryKeys.projects.all, 'list'],
        list: (filters) => [...queryKeys.projects.lists(), filters],
        detail: (id) => [...queryKeys.projects.all, 'detail', id],
    },
    // Users
    users: {
        all: ['users'],
        list: () => [...queryKeys.users.all, 'list'],
        detail: (id) => [...queryKeys.users.all, 'detail', id],
    },
    // Activity
    activity: {
        all: ['activity'],
        recent: (userId) => [...queryKeys.activity.all, 'recent', userId],
    },
};

// Provider component
export function QueryProvider({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

export default queryClient;
