import { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LeadKanban from '../components/features/crm/LeadKanban';
import LeadList from '../components/features/crm/LeadList';
import LeadForm from '../components/features/crm/LeadForm';
import AISmartSummary from '../components/features/crm/AISmartSummary';

// Sample leads data
const sampleLeads = [
    { id: 1, company_name: 'TechCorp India', contact_name: 'Rahul Sharma', email: 'rahul@techcorp.in', phone: '+91 98765 43210', source: 'website', status: 'qualified', estimated_value: 500000, assigned_to: 'u1', assigned_user: { id: 'u1', full_name: 'Alice Johnson' }, created_at: '2024-12-20T10:00:00' },
    { id: 2, company_name: 'Digital Solutions', contact_name: 'Priya Patel', email: 'priya@digitalsol.com', phone: '+91 87654 32109', source: 'referral', status: 'new', estimated_value: 250000, created_at: '2024-12-22T14:30:00' },
    { id: 3, company_name: 'StartupXYZ', contact_name: 'Amit Kumar', email: 'amit@startupxyz.io', phone: '+91 76543 21098', source: 'social', status: 'contacted', estimated_value: 150000, assigned_to: 'u2', assigned_user: { id: 'u2', full_name: 'Bob Smith' }, created_at: '2024-12-21T09:15:00' },
    { id: 4, company_name: 'MegaCorp Ltd', contact_name: 'Sneha Reddy', email: 'sneha@megacorp.com', phone: '+91 65432 10987', source: 'cold_call', status: 'proposal', estimated_value: 1200000, assigned_to: 'u1', assigned_user: { id: 'u1', full_name: 'Alice Johnson' }, created_at: '2024-12-18T11:45:00' },
    { id: 5, company_name: 'InnoTech', contact_name: 'Vikram Singh', email: 'vikram@innotech.in', phone: '+91 54321 09876', source: 'event', status: 'negotiation', estimated_value: 800000, assigned_to: 'u2', assigned_user: { id: 'u2', full_name: 'Bob Smith' }, created_at: '2024-12-15T16:20:00' },
    { id: 6, company_name: 'CloudFirst', contact_name: 'Ananya Gupta', email: 'ananya@cloudfirst.io', source: 'email', status: 'won', estimated_value: 350000, converted_at: '2024-12-22T10:00:00', created_at: '2024-12-10T08:00:00' },
    { id: 7, company_name: 'DataDriven Co', contact_name: 'Karan Mehta', email: 'karan@datadriven.com', source: 'website', status: 'lost', estimated_value: 200000, created_at: '2024-12-12T13:30:00' },
];

const sampleEmployees = [
    { id: 'u1', full_name: 'Alice Johnson' },
    { id: 'u2', full_name: 'Bob Smith' },
    { id: 'u3', full_name: 'Carol Williams' },
];

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

export default function CRMPage() {
    const [leads, setLeads] = useState(sampleLeads);
    const [viewMode, setViewMode] = useState('kanban');
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [filters, setFilters] = useState({ search: '', source: '', assignedTo: '' });
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Calculate stats
    const stats = useMemo(() => {
        const total = leads.length;
        const active = leads.filter(l => !['won', 'lost'].includes(l.status)).length;
        const totalValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
        const wonValue = leads.filter(l => l.status === 'won').reduce((sum, l) => sum + (l.estimated_value || 0), 0);
        const won = leads.filter(l => l.status === 'won').length;
        const lost = leads.filter(l => l.status === 'lost').length;
        const conversionRate = (won + lost) > 0 ? ((won / (won + lost)) * 100).toFixed(1) : 0;

        return { total, active, totalValue, wonValue, conversionRate };
    }, [leads]);

    // Filter leads
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            if (filters.search) {
                const search = filters.search.toLowerCase();
                if (!lead.company_name.toLowerCase().includes(search) &&
                    !lead.contact_name.toLowerCase().includes(search) &&
                    !lead.email.toLowerCase().includes(search)) {
                    return false;
                }
            }
            if (filters.source && lead.source !== filters.source) return false;
            if (filters.assignedTo && lead.assigned_to !== filters.assignedTo) return false;
            return true;
        });
    }, [leads, filters]);

    // Handle status change
    const handleStatusChange = useCallback((leadId, status) => {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    }, []);

    // Handle lead creation/update
    const handleSubmitLead = useCallback((data) => {
        if (editingLead) {
            setLeads(prev => prev.map(l => l.id === editingLead.id ? { ...l, ...data } : l));
        } else {
            const newLead = {
                ...data,
                id: Date.now(),
                created_at: new Date().toISOString(),
                assigned_user: sampleEmployees.find(e => e.id === data.assigned_to),
            };
            setLeads(prev => [newLead, ...prev]);
        }
        setShowLeadForm(false);
        setEditingLead(null);
    }, [editingLead]);

    // Handle lead click
    const handleLeadClick = useCallback((lead) => {
        setSelectedLead(lead);
    }, []);

    // Handle sort
    const handleSort = useCallback((field) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    }, [sortBy]);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                        CRM <span className="text-indigo-400">Pipeline</span>
                    </h1>
                    <p className="text-slate-400">Manage leads and track conversions</p>
                </div>
                <button
                    onClick={() => { setEditingLead(null); setShowLeadForm(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Lead
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total Leads', value: stats.total, icon: '📊', color: 'indigo' },
                    { label: 'Active', value: stats.active, icon: '🎯', color: 'cyan' },
                    { label: 'Pipeline Value', value: formatCurrency(stats.totalValue), icon: '💰', color: 'amber' },
                    { label: 'Won Value', value: formatCurrency(stats.wonValue), icon: '🏆', color: 'emerald' },
                    { label: 'Conversion', value: `${stats.conversionRate}%`, icon: '📈', color: 'purple' },
                ].map((stat, idx) => (
                    <div key={idx} className="glass-card p-4 hover-lift">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{stat.icon}</span>
                            <span className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</span>
                        </div>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters & View Toggle */}
            <div className="glass-card p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input-field py-2"
                        />
                    </div>
                    <select
                        value={filters.source}
                        onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                        className="input-field py-2 w-40"
                    >
                        <option value="">All Sources</option>
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="social">Social</option>
                        <option value="cold_call">Cold Call</option>
                        <option value="email">Email</option>
                        <option value="event">Event</option>
                    </select>
                    <select
                        value={filters.assignedTo}
                        onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                        className="input-field py-2 w-40"
                    >
                        <option value="">All Assignees</option>
                        {sampleEmployees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex rounded-lg bg-slate-800 p-1">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            📋 Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            📝 List
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Lead views */}
                <div className="xl:col-span-3">
                    {viewMode === 'kanban' ? (
                        <LeadKanban
                            leads={filteredLeads}
                            onStatusChange={handleStatusChange}
                            onLeadClick={handleLeadClick}
                        />
                    ) : (
                        <LeadList
                            leads={filteredLeads}
                            onLeadClick={handleLeadClick}
                            onStatusChange={handleStatusChange}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                        />
                    )}
                </div>

                {/* AI Panel */}
                <div className="xl:col-span-1">
                    <AISmartSummary
                        leadId={selectedLead?.id}
                        onGenerateSummary={(emails) => {
                            // Would call API: leadsApi.getAISummary(selectedLead.id, emails)
                            return Promise.resolve({
                                summary: "**Summary**: The client is interested in our enterprise solution and has budget approval.\n\n**Key Points**:\n- Looking for Q1 implementation\n- Budget: ₹5-8 lakhs\n- Decision maker: CTO\n\n**Action Items**:\n1. Schedule demo call\n2. Send proposal by Friday\n\n**Sentiment**: Positive\n\n**Next Steps**: Schedule technical demo with their team.",
                                generatedAt: new Date().toISOString()
                            });
                        }}
                        onGenerateInsights={() => {
                            return Promise.resolve({
                                insights: "**Lead Score**: 78/100\n\n**Strengths**:\n- Active engagement\n- Budget confirmed\n- Short decision timeline\n\n**Concerns**:\n- New to our solutions\n- Multiple stakeholders\n\n**Recommendations**:\n1. Focus on ROI metrics\n2. Offer pilot program\n3. Connect with reference customers\n\n**Timeline**: Close within 3-4 weeks",
                                generatedAt: new Date().toISOString()
                            });
                        }}
                        onGenerateFollowUp={() => {
                            return Promise.resolve({
                                suggestion: "Hi Rahul,\n\nThank you for our conversation last week. I wanted to follow up on the demo we discussed.\n\nBased on your requirements, I've prepared a customized proposal that addresses your team's specific needs around automation and reporting.\n\nWould you be available for a 30-minute call this Thursday or Friday to walk through the details?\n\nLooking forward to hearing from you.\n\nBest regards",
                                generatedAt: new Date().toISOString()
                            });
                        }}
                    />
                </div>
            </div>

            {/* Lead Form Modal */}
            <LeadForm
                isOpen={showLeadForm}
                onClose={() => { setShowLeadForm(false); setEditingLead(null); }}
                onSubmit={handleSubmitLead}
                employees={sampleEmployees}
                editLead={editingLead}
            />
        </DashboardLayout>
    );
}
