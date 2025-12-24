import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleRoute, GuestRoute } from './components/common/ProtectedRoute';
import { ROLES } from './hooks/useRBAC';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';

// Auth pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// Main pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const Announcements = lazy(() => import('./pages/admin/Announcements'));

// Employee pages
const WorkCockpit = lazy(() => import('./pages/employee/WorkCockpit'));

// Chat
const ChatPage = lazy(() => import('./pages/ChatPage'));

// CRM
const CRMPage = lazy(() => import('./pages/CRMPage'));

// Time Tracking
const TimeTrackingPage = lazy(() => import('./pages/TimeTrackingPage'));

// Files
const FilesPage = lazy(() => import('./pages/FilesPage'));

// Client Portal
const ClientPortal = lazy(() => import('./pages/client/ClientPortal'));

// Loading component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-xl">D</span>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
    </div>
);

// Root layout with AuthProvider
function RootLayout() {
    return (
        <AuthProvider>
            <Suspense fallback={<PageLoader />}>
                <Outlet />
            </Suspense>
        </AuthProvider>
    );
}

// Router configuration
const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            // Guest routes (only when not logged in)
            {
                element: <GuestRoute />,
                children: [
                    { path: '/login', element: <Login /> },
                    { path: '/register', element: <Register /> },
                ],
            },

            // OAuth callback
            { path: '/auth/callback', element: <AuthCallback /> },

            // Protected routes (any authenticated user)
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '/', element: <Dashboard /> },
                    { path: '/dashboard', element: <Dashboard /> },
                    { path: '/chat', element: <ChatPage /> },
                    { path: '/crm', element: <CRMPage /> },
                    { path: '/time', element: <TimeTrackingPage /> },
                    { path: '/files', element: <FilesPage /> },
                ],
            },

            // Admin routes (Super Admin and Admin only)
            {
                path: '/admin',
                element: <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]} />,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: 'users', element: <UserManagement /> },
                    { path: 'settings', element: <SystemSettings /> },
                    { path: 'audit-logs', element: <AuditLogs /> },
                    { path: 'announcements', element: <Announcements /> },
                ],
            },

            // Employee routes
            {
                path: '/employee',
                element: <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE]} />,
                children: [
                    { index: true, element: <WorkCockpit /> },
                    { path: 'tasks', element: <WorkCockpit /> },
                ],
            },

            // Client routes
            {
                path: '/portal',
                element: <RoleRoute allowedRoles={[ROLES.CLIENT, ROLES.SUPER_ADMIN, ROLES.ADMIN]} />,
                children: [
                    { index: true, element: <ClientPortal /> },
                ],
            },

            // Super Admin only routes
            {
                path: '/super-admin',
                element: <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]} />,
                children: [
                    // Add super admin only routes here
                ],
            },

            // Error pages
            { path: '/unauthorized', element: <Unauthorized /> },
            {
                path: '*',
                element: (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
                        <h1 className="text-6xl font-bold mb-4">404</h1>
                        <p className="text-slate-400 mb-8">Page not found</p>
                        <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
                    </div>
                )
            },
        ],
    },
]);

export default router;
