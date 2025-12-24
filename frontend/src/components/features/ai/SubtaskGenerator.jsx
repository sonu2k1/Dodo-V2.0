import { useState } from 'react';

/**
 * Subtask Generator - AI-powered subtask suggestion with approval
 */
export default function SubtaskGenerator({
    taskId,
    taskTitle,
    onGenerateSuggestions,
    onApplySubtasks,
    suggestions = null,
    isLoading = false,
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedSubtasks, setSelectedSubtasks] = useState([]);

    const handleGenerate = () => {
        setIsExpanded(true);
        onGenerateSuggestions?.(taskId);
    };

    const handleToggle = (idx) => {
        setSelectedSubtasks(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const handleApply = () => {
        if (!suggestions) return;
        const subtasksToApply = selectedSubtasks.length > 0
            ? selectedSubtasks.map(idx => suggestions.suggestions[idx])
            : suggestions.suggestions;
        onApplySubtasks?.(suggestions.suggestionId, subtasksToApply);
        setIsExpanded(false);
        setSelectedSubtasks([]);
    };

    const handleSelectAll = () => {
        if (!suggestions) return;
        if (selectedSubtasks.length === suggestions.suggestions.length) {
            setSelectedSubtasks([]);
        } else {
            setSelectedSubtasks(suggestions.suggestions.map((_, idx) => idx));
        }
    };

    return (
        <div className="border border-slate-700/50 rounded-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => !suggestions && handleGenerate()}
                disabled={isLoading}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">🤖</span>
                    <div className="text-left">
                        <p className="text-white font-medium">AI Sub-task Suggestions</p>
                        <p className="text-xs text-slate-500">
                            {suggestions
                                ? `${suggestions.suggestions?.length || 0} suggestions ready`
                                : 'Click to generate'}
                        </p>
                    </div>
                </div>
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {/* Suggestions */}
            {isExpanded && suggestions?.suggestions && (
                <div className="border-t border-slate-700/50 p-4">
                    {/* Select all */}
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-slate-400">Select sub-tasks to add:</p>
                        <button
                            onClick={handleSelectAll}
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                            {selectedSubtasks.length === suggestions.suggestions.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    {/* Subtask list */}
                    <div className="space-y-2 mb-4">
                        {suggestions.suggestions.map((subtask, idx) => (
                            <label
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSubtasks.includes(idx)}
                                    onChange={() => handleToggle(idx)}
                                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-white">{subtask.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-1.5 py-0.5 text-xs rounded ${subtask.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                subtask.priority === 'low' ? 'bg-slate-500/20 text-slate-400' :
                                                    'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {subtask.priority}
                                        </span>
                                        {subtask.estimate_hours && (
                                            <span className="text-xs text-slate-500">Est: {subtask.estimate_hours}h</span>
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="flex-1 btn-secondary py-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={isLoading}
                            className="flex-1 btn-primary py-2"
                        >
                            Add {selectedSubtasks.length || suggestions.suggestions.length} Sub-task{(selectedSubtasks.length || suggestions.suggestions.length) > 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
