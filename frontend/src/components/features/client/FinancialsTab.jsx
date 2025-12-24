const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function FinancialsTab({
    summary = {},
    invoices = [],
    payments = [],
    onDownloadInvoice,
}) {
    const getStatusBadge = (status) => {
        const styles = {
            paid: 'bg-emerald-500/20 text-emerald-400',
            pending: 'bg-amber-500/20 text-amber-400',
            overdue: 'bg-red-500/20 text-red-400',
            draft: 'bg-slate-500/20 text-slate-400',
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[status] || 'bg-slate-700 text-slate-400'}`}>
                {status?.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Invoiced', value: formatCurrency(summary.totalInvoiced || 0), icon: '📊', color: 'indigo' },
                    { label: 'Total Paid', value: formatCurrency(summary.totalPaid || 0), icon: '✓', color: 'emerald' },
                    { label: 'Outstanding', value: formatCurrency(summary.outstanding || 0), icon: '⏳', color: 'amber' },
                    { label: 'Pending', value: summary.pendingInvoices || 0, icon: '📋', color: 'purple' },
                ].map((stat, idx) => (
                    <div key={idx} className="glass-card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{stat.icon}</span>
                        </div>
                        <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                        <p className="text-xs text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Invoices */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>📄</span> Invoices
                </h3>
                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-700/50">
                                    <th className="text-left text-sm font-medium text-slate-400 p-4">Invoice #</th>
                                    <th className="text-left text-sm font-medium text-slate-400 p-4">Date</th>
                                    <th className="text-left text-sm font-medium text-slate-400 p-4">Due Date</th>
                                    <th className="text-right text-sm font-medium text-slate-400 p-4">Amount</th>
                                    <th className="text-center text-sm font-medium text-slate-400 p-4">Status</th>
                                    <th className="text-center text-sm font-medium text-slate-400 p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-500">No invoices yet</td>
                                    </tr>
                                ) : invoices.map(invoice => (
                                    <tr key={invoice.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                                        <td className="p-4 text-white font-medium">{invoice.invoice_number}</td>
                                        <td className="p-4 text-slate-400">{formatDate(invoice.created_at)}</td>
                                        <td className="p-4 text-slate-400">{formatDate(invoice.due_date)}</td>
                                        <td className="p-4 text-right text-white font-medium">{formatCurrency(invoice.amount)}</td>
                                        <td className="p-4 text-center">{getStatusBadge(invoice.status)}</td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => onDownloadInvoice?.(invoice)}
                                                className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                title="Download PDF"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>💳</span> Payment History
                </h3>
                <div className="glass-panel">
                    {payments.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">No payments recorded</div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {payments.map(payment => (
                                <div key={payment.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <span className="text-emerald-400">✓</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{formatCurrency(payment.amount)}</p>
                                            <p className="text-xs text-slate-500">
                                                {payment.payment_method} • {formatDate(payment.payment_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-400">{payment.invoice?.invoice_number}</p>
                                        {payment.transaction_id && (
                                            <p className="text-xs text-slate-600">TXN: {payment.transaction_id}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
