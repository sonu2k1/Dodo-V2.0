import { useState, useMemo } from 'react';

const statusColumns = [
    { id: 'new', title: 'New', color: 'slate', icon: '🆕' },
    { id: 'contacted', title: 'Contacted', color: 'blue', icon: '📞' },
    { id: 'qualified', title: 'Qualified', color: 'cyan', icon: '✓' },
    { id: 'proposal', title: 'Proposal', color: 'amber', icon: '📋' },
    { id: 'negotiation', title: 'Negotiation', color: 'purple', icon: '🤝' },
];

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

export default function LeadKanban({
    leads = [],
    onStatusChange,
    onLeadClick,
    isLoading = false
}) {
    const [draggedLead, setDraggedLead] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Group leads by status
    const leadsByStatus = useMemo(() => {
        const grouped = {};
        statusColumns.forEach(col => {
            grouped[col.id] = leads.filter(lead => lead.status === col.id);
        });
        return grouped;
    }, [leads]);

    // Calculate column totals
    const columnTotals = useMemo(() => {
        const totals = {};
        statusColumns.forEach(col => {
            const colLeads = leadsByStatus[col.id] || [];
            totals[col.id] = {
                count: colLeads.length,
                value: colLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0),
            };
        });
        return totals;
    }, [leadsByStatus]);

    const handleDragStart = (e, lead) => {
        setDraggedLead(lead);
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('opacity-50');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        setDraggedLead(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    };

    const handleDrop = (e, columnId) => {
        e.preventDefault();
        if (draggedLead && draggedLead.status !== columnId) {
            onStatusChange?.(draggedLead.id, columnId);
        }
        setDragOverColumn(null);
    };

    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {statusColumns.map(col => (
                    <div key={col.id} className="flex-shrink-0 w-72">
                        <div className="glass-card p-4 animate-pulse">
                            <div className="h-6 bg-slate-700 rounded w-24 mb-4"></div>
                            {[1, 2].map(i => (
                                <div key={i} className="h-32 bg-slate-700/50 rounded-xl mb-3"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {statusColumns.map(column => (
                <div
                    key={column.id}
                    className={`flex-shrink-0 w-72 glass-card p-4 transition-all duration-200 ${dragOverColumn === column.id ? 'ring-2 ring-indigo-500/50 bg-indigo-500/5' : ''
                        }`}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{column.icon}</span>
                            <h3 className="font-semibold text-white">{column.title}</h3>
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-slate-300">
                                {columnTotals[column.id].count}
                            </span>
                        </div>
                    </div>

                    {/* Column value */}
                    <div className="text-xs text-slate-500 mb-3">
                        {formatCurrency(columnTotals[column.id].value)}
                    </div>

                    {/* Leads */}
                    <div className="space-y-3 min-h-[200px]">
                        {(leadsByStatus[column.id] || []).map(lead => (
                            <div
                                key={lead.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, lead)}
                                onDragEnd={handleDragEnd}
                                onClick={() => onLeadClick?.(lead)}
                                className="glass-card p-4 cursor-pointer group hover:border-indigo-500/30 hover:shadow-lg transition-all"
                            >
                                {/* Company name */}
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                                        {lead.company_name}
                                    </h4>
                                    <span className="text-lg" title={lead.source}>
                                        {sourceIcons[lead.source] || '📌'}
                                    </span>
                                </div>

                                {/* Contact */}
                                <p className="text-sm text-slate-400 mb-2">{lead.contact_name}</p>

                                {/* Value */}
                                <div className="text-sm font-medium text-emerald-400 mb-3">
                                    {formatCurrency(lead.estimated_value || 0)}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                                    {/* Assigned user */}
                                    {lead.assigned_user ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">
                                                {lead.assigned_user.full_name?.charAt(0)}
                                            </div>
                                            <span className="text-xs text-slate-500 truncate max-w-[80px]">
                                                {lead.assigned_user.full_name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-600">Unassigned</span>
                                    )}

                                    {/* Days since created */}
                                    <span className="text-xs text-slate-500">
                                        {Math.floor((Date.now() - new Date(lead.created_at)) / (1000 * 60 * 60 * 24))}d ago
                                    </span>
                                </div>
                            </div>
                        ))}

                        {(leadsByStatus[column.id] || []).length === 0 && (
                            <div className="text-center py-8 text-slate-600 text-sm">
                                No leads
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Won/Lost columns (condensed) */}
            <div className="flex-shrink-0 w-48 space-y-4">
                {['won', 'lost'].map(status => {
                    const statusLeads = leads.filter(l => l.status === status);
                    const totalValue = statusLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

                    return (
                        <div
                            key={status}
                            className={`glass-card p-4 ${status === 'won' ? 'border-emerald-500/30' : 'border-red-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span>{status === 'won' ? '🏆' : '❌'}</span>
                                <h3 className="font-semibold text-white capitalize">{status}</h3>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
                                    {statusLeads.length}
                                </span>
                            </div>
                            <p className={`text-lg font-bold ${status === 'won' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(totalValue)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
