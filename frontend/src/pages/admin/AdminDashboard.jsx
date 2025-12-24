import DashboardLayout from '../../components/layout/DashboardLayout';
import FinancialPulseWidget from '../../components/features/dashboard/FinancialPulseWidget';
import TeamLoadHeatmapWidget from '../../components/features/dashboard/TeamLoadHeatmapWidget';
import LeadVelocityWidget from '../../components/features/dashboard/LeadVelocityWidget';

// Quick stats data
const quickStats = [
    {
        label: 'Active Projects',
        value: '24',
        change: '+3',
        positive: true,
        color: 'indigo',
        icon: '📊'
    },
    {
        label: 'Team Members',
        value: '18',
        change: '+2',
        positive: true,
        color: 'cyan',
        icon: '👥'
    },
    {
        label: 'Open Tasks',
        value: '156',
        change: '-12',
        positive: true,
        color: 'amber',
        icon: '✅'
    },
    {
        label: 'Pending Approvals',
        value: '8',
        change: '+5',
        positive: false,
        color: 'rose',
        icon: '⏳'
    },
];

export default function AdminDashboard() {
    return (
        <DashboardLayout>
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    Welcome back, <span className="gradient-text">Super Admin</span>
                </h1>
                <p className="text-slate-400">
                    Here's what's happening with your organization today.
                </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickStats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="glass-card p-5 hover-lift animate-slide-up"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-2xl">{stat.icon}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.positive
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main widgets grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <FinancialPulseWidget />
                <LeadVelocityWidget />
            </div>

            {/* Team heatmap - full width */}
            <div className="mb-6">
                <TeamLoadHeatmapWidget />
            </div>

            {/* Recent activity and quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-panel p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { user: 'Alice', action: 'completed task', target: 'Homepage Redesign', time: '2 min ago', type: 'task' },
                            { user: 'Bob', action: 'created invoice', target: 'INV-2024-089', time: '15 min ago', type: 'invoice' },
                            { user: 'Carol', action: 'converted lead', target: 'TechCorp Ltd', time: '1 hour ago', type: 'lead' },
                            { user: 'David', action: 'logged time', target: '4.5 hours', time: '2 hours ago', type: 'time' },
                            { user: 'Emma', action: 'submitted for approval', target: 'Q4 Budget', time: '3 hours ago', type: 'approval' },
                        ].map((activity, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                    {activity.user.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white">
                                        <span className="font-medium">{activity.user}</span>
                                        <span className="text-slate-400"> {activity.action} </span>
                                        <span className="text-indigo-400">{activity.target}</span>
                                    </p>
                                    <p className="text-xs text-slate-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Create User', icon: '👤', path: '/admin/users/new' },
                            { label: 'New Announcement', icon: '📢', path: '/admin/announcements/new' },
                            { label: 'View Audit Logs', icon: '📋', path: '/admin/audit-logs' },
                            { label: 'System Settings', icon: '⚙️', path: '/admin/settings' },
                            { label: 'Generate Report', icon: '📊', path: '/admin/reports' },
                        ].map((action, idx) => (
                            <button
                                key={idx}
                                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 hover:border-indigo-500/30 transition-all group"
                            >
                                <span className="text-xl">{action.icon}</span>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                                    {action.label}
                                </span>
                                <svg className="w-4 h-4 ml-auto text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
