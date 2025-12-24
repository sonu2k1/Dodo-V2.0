import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './utils/errorHandling';
import router from './router';
import './styles/index.css';
import './styles/mobile.css';

// React Query client with optimizations
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <RouterProvider router={router} />
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
