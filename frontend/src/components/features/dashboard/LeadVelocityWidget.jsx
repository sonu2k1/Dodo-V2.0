import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Sample data - replace with real API data
const leadData = [
    { month: 'Jan', newLeads: 45, converted: 12 },
    { month: 'Feb', newLeads: 52, converted: 18 },
    { month: 'Mar', newLeads: 48, converted: 15 },
    { month: 'Apr', newLeads: 61, converted: 22 },
    { month: 'May', newLeads: 55, converted: 19 },
    { month: 'Jun', newLeads: 67, converted: 28 },
    { month: 'Jul', newLeads: 72, converted: 31 },
    { month: 'Aug', newLeads: 58, converted: 24 },
    { month: 'Sep', newLeads: 63, converted: 21 },
    { month: 'Oct', newLeads: 75, converted: 32 },
    { month: 'Nov', newLeads: 68, converted: 27 },
    { month: 'Dec', newLeads: 80, converted: 35 },
];

// Calculate conversion rate for each month
const dataWithRate = leadData.map(d => ({
    ...d,
    conversionRate: ((d.converted / d.newLeads) * 100).toFixed(1)
}));

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass-card p-4 shadow-xl border border-slate-600/50">
                <p className="text-white font-semibold mb-2">{label}</p>
                <p className="text-sm text-cyan-400">New Leads: {data.newLeads}</p>
                <p className="text-sm text-emerald-400">Converted: {data.converted}</p>
                <p className="text-sm text-amber-400 mt-2 pt-2 border-t border-slate-700">
                    Conversion Rate: {data.conversionRate}%
                </p>
            </div>
        );
    }
    return null;
};

export default function LeadVelocityWidget() {
    // Calculate totals
    const totalNewLeads = dataWithRate.reduce((sum, d) => sum + d.newLeads, 0);
    const totalConverted = dataWithRate.reduce((sum, d) => sum + d.converted, 0);
    const avgConversionRate = ((totalConverted / totalNewLeads) * 100).toFixed(1);
    const thisMonth = dataWithRate[dataWithRate.length - 1];
    const lastMonth = dataWithRate[dataWithRate.length - 2];
    const velocityChange = (((thisMonth.newLeads - lastMonth.newLeads) / lastMonth.newLeads) * 100).toFixed(1);

    return (
        <div className="glass-panel p-6 hover-lift">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Lead Velocity</h3>
                    <p className="text-sm text-slate-400">New leads vs Conversions</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`badge ${parseFloat(velocityChange) >= 0 ? 'badge-success' : 'badge-error'}`}>
                        {parseFloat(velocityChange) >= 0 ? '↑' : '↓'} {Math.abs(velocityChange)}% MoM
                    </span>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-xs text-slate-400 mb-1">Total Leads</p>
                    <p className="text-lg font-bold text-cyan-400">{totalNewLeads}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-slate-400 mb-1">Converted</p>
                    <p className="text-lg font-bold text-emerald-400">{totalConverted}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-slate-400 mb-1">Conv. Rate</p>
                    <p className="text-lg font-bold text-amber-400">{avgConversionRate}%</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-xs text-slate-400 mb-1">This Month</p>
                    <p className="text-lg font-bold text-purple-400">{thisMonth.newLeads}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataWithRate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                        <Bar
                            dataKey="newLeads"
                            name="New Leads"
                            radius={[4, 4, 0, 0]}
                        >
                            {dataWithRate.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`rgba(6, 182, 212, ${0.4 + (entry.newLeads / 100) * 0.6})`}
                                />
                            ))}
                        </Bar>
                        <Bar
                            dataKey="converted"
                            name="Converted"
                            radius={[4, 4, 0, 0]}
                        >
                            {dataWithRate.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`rgba(16, 185, 129, ${0.4 + (entry.converted / 40) * 0.6})`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Conversion funnel summary */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Funnel Efficiency</span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                                    style={{ width: `${avgConversionRate}%` }}
                                />
                            </div>
                            <span className="text-emerald-400 font-medium">{avgConversionRate}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
