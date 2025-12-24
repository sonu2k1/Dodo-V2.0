import { useState, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TimerWidget from '../../components/features/time/TimerWidget';
import ManualEntryForm from '../../components/features/time/ManualEntryForm';
import WeeklySummary from '../../components/features/time/WeeklySummary';
import TimeEntryList from '../../components/features/time/TimeEntryList';

// Sample tasks
const sampleTasks = [
    { id: 't1', title: 'Design landing page mockup', project: { id: 'p1', name: 'Website Redesign' } },
    { id: 't2', title: 'API integration for payments', project: { id: 'p2', name: 'E-commerce App' } },
    { id: 't3', title: 'Database schema design', project: { id: 'p2', name: 'E-commerce App' } },
    { id: 't4', title: 'Write unit tests', project: { id: 'p1', name: 'Website Redesign' } },
    { id: 't5', title: 'Code review', project: { id: 'p3', name: 'Internal Tools' } },
];

// Sample entries
const sampleEntries = [
    { id: 'e1', task_id: 't1', task: sampleTasks[0], description: 'Working on hero section', start_time: '2024-12-23T10:00:00', end_time: '2024-12-23T12:30:00', duration_seconds: 9000, is_manual: false },
    { id: 'e2', task_id: 't2', task: sampleTasks[1], description: 'Razorpay gateway setup', start_time: '2024-12-23T14:00:00', end_time: '2024-12-23T16:00:00', duration_seconds: 7200, is_manual: false },
    { id: 'e3', task_id: 't3', task: sampleTasks[2], description: '', start_time: '2024-12-22T09:00:00', end_time: '2024-12-22T11:30:00', duration_seconds: 9000, is_manual: true },
    { id: 'e4', task_id: 't1', task: sampleTasks[0], description: 'Responsive adjustments', start_time: '2024-12-22T14:00:00', end_time: '2024-12-22T17:00:00', duration_seconds: 10800, is_manual: false },
    { id: 'e5', task_id: 't5', task: sampleTasks[4], description: 'PR #234 review', start_time: '2024-12-21T10:00:00', end_time: '2024-12-21T11:00:00', duration_seconds: 3600, is_manual: false },
];

// Sample weekly data
const getWeeklyData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const byDay = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const hoursWorked = [6.5, 7.2, 8.0, 5.5, 7.8, 2.0, 0][i];
        byDay.push({
            date: d.toISOString().split('T')[0],
            totalSeconds: hoursWorked * 3600,
        });
    }

    return {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalSeconds: byDay.reduce((sum, d) => sum + d.totalSeconds, 0),
        totalHours: (byDay.reduce((sum, d) => sum + d.totalSeconds, 0) / 3600).toFixed(1),
        byDay,
        byProject: [
            { name: 'Website Redesign', totalSeconds: 15 * 3600, hours: '15.0' },
            { name: 'E-commerce App', totalSeconds: 12 * 3600, hours: '12.0' },
            { name: 'Internal Tools', totalSeconds: 10 * 3600, hours: '10.0' },
        ],
        entryCount: 24,
    };
};

export default function TimeTrackingPage() {
    const [entries, setEntries] = useState(sampleEntries);
    const [runningTimer, setRunningTimer] = useState(null);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [weeklyData] = useState(getWeeklyData());
    const [selectedDate, setSelectedDate] = useState(null);

    // Today's stats
    const todayStats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = entries.filter(e => e.start_time.startsWith(today));
        const totalSeconds = todayEntries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
        return {
            hours: (totalSeconds / 3600).toFixed(1),
            entries: todayEntries.length,
        };
    }, [entries]);

    // Handle timer start
    const handleStartTimer = useCallback((taskId, description) => {
        const task = sampleTasks.find(t => t.id === taskId);
        const newEntry = {
            id: `timer-${Date.now()}`,
            task_id: taskId,
            task,
            description,
            start_time: new Date().toISOString(),
            is_running: true,
        };
        setRunningTimer(newEntry);
    }, []);

    // Handle timer stop
    const handleStopTimer = useCallback(() => {
        if (runningTimer) {
            const endTime = new Date();
            const startTime = new Date(runningTimer.start_time);
            const durationSeconds = Math.floor((endTime - startTime) / 1000);

            const completedEntry = {
                ...runningTimer,
                id: `e${Date.now()}`,
                end_time: endTime.toISOString(),
                duration_seconds: durationSeconds,
                is_running: false,
                is_manual: false,
            };

            setEntries(prev => [completedEntry, ...prev]);
            setRunningTimer(null);
        }
    }, [runningTimer]);

    // Handle manual entry
    const handleManualEntry = useCallback((data) => {
        const task = sampleTasks.find(t => t.id === data.taskId);
        const durationSeconds = (data.hours * 60 + data.minutes) * 60;
        const startTime = new Date(data.date);
        startTime.setHours(9, 0, 0, 0);

        const newEntry = {
            id: `me${Date.now()}`,
            task_id: data.taskId,
            task,
            description: data.description,
            start_time: startTime.toISOString(),
            end_time: new Date(startTime.getTime() + durationSeconds * 1000).toISOString(),
            duration_seconds: durationSeconds,
            is_manual: true,
        };

        setEntries(prev => [newEntry, ...prev]);
        setShowManualEntry(false);
    }, []);

    // Handle delete
    const handleDeleteEntry = useCallback((entryId) => {
        setEntries(prev => prev.filter(e => e.id !== entryId));
    }, []);

    // Filter entries by selected date
    const displayedEntries = useMemo(() => {
        if (selectedDate) {
            return entries.filter(e => e.start_time.startsWith(selectedDate));
        }
        return entries.slice(0, 10);
    }, [entries, selectedDate]);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                        Time Tracking <span className="text-emerald-400">⏱️</span>
                    </h1>
                    <p className="text-slate-400">Track your work hours with precision</p>
                </div>
                <button
                    onClick={() => setShowManualEntry(true)}
                    className="btn-secondary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Manual Entry
                </button>
            </div>

            {/* Today's stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Today', value: `${todayStats.hours}h`, icon: '📅', color: 'indigo' },
                    { label: 'Entries', value: todayStats.entries, icon: '📝', color: 'cyan' },
                    { label: 'This Week', value: `${weeklyData.totalHours}h`, icon: '📊', color: 'emerald' },
                    { label: 'Active', value: runningTimer ? '1' : '0', icon: '🔴', color: runningTimer ? 'red' : 'slate' },
                ].map((stat, idx) => (
                    <div key={idx} className="glass-card p-4 hover-lift">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{stat.icon}</span>
                            <span className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</span>
                        </div>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Timer + Weekly summary */}
                <div className="xl:col-span-1 space-y-6">
                    <TimerWidget
                        runningEntry={runningTimer}
                        onStart={handleStartTimer}
                        onStop={handleStopTimer}
                        tasks={sampleTasks}
                    />
                    <WeeklySummary
                        data={weeklyData}
                        onDayClick={(date) => setSelectedDate(date === selectedDate ? null : date)}
                    />
                </div>

                {/* Entry list */}
                <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">
                            {selectedDate
                                ? `Entries for ${new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}`
                                : 'Recent Entries'
                            }
                        </h2>
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                Show all
                            </button>
                        )}
                    </div>
                    <TimeEntryList
                        entries={displayedEntries}
                        onDelete={handleDeleteEntry}
                        groupByDate={!selectedDate}
                    />
                </div>
            </div>

            {/* Manual entry modal */}
            <ManualEntryForm
                isOpen={showManualEntry}
                onClose={() => setShowManualEntry(false)}
                onSubmit={handleManualEntry}
                tasks={sampleTasks}
            />
        </DashboardLayout>
    );
}
