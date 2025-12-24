import { useMemo } from 'react';

// Sample activity data - will be replaced by real-time updates
const sampleActivity = [
    {
        id: 1,
        type: 'task_completed',
        message: 'You completed "Setup CI/CD pipeline"',
        project: 'Internal Tools',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        id: 2,
        type: 'comment',
        message: 'Alice commented on "API integration for payments"',
        project: 'E-commerce App',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 3,
        type: 'task_assigned',
        message: 'Bob assigned you "Code review for PR #234"',
        project: 'Internal Tools',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
        id: 4,
        type: 'status_change',
        message: 'You moved "Database schema design" to In Review',
        project: 'E-commerce App',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: 5,
        type: 'approval',
        message: 'Carol approved your design mockup',
        project: 'Website Redesign',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
        id: 6,
        type: 'time_logged',
        message: 'You logged 4 hours on "Design landing page mockup"',
        project: 'Website Redesign',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
];

const activityIcons = {
    task_completed: { icon: '✅', color: 'bg-emerald-500/20 text-emerald-400' },
    task_assigned: { icon: '📋', color: 'bg-cyan-500/20 text-cyan-400' },
    comment: { icon: '💬', color: 'bg-blue-500/20 text-blue-400' },
    status_change: { icon: '🔄', color: 'bg-amber-500/20 text-amber-400' },
    approval: { icon: '👍', color: 'bg-purple-500/20 text-purple-400' },
    time_logged: { icon: '⏱️', color: 'bg-indigo-500/20 text-indigo-400' },
};

export default function RecentActivityFeed({ activities = sampleActivity, maxItems = 6 }) {
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const displayedActivities = useMemo(() => {
        return activities.slice(0, maxItems);
    }, [activities, maxItems]);

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📡</span>
                    Recent Activity
                </h3>
                <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    View all
                </button>
            </div>

            <div className="space-y-3">
                {displayedActivities.map((activity, idx) => {
                    const config = activityIcons[activity.type] || activityIcons.comment;

                    return (
                        <div
                            key={activity.id}
                            className="flex gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer group animate-slide-up"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                                <span className="text-lg">{config.icon}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                    {activity.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500">{activity.project}</span>
                                    <span className="text-xs text-slate-600">•</span>
                                    <span className="text-xs text-slate-500">{formatTimeAgo(activity.timestamp)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activities.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                    No recent activity
                </div>
            )}
        </div>
    );
}
