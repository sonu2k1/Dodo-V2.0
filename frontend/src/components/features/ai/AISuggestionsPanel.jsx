import { useState } from 'react';

/**
 * AI Suggestions Panel - Human-in-the-loop approval component
 */
export default function AISuggestionsPanel({
    suggestions = [],
    onApprove,
    onReject,
    onApplySubtasks,
    isLoading = false,
}) {
    const [selectedItems, setSelectedItems] = useState({});
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);

    const handleToggleItem = (suggestionId, itemIndex) => {
        setSelectedItems(prev => {
            const key = `${suggestionId}-${itemIndex}`;
            return { ...prev, [key]: !prev[key] };
        });
    };

    const getSelectedForSuggestion = (suggestionId, items) => {
        return items.filter((_, idx) => selectedItems[`${suggestionId}-${idx}`]);
    };

    const handleApprove = (suggestion) => {
        if (suggestion.type === 'subtasks') {
            const selected = getSelectedForSuggestion(
                suggestion.id,
                suggestion.suggestion_data.suggestions || []
            );
            onApplySubtasks?.(suggestion.id, selected.length > 0 ? selected : null);
        } else {
            onApprove?.(suggestion.id);
        }
    };

    const handleReject = () => {
        if (showRejectModal) {
            onReject?.(showRejectModal, rejectReason);
            setShowRejectModal(null);
            setRejectReason('');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'subtasks': return '📋';
            case 'summary': return '💬';
            case 'email_summary': return '📧';
            default: return '🤖';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'subtasks': return 'Sub-task Suggestions';
            case 'summary': return 'Chat Summary';
            case 'email_summary': return 'Email Summary';
            default: return 'AI Suggestion';
        }
    };

    if (suggestions.length === 0) {
        return (
            <div className="glass-panel p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                </div>
                <p className="text-slate-400">No pending AI suggestions</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {suggestions.map(suggestion => (
                <div key={suggestion.id} className="glass-card p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                            <div>
                                <h3 className="text-white font-semibold">{getTypeLabel(suggestion.type)}</h3>
                                <p className="text-xs text-slate-500">
                                    Generated {new Date(suggestion.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg">
                            Pending Approval
                        </span>
                    </div>

                    {/* Content based on type */}
                    {suggestion.type === 'subtasks' && (
                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-slate-400 mb-3">Select sub-tasks to create:</p>
                            {(suggestion.suggestion_data.suggestions || []).map((subtask, idx) => (
                                <label
                                    key={idx}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems[`${suggestion.id}-${idx}`] || false}
                                        onChange={() => handleToggleItem(suggestion.id, idx)}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                        <p className="text-white text-sm">{subtask.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-1.5 py-0.5 text-xs rounded ${subtask.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                    subtask.priority === 'low' ? 'bg-slate-500/20 text-slate-400' :
                                                        'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {subtask.priority}
                                            </span>
                                            {subtask.estimate_hours && (
                                                <span className="text-xs text-slate-500">~{subtask.estimate_hours}h</span>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {(suggestion.type === 'summary' || suggestion.type === 'email_summary') && (
                        <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                {suggestion.suggestion_data.summary}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-3 border-t border-slate-700/50">
                        <button
                            onClick={() => handleApprove(suggestion)}
                            disabled={isLoading}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <span>✓</span>
                            {suggestion.type === 'subtasks' ? 'Create Selected' : 'Approve'}
                        </button>
                        <button
                            onClick={() => setShowRejectModal(suggestion.id)}
                            disabled={isLoading}
                            className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <span>✕</span> Dismiss
                        </button>
                    </div>
                </div>
            ))}

            {/* Reject modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-sm animate-slide-up">
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-4">Dismiss Suggestion?</h3>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason (optional)"
                                rows={2}
                                className="input-field mb-4 resize-none"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowRejectModal(null)} className="flex-1 btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleReject} className="flex-1 btn-primary">
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
