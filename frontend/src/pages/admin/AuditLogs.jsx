import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

// Sample audit logs data
const auditLogs = [
    { id: 1, user: 'Alice Johnson', action: 'CREATE', entity: 'User', entityId: 'usr_123', details: 'Created user: Bob Smith', ip: '192.168.1.100', timestamp: '2024-12-23T10:30:00' },
    { id: 2, user: 'Bob Smith', action: 'UPDATE', entity: 'Project', entityId: 'prj_456', details: 'Updated project budget: ₹5,00,000 → ₹7,50,000', ip: '192.168.1.101', timestamp: '2024-12-23T09:45:00' },
    { id: 3, user: 'Carol Williams', action: 'DELETE', entity: 'Task', entityId: 'tsk_789', details: 'Deleted task: Old homepage design', ip: '192.168.1.102', timestamp: '2024-12-23T09:15:00' },
    { id: 4, user: 'David Brown', action: 'LOGIN', entity: 'Auth', entityId: null, details: 'Successful login via Google OAuth', ip: '203.192.45.67', timestamp: '2024-12-23T08:30:00' },
    { id: 5, user: 'Alice Johnson', action: 'UPDATE', entity: 'User', entityId: 'usr_456', details: 'Changed role: employee → admin', ip: '192.168.1.100', timestamp: '2024-12-22T17:20:00' },
    { id: 6, user: 'Emma Davis', action: 'CREATE', entity: 'Invoice', entityId: 'inv_012', details: 'Created invoice INV-2024-089 for ₹1,25,000', ip: '192.168.1.103', timestamp: '2024-12-22T16:45:00' },
    { id: 7, user: 'Frank Miller', action: 'APPROVE', entity: 'Approval', entityId: 'apr_345', details: 'Approved Q4 Marketing Budget', ip: '192.168.1.104', timestamp: '2024-12-22T15:30:00' },
    { id: 8, user: 'Grace Wilson', action: 'UPDATE', entity: 'Lead', entityId: 'led_678', details: 'Status changed: qualified → proposal', ip: '192.168.1.105', timestamp: '2024-12-22T14:15:00' },
];

const actionColors = {
    CREATE: 'bg-emerald-500/20 text-emerald-400',
    UPDATE: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
    LOGIN: 'bg-blue-500/20 text-blue-400',
    LOGOUT: 'bg-slate-500/20 text-slate-400',
    APPROVE: 'bg-purple-500/20 text-purple-400',
    REJECT: 'bg-rose-500/20 text-rose-400',
};

const entities = ['All', 'User', 'Project', 'Task', 'Invoice', 'Lead', 'Auth', 'Approval'];
const actions = ['All', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'APPROVE'];

export default function AuditLogs() {
    const [filterEntity, setFilterEntity] = useState('All');
    const [filterAction, setFilterAction] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    const filteredLogs = auditLogs.filter(log => {
        const matchesEntity = filterEntity === 'All' || log.entity === filterEntity;
        const matchesAction = filterAction === 'All' || log.action === filterAction;
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesEntity && matchesAction && matchesSearch;
    });

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
                <p className="text-slate-400">Track all system activities and changes</p>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                    />
                    <select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                        className="input-field"
                    >
                        {entities.map(e => (
                            <option key={e} value={e}>{e === 'All' ? 'All Entities' : e}</option>
                        ))}
                    </select>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="input-field"
                    >
                        {actions.map(a => (
                            <option key={a} value={a}>{a === 'All' ? 'All Actions' : a}</option>
                        ))}
                    </select>
                    <button className="btn-secondary flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Logs', value: auditLogs.length, color: 'indigo' },
                    { label: 'Creates', value: auditLogs.filter(l => l.action === 'CREATE').length, color: 'emerald' },
                    { label: 'Updates', value: auditLogs.filter(l => l.action === 'UPDATE').length, color: 'amber' },
                    { label: 'Deletes', value: auditLogs.filter(l => l.action === 'DELETE').length, color: 'red' },
                ].map((stat, idx) => (
                    <div key={idx} className={`glass-card p-4 text-center border-l-4 border-${stat.color}-500`}>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Logs Timeline */}
            <div className="glass-panel p-6">
                <div className="space-y-4">
                    {filteredLogs.map((log, idx) => (
                        <div
                            key={log.id}
                            className="flex gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-700/30 transition-colors cursor-pointer group"
                            onClick={() => setSelectedLog(log)}
                        >
                            {/* Timeline dot */}
                            <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full ${log.action === 'CREATE' ? 'bg-emerald-500' :
                                        log.action === 'DELETE' ? 'bg-red-500' :
                                            log.action === 'UPDATE' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                                {idx < filteredLogs.length - 1 && (
                                    <div className="w-px h-full bg-slate-700 mt-2" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`badge ${actionColors[log.action]}`}>
                                                {log.action}
                                            </span>
                                            <span className="badge bg-slate-700 text-slate-300">
                                                {log.entity}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium truncate">{log.details}</p>
                                        <p className="text-sm text-slate-400">
                                            by <span className="text-indigo-400">{log.user}</span>
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm text-slate-400">{formatTime(log.timestamp)}</p>
                                        <p className="text-xs text-slate-500">{log.ip}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Expand icon */}
                            <div className="hidden group-hover:flex items-center text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
                    <div className="glass-panel w-full max-w-lg p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Log Details</h2>
                            <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <span className={`badge ${actionColors[selectedLog.action]}`}>{selectedLog.action}</span>
                                <span className="badge bg-slate-700 text-slate-300">{selectedLog.entity}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">User</p>
                                    <p className="text-white">{selectedLog.user}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                                    <p className="text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">IP Address</p>
                                    <p className="text-white font-mono text-sm">{selectedLog.ip}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Entity ID</p>
                                    <p className="text-white font-mono text-sm">{selectedLog.entityId || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 mb-1">Details</p>
                                <p className="text-white p-3 bg-slate-800/50 rounded-lg">{selectedLog.details}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
