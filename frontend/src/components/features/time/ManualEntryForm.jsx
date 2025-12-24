import { useState } from 'react';

export default function ManualEntryForm({
    isOpen,
    onClose,
    onSubmit,
    tasks = [],
    isLoading = false,
}) {
    const [formData, setFormData] = useState({
        taskId: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        minutes: '0',
        description: '',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({
            ...formData,
            hours: parseFloat(formData.hours) || 0,
            minutes: parseInt(formData.minutes) || 0,
        });
        // Reset form
        setFormData({
            taskId: '',
            date: new Date().toISOString().split('T')[0],
            hours: '',
            minutes: '0',
            description: '',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Add Time Entry</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Task */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Task *</label>
                        <select
                            value={formData.taskId}
                            onChange={(e) => handleChange('taskId', e.target.value)}
                            required
                            className="input-field"
                        >
                            <option value="">Select task...</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.project?.name ? `[${task.project.name}] ` : ''}{task.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Date *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            required
                            max={new Date().toISOString().split('T')[0]}
                            className="input-field"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Duration *</label>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        value={formData.hours}
                                        onChange={(e) => handleChange('hours', e.target.value)}
                                        required
                                        className="input-field pr-12"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">hrs</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <select
                                    value={formData.minutes}
                                    onChange={(e) => handleChange('minutes', e.target.value)}
                                    className="input-field"
                                >
                                    <option value="0">0 min</option>
                                    <option value="15">15 min</option>
                                    <option value="30">30 min</option>
                                    <option value="45">45 min</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={2}
                            className="input-field resize-none"
                            placeholder="What did you work on?"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-3">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 btn-primary" disabled={isLoading || !formData.taskId || !formData.hours}>
                            {isLoading ? 'Saving...' : 'Add Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
