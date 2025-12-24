import { useState, useMemo, useCallback } from 'react';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import TaskBoard from '../../components/features/employee/TaskBoard';
import TaskFilters from '../../components/features/employee/TaskFilters';
import RecentActivityFeed from '../../components/features/employee/RecentActivityFeed';
import TaskCreateModal from '../../components/features/employee/TaskCreateModal';
// import { useMyTasks, useUpdateTaskStatus, useCreateTask } from '../../hooks/useTasks';

// Sample tasks for initial demo (will be replaced by API)
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
    },
    {
        id: 5,
        title: 'Code review for PR #234',
        project: 'Internal Tools',
        priority: 'low',
        status: 'todo',
        due_date: '2024-12-26',
        estimated_hours: 2,
        actual_hours: 0,
        dependencies: [],
    },
    {
        id: 6,
        title: 'Update API documentation',
        project: 'E-commerce App',
        priority: 'medium',
        status: 'in_progress',
        due_date: '2024-12-27',
        estimated_hours: 3,
        actual_hours: 1,
        dependencies: [2],
    },
];

// Quick stats calculation
const getQuickStats = (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    return {
        total: tasks.length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        dueToday: tasks.filter(t => t.due_date === today).length,
        overdue: tasks.filter(t => t.due_date < today && t.status !== 'completed').length,
        blocked: tasks.filter(t => t.dependencies?.length > 0).length,
    };
};

export default function WorkCockpit() {
    // State
    const [tasks, setTasks] = useState(sampleTasks);
    const [filters, setFilters] = useState({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // For real API integration:
    // const { data: tasksData, isLoading } = useMyTasks(filters);
    // const updateStatus = useUpdateTaskStatus();
    // const createTask = useCreateTask();

    const quickStats = useMemo(() => getQuickStats(tasks), [tasks]);

    // Filter tasks based on filters
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Search
            if (filters.search) {
                const search = filters.search.toLowerCase();
                if (!task.title.toLowerCase().includes(search) &&
                    !task.project?.toLowerCase().includes(search)) {
                    return false;
                }
            }

            // Priority
            if (filters.priority && filters.priority !== 'all') {
                if (task.priority !== filters.priority) return false;
            }

            // Deadline
            if (filters.deadline && filters.deadline !== 'all') {
                const today = new Date();
                const dueDate = new Date(task.due_date);
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                switch (filters.deadline) {
                    case 'overdue': if (diffDays >= 0) return false; break;
                    case 'today': if (diffDays !== 0) return false; break;
                    case 'week': if (diffDays < 0 || diffDays > 7) return false; break;
                    case 'later': if (diffDays <= 7) return false; break;
                }
            }

            // Dependencies
            if (filters.hasDependencies && (!task.dependencies || task.dependencies.length === 0)) {
                return false;
            }

            return true;
        });
    }, [tasks, filters]);

    // Handle status change (optimistic update)
    const handleStatusChange = useCallback(({ taskId, status }) => {
        // Optimistic update
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, status } : task
        ));

        // For real API:
        // updateStatus.mutate({ taskId, status });
    }, []);

    // Handle task creation
    const handleCreateTask = useCallback((taskData) => {
        const newTask = {
            ...taskData,
            id: Date.now(),
            actual_hours: 0,
            project: 'New Project', // Would come from project selection
        };

        // Optimistic update
        setTasks(prev => [...prev, newTask]);
        setShowCreateModal(false);

        // For real API:
        // createTask.mutate(taskData);
    }, []);

    // Handle task click
    const handleTaskClick = useCallback((task) => {
        setSelectedTask(task);
        setShowCreateModal(true);
    }, []);

    return (
        <EmployeeLayout>
            {/* Page header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                        Work Cockpit <span className="text-cyan-400">🚀</span>
                    </h1>
                    <p className="text-slate-400">
                        Your tasks and activities at a glance
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedTask(null);
                        setShowCreateModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Task
                </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total Tasks', value: quickStats.total, icon: '📋', color: 'cyan' },
                    { label: 'In Progress', value: quickStats.inProgress, icon: '🔄', color: 'blue' },
                    { label: 'Due Today', value: quickStats.dueToday, icon: '📅', color: 'amber' },
                    { label: 'Overdue', value: quickStats.overdue, icon: '⚠️', color: 'red' },
                    { label: 'Blocked', value: quickStats.blocked, icon: '🔗', color: 'purple' },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="glass-card p-4 hover-lift animate-slide-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{stat.icon}</span>
                            <span className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</span>
                        </div>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <TaskFilters
                filters={filters}
                onFilterChange={setFilters}
                onReset={() => setFilters({})}
                taskCounts={{ total: tasks.length, filtered: filteredTasks.length }}
            />

            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Task board - 3 columns */}
                <div className="xl:col-span-3">
                    <TaskBoard
                        tasks={filteredTasks}
                        onStatusChange={handleStatusChange}
                        onTaskClick={handleTaskClick}
                    />
                </div>

                {/* Activity feed - 1 column */}
                <div className="xl:col-span-1">
                    <RecentActivityFeed />
                </div>
            </div>

            {/* Create/Edit Modal */}
            <TaskCreateModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setSelectedTask(null);
                }}
                onSubmit={handleCreateTask}
                editTask={selectedTask}
            />
        </EmployeeLayout>
    );
}
