import { useState } from 'react';

const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: '🔴 Urgent' },
    { value: 'high', label: '🟠 High' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'low', label: '⚪ Low' },
];

const deadlineOptions = [
    { value: 'all', label: 'All Deadlines' },
    { value: 'overdue', label: '⚠️ Overdue' },
    { value: 'today', label: '📅 Due Today' },
    { value: 'week', label: '📆 This Week' },
    { value: 'later', label: '📋 Later' },
];

const projectOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'website-redesign', label: 'Website Redesign' },
    { value: 'e-commerce-app', label: 'E-commerce App' },
    { value: 'internal-tools', label: 'Internal Tools' },
];

export default function TaskFilters({
    filters = {},
    onFilterChange,
    onReset,
    taskCounts = { total: 0, filtered: 0 }
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (key, value) => {
        onFilterChange?.({ ...filters, [key]: value });
    };

    const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all');

    return (
        <div className="glass-card p-4 mb-6">
            {/* Main filter row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={filters.search || ''}
                            onChange={(e) => handleChange('search', e.target.value)}
                            className="input-field pl-10 py-2"
                        />
                    </div>
                </div>

                {/* Priority filter */}
                <select
                    value={filters.priority || 'all'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="input-field py-2 w-40"
                >
                    {priorityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                {/* Deadline filter */}
                <select
                    value={filters.deadline || 'all'}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    className="input-field py-2 w-40"
                >
                    {deadlineOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                {/* Toggle more filters */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="btn-ghost flex items-center gap-2 text-sm"
                >
                    <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    More filters
                </button>

                {/* Reset */}
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Expanded filters */}
            {isExpanded && (
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-700/50 animate-slide-up">
                    {/* Project filter */}
                    <select
                        value={filters.project || 'all'}
                        onChange={(e) => handleChange('project', e.target.value)}
                        className="input-field py-2 w-48"
                    >
                        {projectOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* Dependencies filter */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            checked={filters.hasDependencies || false}
                            onChange={(e) => handleChange('hasDependencies', e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500"
                        />
                        Has dependencies
                    </label>

                    {/* Blocked filter */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            checked={filters.isBlocked || false}
                            onChange={(e) => handleChange('isBlocked', e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500"
                        />
                        Blocked by dependencies
                    </label>
                </div>
            )}

            {/* Filter summary */}
            {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                        Showing <span className="text-cyan-400 font-medium">{taskCounts.filtered}</span> of{' '}
                        <span className="text-white">{taskCounts.total}</span> tasks
                    </span>
                    <div className="flex gap-2">
                        {Object.entries(filters).filter(([k, v]) => v && v !== 'all' && v !== false).map(([key, value]) => (
                            <span
                                key={key}
                                className="badge bg-cyan-500/20 text-cyan-400 flex items-center gap-1"
                            >
                                {typeof value === 'boolean' ? key.replace(/([A-Z])/g, ' $1').trim() : value}
                                <button
                                    onClick={() => handleChange(key, key === 'search' ? '' : 'all')}
                                    className="ml-1 hover:text-white"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
