import { useMemo } from 'react';

// Format seconds to duration
const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

export default function TimeEntryList({
    entries = [],
    onEdit,
    onDelete,
    showDate = true,
    groupByDate = true,
}) {
    // Group entries by date
    const groupedEntries = useMemo(() => {
        if (!groupByDate) {
            return [{ date: null, entries }];
        }

        const groups = {};
        entries.forEach(entry => {
            const date = entry.start_time.split('T')[0];
            if (!groups[date]) {
                groups[date] = { date, entries: [], totalSeconds: 0 };
            }
            groups[date].entries.push(entry);
            groups[date].totalSeconds += entry.duration_seconds || 0;
        });

        return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
    }, [entries, groupByDate]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTimeRange = (start, end) => {
        const s = new Date(start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const e = end ? new Date(end).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'now';
        return `${s} - ${e}`;
    };

    if (entries.length === 0) {
        return (
            <div className="glass-panel p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <span className="text-3xl">⏱️</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No time entries yet</h3>
                <p className="text-sm text-slate-400">Start tracking time to see your entries here</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groupedEntries.map((group, groupIdx) => (
                <div key={group.date || groupIdx}>
                    {/* Date header */}
                    {showDate && group.date && (
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-slate-400">{formatDate(group.date)}</h3>
                            <span className="text-sm text-slate-500">{formatDuration(group.totalSeconds)}</span>
                        </div>
                    )}

                    {/* Entries */}
                    <div className="glass-panel overflow-hidden">
                        {group.entries.map((entry, idx) => (
                            <div
                                key={entry.id}
                                className={`flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors ${idx > 0 ? 'border-t border-slate-700/50' : ''
                                    }`}
                            >
                                {/* Color bar */}
                                <div className={`w-1 h-12 rounded-full ${entry.is_manual ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`} />

                                {/* Task info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-white truncate">
                                            {entry.task?.title || 'Unknown Task'}
                                        </h4>
                                        {entry.is_manual && (
                                            <span className="badge bg-amber-500/20 text-amber-400 text-xs">Manual</span>
                                        )}
                                    </div>
                                    {entry.task?.project && (
                                        <p className="text-xs text-slate-500">{entry.task.project.name}</p>
                                    )}
                                    {entry.description && (
                                        <p className="text-sm text-slate-400 mt-1 truncate">{entry.description}</p>
                                    )}
                                </div>

                                {/* Time info */}
                                <div className="text-right shrink-0">
                                    <p className="text-lg font-semibold text-white">
                                        {formatDuration(entry.duration_seconds)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {formatTimeRange(entry.start_time, entry.end_time)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => onEdit?.(entry)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete?.(entry.id)}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
