import { useMemo } from 'react';

// Generate sample heatmap data
const generateHeatmapData = () => {
    const employees = [
        'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown',
        'Emma Davis', 'Frank Miller', 'Grace Wilson', 'Henry Taylor'
    ];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return employees.map(name => ({
        name,
        data: days.map(day => ({
            day,
            hours: Math.floor(Math.random() * 10) + 2,
            tasks: Math.floor(Math.random() * 8) + 1,
        }))
    }));
};

// Get color intensity based on hours
const getHeatColor = (hours) => {
    if (hours >= 10) return 'bg-red-500/80 text-white';
    if (hours >= 8) return 'bg-amber-500/80 text-white';
    if (hours >= 6) return 'bg-emerald-500/80 text-white';
    if (hours >= 4) return 'bg-emerald-400/60 text-white';
    return 'bg-slate-600/50 text-slate-300';
};

const getStatusLabel = (hours) => {
    if (hours >= 10) return 'Overloaded';
    if (hours >= 8) return 'At Capacity';
    if (hours >= 6) return 'Normal';
    return 'Available';
};

export default function TeamLoadHeatmapWidget() {
    const data = useMemo(() => generateHeatmapData(), []);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    // Calculate team statistics
    const teamStats = useMemo(() => {
        let totalHours = 0;
        let overloaded = 0;
        let available = 0;

        data.forEach(emp => {
            emp.data.forEach(d => {
                totalHours += d.hours;
                if (d.hours >= 10) overloaded++;
                if (d.hours < 4) available++;
            });
        });

        return {
            avgHours: (totalHours / (data.length * 5)).toFixed(1),
            overloadedSlots: overloaded,
            availableSlots: available,
        };
    }, [data]);

    return (
        <div className="glass-panel p-6 hover-lift">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Team Load Heatmap</h3>
                    <p className="text-sm text-slate-400">Weekly workload distribution</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-slate-600"></div>
                        <span className="text-xs text-slate-400">Low</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                        <span className="text-xs text-slate-400">Normal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-amber-500"></div>
                        <span className="text-xs text-slate-400">High</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className="text-xs text-slate-400">Overload</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-xs text-slate-400 mb-1">Avg Hours/Day</p>
                    <p className="text-lg font-bold text-cyan-400">{teamStats.avgHours}h</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-slate-400 mb-1">Overloaded Slots</p>
                    <p className="text-lg font-bold text-red-400">{teamStats.overloadedSlots}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-slate-400 mb-1">Available Slots</p>
                    <p className="text-lg font-bold text-emerald-400">{teamStats.availableSlots}</p>
                </div>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                    <thead>
                        <tr>
                            <th className="text-left text-sm text-slate-400 font-medium pb-3 w-36">Employee</th>
                            {days.map(day => (
                                <th key={day} className="text-center text-sm text-slate-400 font-medium pb-3 w-16">
                                    {day}
                                </th>
                            ))}
                            <th className="text-center text-sm text-slate-400 font-medium pb-3 w-20">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((employee, idx) => {
                            const avgHours = employee.data.reduce((sum, d) => sum + d.hours, 0) / 5;
                            return (
                                <tr key={idx} className="group">
                                    <td className="py-2 pr-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                                {employee.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                                {employee.name}
                                            </span>
                                        </div>
                                    </td>
                                    {employee.data.map((day, dayIdx) => (
                                        <td key={dayIdx} className="py-2 px-1">
                                            <div
                                                className={`
                          w-12 h-12 mx-auto rounded-lg flex flex-col items-center justify-center
                          transition-all duration-200 cursor-pointer
                          hover:scale-110 hover:shadow-lg
                          ${getHeatColor(day.hours)}
                        `}
                                                title={`${day.hours}h - ${day.tasks} tasks`}
                                            >
                                                <span className="text-sm font-bold">{day.hours}h</span>
                                                <span className="text-[10px] opacity-75">{day.tasks} tasks</span>
                                            </div>
                                        </td>
                                    ))}
                                    <td className="py-2 text-center">
                                        <span className={`badge ${avgHours >= 9 ? 'badge-error' :
                                                avgHours >= 7 ? 'badge-warning' :
                                                    'badge-success'
                                            }`}>
                                            {getStatusLabel(avgHours)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
