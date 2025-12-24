import { useMemo } from 'react';

const statusConfig = {
    new: { label: 'New', color: 'bg-slate-500/20 text-slate-400' },
    contacted: { label: 'Contacted', color: 'bg-blue-500/20 text-blue-400' },
    qualified: { label: 'Qualified', color: 'bg-cyan-500/20 text-cyan-400' },
    proposal: { label: 'Proposal', color: 'bg-amber-500/20 text-amber-400' },
    negotiation: { label: 'Negotiation', color: 'bg-purple-500/20 text-purple-400' },
    won: { label: 'Won', color: 'bg-emerald-500/20 text-emerald-400' },
    lost: { label: 'Lost', color: 'bg-red-500/20 text-red-400' },
};

const sourceIcons = {
    website: '🌐',
    referral: '👥',
    social: '📱',
    cold_call: '📞',
    email: '✉️',
    event: '🎪',
    other: '📌',
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function LeadList({
    leads = [],
    onLeadClick,
    onStatusChange,
    onAssign,
    selectedLeads = [],
    onSelectLead,
    sortBy = 'created_at',
    sortOrder = 'desc',
    onSort,
}) {
    // Sort leads
    const sortedLeads = useMemo(() => {
        return [...leads].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'estimated_value') {
                aVal = aVal || 0;
                bVal = bVal || 0;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });
    }, [leads, sortBy, sortOrder]);

    const SortHeader = ({ field, children }) => (
        <th
            className="text-left text-sm font-medium text-slate-400 p-4 cursor-pointer hover:text-white transition-colors"
            onClick={() => onSort?.(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                {sortBy === field && (
                    <svg
                        className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </div>
        </th>
    );

    return (
        <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-700/50">
                            <th className="w-10 p-4">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                                    onChange={() => { }}
                                />
                            </th>
                            <SortHeader field="company_name">Company</SortHeader>
                            <SortHeader field="contact_name">Contact</SortHeader>
                            <SortHeader field="source">Source</SortHeader>
                            <SortHeader field="status">Status</SortHeader>
                            <SortHeader field="estimated_value">Value</SortHeader>
                            <th className="text-left text-sm font-medium text-slate-400 p-4">Assigned</th>
                            <SortHeader field="created_at">Created</SortHeader>
                            <th className="text-right text-sm font-medium text-slate-400 p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLeads.map((lead) => (
                            <tr
                                key={lead.id}
                                className="table-row cursor-pointer"
                                onClick={() => onLeadClick?.(lead)}
                            >
                                <td className="p-4" onClick={e => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedLeads.includes(lead.id)}
                                        onChange={() => onSelectLead?.(lead.id)}
                                        className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                                    />
                                </td>
                                <td className="p-4">
                                    <div>
                                        <p className="text-white font-medium">{lead.company_name}</p>
                                        <p className="text-xs text-slate-500">{lead.email}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300">{lead.contact_name}</td>
                                <td className="p-4">
                                    <span className="flex items-center gap-1">
                                        <span>{sourceIcons[lead.source] || '📌'}</span>
                                        <span className="text-slate-400 text-sm capitalize">
                                            {lead.source?.replace('_', ' ')}
                                        </span>
                                    </span>
                                </td>
                                <td className="p-4" onClick={e => e.stopPropagation()}>
                                    <select
                                        value={lead.status}
                                        onChange={(e) => onStatusChange?.(lead.id, e.target.value)}
                                        className={`text-xs px-2 py-1 rounded-lg border-0 cursor-pointer ${statusConfig[lead.status]?.color}`}
                                    >
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4">
                                    <span className="text-emerald-400 font-medium">
                                        {formatCurrency(lead.estimated_value || 0)}
                                    </span>
                                </td>
                                <td className="p-4" onClick={e => e.stopPropagation()}>
                                    {lead.assigned_user ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">
                                                {lead.assigned_user.full_name?.charAt(0)}
                                            </div>
                                            <span className="text-sm text-slate-300">{lead.assigned_user.full_name}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onAssign?.(lead)}
                                            className="text-xs text-indigo-400 hover:text-indigo-300"
                                        >
                                            + Assign
                                        </button>
                                    )}
                                </td>
                                <td className="p-4 text-slate-400 text-sm">
                                    {formatDate(lead.created_at)}
                                </td>
                                <td className="p-4" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                            title="View details"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                            title="Mark as Won"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {leads.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No leads found
                </div>
            )}
        </div>
    );
}
