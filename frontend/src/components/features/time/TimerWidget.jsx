import { useState, useEffect, useCallback, useRef } from 'react';

// Format seconds to HH:MM:SS
const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function TimerWidget({
    runningEntry = null,
    onStart,
    onStop,
    tasks = [],
    isLoading = false,
}) {
    const [elapsed, setElapsed] = useState(0);
    const [selectedTask, setSelectedTask] = useState('');
    const [description, setDescription] = useState('');
    const intervalRef = useRef(null);

    // Calculate elapsed time from running entry
    useEffect(() => {
        if (runningEntry) {
            const startTime = new Date(runningEntry.start_time).getTime();
            const calculateElapsed = () => {
                const now = Date.now();
                setElapsed(Math.floor((now - startTime) / 1000));
            };

            calculateElapsed();
            intervalRef.current = setInterval(calculateElapsed, 1000);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        } else {
            setElapsed(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [runningEntry]);

    const handleStart = useCallback(() => {
        if (selectedTask) {
            onStart?.(selectedTask, description);
            setDescription('');
        }
    }, [selectedTask, description, onStart]);

    const handleStop = useCallback(() => {
        onStop?.(runningEntry?.id);
    }, [runningEntry, onStop]);

    const isRunning = !!runningEntry;

    return (
        <div className="glass-panel p-6">
            {/* Timer display */}
            <div className="text-center mb-6">
                <div className={`text-5xl font-mono font-bold mb-2 ${isRunning ? 'text-emerald-400' : 'text-white'}`}>
                    {formatTime(elapsed)}
                </div>
                {isRunning && runningEntry?.task && (
                    <div className="text-slate-400 text-sm">
                        Working on: <span className="text-white">{runningEntry.task.title}</span>
                    </div>
                )}
            </div>

            {/* Task selection (when not running) */}
            {!isRunning && (
                <div className="space-y-3 mb-4">
                    <select
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Select a task...</option>
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.project?.name ? `[${task.project.name}] ` : ''}{task.title}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="What are you working on? (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field"
                    />
                </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-3">
                {isRunning ? (
                    <button
                        onClick={handleStop}
                        disabled={isLoading}
                        className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                        Stop Timer
                    </button>
                ) : (
                    <button
                        onClick={handleStart}
                        disabled={isLoading || !selectedTask}
                        className="flex-1 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Start Timer
                    </button>
                )}
            </div>

            {/* Quick stats */}
            {isRunning && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
                    <span className="text-xs text-slate-500">
                        Started at {new Date(runningEntry.start_time).toLocaleTimeString()}
                    </span>
                </div>
            )}
        </div>
    );
}
