import { useState } from 'react';

const priorityConfig = {
    low: { color: 'bg-slate-500/20 text-slate-400', label: 'Low' },
    medium: { color: 'bg-amber-500/20 text-amber-400', label: 'Medium' },
    high: { color: 'bg-red-500/20 text-red-400', label: 'High' },
    urgent: { color: 'bg-red-600/30 text-red-300', label: 'Urgent' },
};

const statusConfig = {
    open: { color: 'bg-indigo-500/20 text-indigo-400', label: 'Open' },
    in_progress: { color: 'bg-cyan-500/20 text-cyan-400', label: 'In Progress' },
    waiting: { color: 'bg-amber-500/20 text-amber-400', label: 'Waiting' },
    resolved: { color: 'bg-emerald-500/20 text-emerald-400', label: 'Resolved' },
    closed: { color: 'bg-slate-500/20 text-slate-400', label: 'Closed' },
};

const categoryIcons = {
    general: '💬',
    bug: '🐛',
    feature: '✨',
    billing: '💳',
    technical: '🔧',
};

export default function SupportTickets({
    tickets = [],
    selectedTicket = null,
    messages = [],
    onSelectTicket,
    onCreateTicket,
    onSendMessage,
    isLoading = false,
}) {
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium', category: 'general' });
    const [newMessage, setNewMessage] = useState('');

    const handleCreateTicket = () => {
        onCreateTicket?.(newTicket);
        setShowNewTicket(false);
        setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            onSendMessage?.(selectedTicket.id, newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Ticket list */}
            <div className="lg:col-span-1 glass-panel flex flex-col">
                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Support Tickets</h3>
                    <button
                        onClick={() => setShowNewTicket(true)}
                        className="btn-primary py-1.5 px-3 text-sm"
                    >
                        + New
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tickets.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">No tickets</div>
                    ) : tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => onSelectTicket?.(ticket)}
                            className={`p-4 border-b border-slate-700/30 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500' : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span>{categoryIcons[ticket.category] || '📋'}</span>
                                    <h4 className="text-white text-sm font-medium truncate">{ticket.subject}</h4>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-xs ${statusConfig[ticket.status]?.color}`}>
                                    {statusConfig[ticket.status]?.label}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-1.5 py-0.5 rounded text-xs ${priorityConfig[ticket.priority]?.color}`}>
                                    {priorityConfig[ticket.priority]?.label}
                                </span>
                                <span className="text-xs text-slate-600">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ticket detail / Chat */}
            <div className="lg:col-span-2 glass-panel flex flex-col">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700/50">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs ${statusConfig[selectedTicket.status]?.color}`}>
                                            {statusConfig[selectedTicket.status]?.label}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${priorityConfig[selectedTicket.priority]?.color}`}>
                                            {priorityConfig[selectedTicket.priority]?.label}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            #{selectedTicket.id.slice(0, 8)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mt-3">{selectedTicket.description}</p>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.user?.role === 'client' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-xl ${msg.user?.role === 'client'
                                            ? 'bg-indigo-600/20 border border-indigo-500/30'
                                            : 'bg-slate-800'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-white">{msg.user?.full_name}</span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message input */}
                        {selectedTicket.status !== 'closed' && (
                            <div className="p-4 border-t border-slate-700/50">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 input-field py-2"
                                    />
                                    <button onClick={handleSendMessage} className="btn-primary">
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        Select a ticket to view details
                    </div>
                )}
            </div>

            {/* New ticket modal */}
            {showNewTicket && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md animate-slide-up">
                        <div className="px-6 py-4 border-b border-slate-700/50">
                            <h2 className="text-lg font-bold text-white">New Support Request</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Subject *</label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="input-field"
                                    placeholder="Brief description of the issue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Category</label>
                                    <select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="general">General</option>
                                        <option value="technical">Technical</option>
                                        <option value="billing">Billing</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="bug">Bug Report</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Priority</label>
                                    <select
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Description *</label>
                                <textarea
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    rows={4}
                                    className="input-field resize-none"
                                    placeholder="Provide details about your issue..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowNewTicket(false)} className="flex-1 btn-secondary">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTicket}
                                    disabled={!newTicket.subject.trim() || !newTicket.description.trim()}
                                    className="flex-1 btn-primary"
                                >
                                    Create Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
