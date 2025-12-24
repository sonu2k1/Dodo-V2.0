import { useMemo } from 'react';

// Format seconds to readable duration
const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
        return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklySummary({ data, onDayClick }) {
    // Calculate max hours for chart scaling
    const maxHours = useMemo(() => {
        if (!data?.byDay) return 8;
        const max = Math.max(...data.byDay.map(d => d.totalSeconds / 3600));
        return Math.max(Math.ceil(max), 8);
    }, [data]);

    if (!data) {
        return (
            <div className="glass-panel p-6 text-center">
                <p className="text-slate-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Weekly Overview</h3>
                    <p className="text-sm text-slate-400">
                        {new Date(data.weekStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(data.weekEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{data.totalHours}h</p>
                    <p className="text-xs text-slate-500">{data.entryCount} entries</p>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-2 h-40 mb-4">
                {data.byDay?.map((day, idx) => {
                    const hours = day.totalSeconds / 3600;
                    const heightPercent = (hours / maxHours) * 100;
                    const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                    const dayOfWeek = new Date(day.date).getDay();

                    return (
                        <div
                            key={day.date}
                            className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                            onClick={() => onDayClick?.(day.date)}
                        >
                            {/* Bar */}
                            <div className="w-full flex flex-col items-center justify-end h-32">
                                {hours > 0 && (
                                    <span className="text-xs text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {hours.toFixed(1)}h
                                    </span>
                                )}
                                <div
                                    className={`w-full max-w-10 rounded-t-lg transition-all duration-300 ${isToday
                                            ? 'bg-gradient-to-t from-indigo-600 to-purple-500'
                                            : 'bg-gradient-to-t from-slate-700 to-slate-600 group-hover:from-indigo-600/50 group-hover:to-purple-500/50'
                                        }`}
                                    style={{ height: `${Math.max(heightPercent, hours > 0 ? 5 : 0)}%` }}
                                />
                            </div>

                            {/* Day label */}
                            <span className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {dayNames[dayOfWeek]}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Scale */}
            <div className="flex justify-between text-xs text-slate-600 mb-6 px-2">
                <span>0h</span>
                <span>{maxHours}h</span>
            </div>

            {/* Project breakdown */}
            {data.byProject && data.byProject.length > 0 && (
                <div className="pt-4 border-t border-slate-700/50">
                    <h4 className="text-sm font-medium text-slate-400 mb-3">By Project</h4>
                    <div className="space-y-2">
                        {data.byProject.map((project, idx) => {
                            const percent = (project.totalSeconds / data.totalSeconds) * 100;
                            const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'];

                            return (
                                <div key={idx}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-slate-300">{project.name}</span>
                                        <span className="text-slate-400">{project.hours}h</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
