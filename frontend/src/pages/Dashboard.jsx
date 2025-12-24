import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    const quickStats = [
        { label: 'Tasks Due Today', value: '5', icon: '📋', color: 'indigo' },
        { label: 'Hours Logged', value: '6.5h', icon: '⏱️', color: 'emerald' },
        { label: 'Unread Messages', value: '12', icon: '💬', color: 'amber' },
        { label: 'Pending Approvals', value: '3', icon: '✅', color: 'purple' },
    ];

    return (
        <DashboardLayout>
            {/* Welcome header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-slate-400 mt-1">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickStats.map((stat, idx) => (
                    <div key={idx} className="glass-card p-4 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tasks section */}
                <div className="lg:col-span-2">
                    <div className="glass-panel">
                        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                            <h2 className="font-semibold text-white">Today's Tasks</h2>
                            <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
                        </div>
                        <div className="p-5 space-y-3">
                            {[
                                { title: 'Review website mockups', project: 'Client Portal', priority: 'high', time: '9:00 AM' },
                                { title: 'Team standup meeting', project: 'Internal', priority: 'medium', time: '10:00 AM' },
                                { title: 'Update invoice system', project: 'DoDo v2.0', priority: 'high', time: '2:00 PM' },
                                { title: 'Client presentation prep', project: 'ABC Corp', priority: 'medium', time: '4:00 PM' },
                            ].map((task, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{task.title}</p>
                                        <p className="text-xs text-slate-500">{task.project} • {task.time}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {task.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity feed */}
                <div className="glass-panel">
                    <div className="px-5 py-4 border-b border-slate-700/50">
                        <h2 className="font-semibold text-white">Recent Activity</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {[
                            { text: 'New lead created', time: '5 min ago', icon: '🎯' },
                            { text: 'Invoice #2024-003 paid', time: '1 hour ago', icon: '💰' },
                            { text: 'File uploaded to Drive', time: '2 hours ago', icon: '📁' },
                            { text: 'Task completed', time: '3 hours ago', icon: '✅' },
                        ].map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <span className="text-lg">{activity.icon}</span>
                                <div>
                                    <p className="text-sm text-white">{activity.text}</p>
                                    <p className="text-xs text-slate-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
