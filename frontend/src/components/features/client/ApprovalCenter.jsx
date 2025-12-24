import { useState } from 'react';

export default function ApprovalCenter({
    approvals = [],
    onApprove,
    onRequestChanges,
    isLoading = false,
}) {
    const [selectedApproval, setSelectedApproval] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const handleApprove = (approval) => {
        onApprove?.(approval.id);
    };

    const handleRequestChanges = (approval) => {
        setSelectedApproval(approval);
        setShowFeedbackModal(true);
    };

    const submitChangesRequest = () => {
        onRequestChanges?.(selectedApproval.id, feedback);
        setShowFeedbackModal(false);
        setFeedback('');
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-500/20 text-amber-400',
            approved: 'bg-emerald-500/20 text-emerald-400',
            changes_requested: 'bg-red-500/20 text-red-400',
        };
        const labels = {
            pending: 'Pending Review',
            approved: 'Approved',
            changes_requested: 'Changes Requested',
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[status] || 'bg-slate-700 text-slate-400'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const pendingApprovals = approvals.filter(a => a.status === 'pending');
    const resolvedApprovals = approvals.filter(a => a.status !== 'pending');

    return (
        <div className="space-y-6">
            {/* Pending approvals */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>📋</span> Pending Approvals
                    {pendingApprovals.length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-sm rounded-full">
                            {pendingApprovals.length}
                        </span>
                    )}
                </h3>

                {pendingApprovals.length === 0 ? (
                    <div className="glass-card p-6 text-center text-slate-400">
                        No pending approvals
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingApprovals.map(approval => (
                            <div key={approval.id} className="glass-card p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="text-white font-medium">{approval.title}</h4>
                                        <p className="text-sm text-slate-400 mt-1">{approval.description}</p>
                                        {approval.project && (
                                            <p className="text-xs text-slate-500 mt-2">
                                                Project: {approval.project.name}
                                            </p>
                                        )}
                                    </div>
                                    {getStatusBadge(approval.status)}
                                </div>

                                {/* Deliverable preview */}
                                {approval.deliverable_url && (
                                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg flex items-center gap-3">
                                        <span className="text-2xl">📎</span>
                                        <div className="flex-1">
                                            <p className="text-sm text-white">{approval.deliverable_name || 'Deliverable'}</p>
                                            <p className="text-xs text-slate-500">{approval.deliverable_type}</p>
                                        </div>
                                        <a
                                            href={approval.deliverable_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary py-2 px-3 text-sm"
                                        >
                                            View
                                        </a>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(approval)}
                                        disabled={isLoading}
                                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>✓</span> Approve
                                    </button>
                                    <button
                                        onClick={() => handleRequestChanges(approval)}
                                        disabled={isLoading}
                                        className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>↺</span> Request Changes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resolved approvals */}
            {resolvedApprovals.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>✓</span> History
                    </h3>
                    <div className="glass-panel">
                        {resolvedApprovals.map((approval, idx) => (
                            <div
                                key={approval.id}
                                className={`p-4 flex items-center justify-between ${idx > 0 ? 'border-t border-slate-700/50' : ''}`}
                            >
                                <div>
                                    <h4 className="text-white text-sm font-medium">{approval.title}</h4>
                                    <p className="text-xs text-slate-500">
                                        {approval.project?.name} • {new Date(approval.reviewed_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {getStatusBadge(approval.status)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Feedback modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md animate-slide-up">
                        <div className="px-6 py-4 border-b border-slate-700/50">
                            <h2 className="text-lg font-bold text-white">Request Changes</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">What changes are needed?</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={4}
                                    className="input-field resize-none"
                                    placeholder="Describe the changes you'd like to see..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFeedbackModal(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitChangesRequest}
                                    disabled={!feedback.trim()}
                                    className="flex-1 btn-primary"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
