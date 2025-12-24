import { useState, useEffect } from 'react';

const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-slate-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
];

// Sample projects and users for assignment
const projects = [
    { id: 1, name: 'Website Redesign' },
    { id: 2, name: 'E-commerce App' },
    { id: 3, name: 'Internal Tools' },
];

const teamMembers = [
    { id: 1, name: 'You (Assign to self)' },
    { id: 2, name: 'Alice Johnson' },
    { id: 3, name: 'Bob Smith' },
    { id: 4, name: 'Carol Williams' },
];

const availableTasks = [
    { id: 1, title: 'Setup database', project: 'E-commerce App' },
    { id: 2, title: 'Design mockup', project: 'Website Redesign' },
    { id: 3, title: 'API development', project: 'E-commerce App' },
];

export default function TaskCreateModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    editTask = null
}) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_id: '',
        priority: 'medium',
        status: 'todo',
        due_date: '',
        estimated_hours: '',
        assigned_to: '1',
        dependencies: [],
    });

    const [showDependencyPicker, setShowDependencyPicker] = useState(false);

    useEffect(() => {
        if (editTask) {
            setFormData({
                title: editTask.title || '',
                description: editTask.description || '',
                project_id: editTask.project_id || '',
                priority: editTask.priority || 'medium',
                status: editTask.status || 'todo',
                due_date: editTask.due_date || '',
                estimated_hours: editTask.estimated_hours || '',
                assigned_to: editTask.assigned_to?.id || '1',
                dependencies: editTask.dependencies || [],
            });
        } else {
            // Reset form for new task
            setFormData({
                title: '',
                description: '',
                project_id: '',
                priority: 'medium',
                status: 'todo',
                due_date: '',
                estimated_hours: '',
                assigned_to: '1',
                dependencies: [],
            });
        }
    }, [editTask, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDependency = (taskId) => {
        const deps = formData.dependencies.includes(taskId)
            ? formData.dependencies.filter(d => d !== taskId)
            : [...formData.dependencies, taskId];
        handleChange('dependencies', deps);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        {editTask ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Task Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                            className="input-field"
                            placeholder="Enter task title..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Add detailed description..."
                        />
                    </div>

                    {/* Project & Assignment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Project *</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => handleChange('project_id', e.target.value)}
                                required
                                className="input-field"
                            >
                                <option value="">Select project...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Assign To</label>
                            <select
                                value={formData.assigned_to}
                                onChange={(e) => handleChange('assigned_to', e.target.value)}
                                className="input-field"
                            >
                                {teamMembers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Priority</label>
                            <div className="flex gap-2">
                                {priorityOptions.map(p => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => handleChange('priority', p.value)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.priority === p.value
                                                ? `${p.color} text-white`
                                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="input-field"
                            >
                                {statusOptions.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Due Date & Estimated Hours */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => handleChange('due_date', e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Estimated Hours</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={formData.estimated_hours}
                                onChange={(e) => handleChange('estimated_hours', e.target.value)}
                                className="input-field"
                                placeholder="e.g., 8"
                            />
                        </div>
                    </div>

                    {/* Dependencies */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-slate-400">Task Dependencies</label>
                            <button
                                type="button"
                                onClick={() => setShowDependencyPicker(!showDependencyPicker)}
                                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                {showDependencyPicker ? 'Hide' : 'Add dependency'}
                            </button>
                        </div>

                        {/* Selected dependencies */}
                        {formData.dependencies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.dependencies.map(depId => {
                                    const task = availableTasks.find(t => t.id === depId);
                                    return task ? (
                                        <span
                                            key={depId}
                                            className="badge bg-cyan-500/20 text-cyan-400 flex items-center gap-1"
                                        >
                                            🔗 {task.title}
                                            <button
                                                type="button"
                                                onClick={() => toggleDependency(depId)}
                                                className="ml-1 hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}

                        {/* Dependency picker */}
                        {showDependencyPicker && (
                            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2 animate-slide-up">
                                <p className="text-xs text-slate-500 mb-2">This task will be blocked until these tasks are completed:</p>
                                {availableTasks.map(task => (
                                    <label
                                        key={task.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.dependencies.includes(task.id)}
                                            onChange={() => toggleDependency(task.id)}
                                            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <div>
                                            <span className="text-sm text-white">{task.title}</span>
                                            <span className="text-xs text-slate-500 ml-2">({task.project})</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                editTask ? 'Save Changes' : 'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
