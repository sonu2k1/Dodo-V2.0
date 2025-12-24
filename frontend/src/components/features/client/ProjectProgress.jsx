export default function ProjectProgress({
    project,
    showPhases = true,
    onClick
}) {
    if (!project) return null;

    const phases = project.phases || [
        { name: 'Discovery', status: 'completed' },
        { name: 'Design', status: 'completed' },
        { name: 'Development', status: 'in_progress' },
        { name: 'Testing', status: 'pending' },
        { name: 'Launch', status: 'pending' },
    ];

    const currentPhase = project.current_phase || phases.findIndex(p => p.status === 'in_progress') + 1;
    const totalPhases = project.total_phases || phases.length;
    const progressPercent = project.progressPercent || Math.round((currentPhase / totalPhases) * 100);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500';
            case 'in_progress': return 'bg-indigo-500';
            default: return 'bg-slate-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✓';
            case 'in_progress': return '◉';
            default: return '○';
        }
    };

    return (
        <div
            className={`glass-card p-5 ${onClick ? 'cursor-pointer hover:border-indigo-500/30' : ''}`}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    {project.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                    )}
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-indigo-400">{progressPercent}%</span>
                    <p className="text-xs text-slate-500">Complete</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Phases */}
            {showPhases && (
                <div className="flex items-center justify-between gap-1">
                    {phases.map((phase, idx) => (
                        <div key={idx} className="flex-1 text-center">
                            {/* Connector line */}
                            {idx > 0 && (
                                <div className={`h-0.5 -mt-6 -ml-2 mr-2 ${phase.status === 'completed' || phases[idx - 1].status === 'completed'
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-700'
                                    }`} />
                            )}

                            {/* Phase indicator */}
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${getStatusColor(phase.status)}`}>
                                {getStatusIcon(phase.status)}
                            </div>

                            {/* Phase name */}
                            <p className={`text-xs mt-1.5 truncate ${phase.status === 'in_progress' ? 'text-indigo-400 font-medium' : 'text-slate-500'
                                }`}>
                                {phase.name}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-500">
                <span>Phase {currentPhase} of {totalPhases}</span>
                {project.end_date && (
                    <span>Due: {new Date(project.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                )}
            </div>
        </div>
    );
}
