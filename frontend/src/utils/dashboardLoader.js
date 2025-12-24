/**
 * Dashboard data loader for optimized load times
 */

// Parallel data fetching for dashboard
export async function loadDashboardData(userId, role) {
    const promises = [];

    // Common data
    promises.push(
        fetchWithCache('/api/tasks/summary', 30000),
        fetchWithCache('/api/notifications/unread-count', 15000),
    );

    // Role-specific data
    if (['super_admin', 'admin', 'employee'].includes(role)) {
        promises.push(
            fetchWithCache('/api/time/summary/daily', 60000),
            fetchWithCache('/api/leads/stats', 60000),
        );
    }

    if (role === 'client') {
        promises.push(
            fetchWithCache('/api/client-portal/projects', 60000),
            fetchWithCache('/api/client-portal/approvals/pending', 30000),
        );
    }

    try {
        const results = await Promise.allSettled(promises);
        return results.map((r, i) => r.status === 'fulfilled' ? r.value : null);
    } catch (error) {
        console.error('Dashboard load error:', error);
        return [];
    }
}

// Simple fetch with cache
const cache = new Map();

async function fetchWithCache(url, ttl = 30000) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });

    if (!response.ok) throw new Error(`Fetch failed: ${url}`);

    const data = await response.json();
    cache.set(url, { data, timestamp: Date.now() });
    return data;
}

// Invalidate cache
export function invalidateDashboardCache() {
    cache.clear();
}

// Preload critical data
export function preloadDashboard(userId, role) {
    // Non-blocking preload
    loadDashboardData(userId, role).catch(() => { });
}
