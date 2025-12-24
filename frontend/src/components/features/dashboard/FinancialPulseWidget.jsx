import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Sample data - replace with real API data
const generateFinancialData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, i) => ({
        month,
        revenue: Math.floor(Math.random() * 50000) + 80000,
        expenses: Math.floor(Math.random() * 30000) + 40000,
    }));
};

const data = generateFinancialData();

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-4 shadow-xl border border-slate-600/50">
                <p className="text-white font-semibold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: ₹{entry.value.toLocaleString()}
                    </p>
                ))}
                <p className="text-sm text-emerald-400 mt-2 pt-2 border-t border-slate-700">
                    Profit: ₹{(payload[0].value - payload[1].value).toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export default function FinancialPulseWidget() {
    // Calculate totals
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
    const profit = totalRevenue - totalExpenses;
    const profitMargin = ((profit / totalRevenue) * 100).toFixed(1);

    return (
        <div className="glass-panel p-6 hover-lift">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Financial Pulse</h3>
                    <p className="text-sm text-slate-400">Revenue vs Expenses (2024)</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`badge ${profit >= 0 ? 'badge-success' : 'badge-error'}`}>
                        {profit >= 0 ? '↑' : '↓'} {profitMargin}% margin
                    </span>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs text-slate-400 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-indigo-400">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-xs text-slate-400 mb-1">Expenses</p>
                    <p className="text-lg font-bold text-rose-400">₹{(totalExpenses / 100000).toFixed(1)}L</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-slate-400 mb-1">Profit</p>
                    <p className="text-lg font-bold text-emerald-400">₹{(profit / 100000).toFixed(1)}L</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            name="Expenses"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorExpenses)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
