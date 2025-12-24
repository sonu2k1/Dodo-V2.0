import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api/auth';

/**
 * Auth Context - manages authentication state and provides auth methods
 */
const AuthContext = createContext(null);

// Inactivity timeout (24 hours)
const INACTIVITY_TIMEOUT = parseInt(import.meta.env.VITE_INACTIVITY_TIMEOUT_MS) || 86400000;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Check and load user from stored token
     */
    const loadUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await authApi.getProfile();
            setUser(response.data);
            setPermissions(response.data.permissions || []);
        } catch (error) {
            console.error('Failed to load user:', error);
            localStorage.removeItem('accessToken');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Login with email/password
     */
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await authApi.login({ email, password });
            const { user: userData, accessToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            setUser(userData);
            setPermissions(userData.permissions || []);
            setLastActivity(Date.now());

            return response;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Register new user
     */
    const register = async (email, password, fullName) => {
        setIsLoading(true);
        try {
            const response = await authApi.register({ email, password, full_name: fullName });
            const { user: userData, accessToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            setUser(userData);
            setPermissions(userData.permissions || []);
            setLastActivity(Date.now());

            return response;
        } finally {
            setIsLoading(false);
        }
    };


    /**
     * Login with Google OAuth
     */
    const loginWithGoogle = () => {
        window.location.href = authApi.getGoogleAuthUrl();
    };

    /**
     * Handle OAuth callback
     */
    const handleOAuthCallback = useCallback(async (accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        await loadUser();
    }, [loadUser]);

    /**
     * Logout
     */
    const logout = async (logoutAll = false) => {
        try {
            if (logoutAll) {
                await authApi.logoutAll();
            } else {
                await authApi.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            setUser(null);
            setPermissions([]);
        }
    };

    /**
     * Update last activity timestamp
     */
    const updateActivity = useCallback(() => {
        setLastActivity(Date.now());
    }, []);

    /**
     * Check if user has specific role
     */
    const hasRole = useCallback((role) => {
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    }, [user]);

    /**
     * Check if user has specific permission
     */
    const hasPermission = useCallback((permission) => {
        if (!permissions.length) return false;
        if (Array.isArray(permission)) {
            return permission.some(p => permissions.includes(p));
        }
        return permissions.includes(permission);
    }, [permissions]);

    /**
     * Check if user has all specified permissions
     */
    const hasAllPermissions = useCallback((requiredPermissions) => {
        if (!permissions.length) return false;
        return requiredPermissions.every(p => permissions.includes(p));
    }, [permissions]);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Track user activity for inactivity timeout
    useEffect(() => {
        if (!user) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            updateActivity();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [user, updateActivity]);

    // Check for inactivity timeout
    useEffect(() => {
        if (!user) return;

        const checkInactivity = () => {
            const now = Date.now();
            if (now - lastActivity > INACTIVITY_TIMEOUT) {
                console.log('Session expired due to inactivity');
                logout();
            }
        };

        const interval = setInterval(checkInactivity, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [user, lastActivity]);

    const value = {
        user,
        permissions,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        handleOAuthCallback,
        logout,
        hasRole,
        hasPermission,
        hasAllPermissions,
        updateActivity,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to access auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
