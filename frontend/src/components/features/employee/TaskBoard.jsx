import { useState, useMemo } from 'react';

// Sample tasks data - will be replaced by API data
const sampleTasks = [
    {
        id: 1,
        title: 'Design landing page mockup',
        description: 'Create high-fidelity mockup for the new landing page',
        project: 'Website Redesign',
        priority: 'high',
        status: 'in_progress',
        due_date: '2024-12-25',
        estimated_hours: 8,
        actual_hours: 4,
        dependencies: [],
        assigned_to: { name: 'You' }
    },
    {
        id: 2,
        title: 'API integration for payments',
        description: 'Integrate Razorpay payment gateway',
        project: 'E-commerce App',
        priority: 'urgent',
        status: 'todo',
        due_date: '2024-12-24',
        estimated_hours: 16,
        actual_hours: 0,
        dependencies: [3],
        assigned_to: { name: 'You' }
    },
    {
        id: 3,
        title: 'Database schema design',
        description: 'Design PostgreSQL schema for user orders',
        project: 'E-commerce App',
        priority: 'high',
        status: 'in_review',
        due_date: '2024-12-23',
        estimated_hours: 4,
        actual_hours: 5,
        dependencies: [],
        assigned_to: { name: 'You' }
    },
    {
        id: 4,
        title: 'Write unit tests',
        description: 'Cover auth module with unit tests',
        project: 'Website Redesign',
        priority: 'medium',
        status: 'todo',
        due_date: '2024-12-28',
        estimated_hours: 6,
        actual_hours: 0,
        dependencies: [1],
        assigned_to: { name: 'You' }
    },
    {
        id: 5,
        title: 'Code review for PR #234',
        description: 'Review feature branch changes',
        project: 'Internal Tools',
        priority: 'low',
        status: 'todo',
        due_date: '2024-12-26',
        estimated_hours: 2,
        actual_hours: 0,
        dependencies: [],
        assigned_to: { name: 'You' }
    },
    {
        id: 6,
        title: 'Update documentation',
        description: 'Update API documentation for new endpoints',
        project: 'E-commerce App',
        priority: 'medium',
        status: 'in_progress',
        due_date: '2024-12-27',
        estimated_hours: 3,
        actual_hours: 1,
        dependencies: [2],
        assigned_to: { name: 'You' }
    },
];

const statusColumns = [
    { id: 'todo', title: 'To Do', color: 'slate', icon: '📋' },
    { id: 'in_progress', title: 'In Progress', color: 'cyan', icon: '🔄' },
    { id: 'in_review', title: 'In Review', color: 'amber', icon: '👀' },
];

const priorityConfig = {
    urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-500' },
    high: { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' },
    medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' },
    low: { label: 'Low', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
};

export default function TaskBoard({
    tasks = sampleTasks,
    onStatusChange,
    onTaskClick,
    isLoading = false
}) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Group tasks by status
    const tasksByStatus = useMemo(() => {
        const grouped = {};
        statusColumns.forEach(col => {
            grouped[col.id] = tasks.filter(task => task.status === col.id);
        });
        return grouped;
    }, [tasks]);

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('opacity-50');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    };

    const handleDrop = (e, columnId) => {
        e.preventDefault();
        if (draggedTask && draggedTask.status !== columnId) {
            onStatusChange?.({ taskId: draggedTask.id, status: columnId });
        }
        setDragOverColumn(null);
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDueDateStyle = (dueDate) => {
        const days = getDaysUntilDue(dueDate);
        if (days < 0) return 'text-red-400 bg-red-500/10';
        if (days === 0) return 'text-orange-400 bg-orange-500/10';
        if (days <= 2) return 'text-amber-400 bg-amber-500/10';
        return 'text-slate-400 bg-slate-700/50';
    };

    const getDueDateLabel = (dueDate) => {
        const days = getDaysUntilDue(dueDate);
        if (days < 0) return `${Math.abs(days)}d overdue`;
        if (days === 0) return 'Due today';
        if (days === 1) return 'Due tomorrow';
        return `${days}d left`;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statusColumns.map(col => (
                    <div key={col.id} className="glass-card p-4 animate-pulse">
                        <div className="h-6 bg-slate-700 rounded w-24 mb-4"></div>
                        {[1, 2].map(i => (
                            <div key={i} className="h-32 bg-slate-700/50 rounded-xl mb-3"></div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusColumns.map(column => (
                <div
                    key={column.id}
                    className={`glass-card p-4 transition-all duration-200 ${dragOverColumn === column.id ? 'ring-2 ring-cyan-500/50 bg-cyan-500/5' : ''
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
                                {tasksByStatus[column.id].length}
                            </span>
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-3 min-h-[200px]">
                        {tasksByStatus[column.id].map(task => (
                            <div
                                key={task.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragEnd={handleDragEnd}
                                onClick={() => onTaskClick?.(task)}
                                className={`
                  glass-card p-4 cursor-pointer group
                  hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5
                  transition-all duration-200
                  ${task._optimistic ? 'opacity-70' : ''}
                `}
                            >
                                {/* Priority badge */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`badge border ${priorityConfig[task.priority].color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority].dot} mr-1.5`}></span>
                                        {priorityConfig[task.priority].label}
                                    </span>
                                    {task.dependencies?.length > 0 && (
                                        <span className="text-xs text-slate-500" title="Has dependencies">
                                            🔗 {task.dependencies.length}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h4 className="text-white font-medium mb-1 group-hover:text-cyan-400 transition-colors">
                                    {task.title}
                                </h4>

                                {/* Project */}
                                <p className="text-sm text-slate-400 mb-3">{task.project}</p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                                    {/* Due date */}
                                    <span className={`text-xs px-2 py-1 rounded ${getDueDateStyle(task.due_date)}`}>
                                        {getDueDateLabel(task.due_date)}
                                    </span>

                                    {/* Progress */}
                                    {task.estimated_hours > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <span>{task.actual_hours}h</span>
                                            <span>/</span>
                                            <span>{task.estimated_hours}h</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Empty state */}
                        {tasksByStatus[column.id].length === 0 && (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No tasks here
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
