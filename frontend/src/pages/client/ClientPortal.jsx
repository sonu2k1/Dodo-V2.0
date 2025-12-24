import { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProjectProgress from '../../components/features/client/ProjectProgress';
import ApprovalCenter from '../../components/features/client/ApprovalCenter';
import FinancialsTab from '../../components/features/client/FinancialsTab';
import SupportTickets from '../../components/features/client/SupportTickets';

// Sample data
const sampleProjects = [
    { id: 'p1', name: 'Website Redesign', description: 'Complete overhaul of company website with modern design', current_phase: 3, total_phases: 5, status: 'active', end_date: '2025-01-15', phases: [{ name: 'Discovery', status: 'completed' }, { name: 'Design', status: 'completed' }, { name: 'Development', status: 'in_progress' }, { name: 'Testing', status: 'pending' }, { name: 'Launch', status: 'pending' }] },
    { id: 'p2', name: 'Mobile App Development', description: 'iOS and Android app for customer engagement', current_phase: 2, total_phases: 6, status: 'active', end_date: '2025-02-28', phases: [{ name: 'Planning', status: 'completed' }, { name: 'UI/UX', status: 'in_progress' }, { name: 'Backend', status: 'pending' }, { name: 'Frontend', status: 'pending' }, { name: 'Testing', status: 'pending' }, { name: 'Release', status: 'pending' }] },
];

const sampleApprovals = [
    { id: 'a1', title: 'Homepage Design V2', description: 'Updated homepage with new hero section and testimonials', status: 'pending', project: { id: 'p1', name: 'Website Redesign' }, deliverable_url: '#', deliverable_name: 'homepage-v2.figma', deliverable_type: 'Figma Design', submitted_by: { full_name: 'Alice Johnson' }, created_at: '2024-12-22T10:00:00' },
    { id: 'a2', title: 'App Wireframes', description: 'Core user flow wireframes for the mobile app', status: 'pending', project: { id: 'p2', name: 'Mobile App' }, deliverable_url: '#', deliverable_type: 'PDF', submitted_by: { full_name: 'Bob Smith' }, created_at: '2024-12-21T14:00:00' },
    { id: 'a3', title: 'Brand Guidelines', description: 'Updated brand colors and typography', status: 'approved', project: { id: 'p1', name: 'Website Redesign' }, reviewed_at: '2024-12-20T10:00:00', created_at: '2024-12-18T10:00:00' },
];

const sampleInvoices = [
    { id: 'i1', invoice_number: 'INV-2024-001', amount: 150000, status: 'paid', created_at: '2024-11-01', due_date: '2024-11-15' },
    { id: 'i2', invoice_number: 'INV-2024-002', amount: 75000, status: 'paid', created_at: '2024-12-01', due_date: '2024-12-15' },
    { id: 'i3', invoice_number: 'INV-2024-003', amount: 100000, status: 'pending', created_at: '2024-12-15', due_date: '2024-12-30' },
];

const samplePayments = [
    { id: 'pay1', amount: 150000, payment_method: 'Bank Transfer', payment_date: '2024-11-14', transaction_id: 'TXN123456', invoice: { invoice_number: 'INV-2024-001' } },
    { id: 'pay2', amount: 75000, payment_method: 'UPI', payment_date: '2024-12-10', transaction_id: 'UPI789012', invoice: { invoice_number: 'INV-2024-002' } },
];

const sampleTickets = [
    { id: 't1', subject: 'Login issue on mobile', description: 'Unable to login on iOS Safari browser', status: 'in_progress', priority: 'high', category: 'technical', created_at: '2024-12-22T10:00:00', assigned_to: { full_name: 'Support Team' } },
    { id: 't2', subject: 'Invoice clarification', description: 'Need breakdown of December invoice', status: 'open', priority: 'medium', category: 'billing', created_at: '2024-12-21T14:00:00' },
    { id: 't3', subject: 'Feature request: Dark mode', description: 'Would like dark mode option for the app', status: 'waiting', priority: 'low', category: 'feature', created_at: '2024-12-20T09:00:00' },
];

const sampleMessages = [
    { id: 'm1', message: 'Hi, I am unable to login on my iPhone using Safari. It just shows a blank page.', user: { full_name: 'You', role: 'client' }, created_at: '2024-12-22T10:00:00' },
    { id: 'm2', message: 'Thank you for reporting this. We are looking into the issue. Could you tell us which iOS version you are using?', user: { full_name: 'Support Team', role: 'employee' }, created_at: '2024-12-22T10:30:00' },
    { id: 'm3', message: 'iOS 17.2', user: { full_name: 'You', role: 'client' }, created_at: '2024-12-22T11:00:00' },
];

const tabs = [
    { id: 'projects', label: 'Projects', icon: '📊' },
    { id: 'approvals', label: 'Approvals', icon: '✅' },
    { id: 'financials', label: 'Financials', icon: '💰' },
    { id: 'support', label: 'Support', icon: '🎧' },
];

export default function ClientPortal() {
    const [activeTab, setActiveTab] = useState('projects');
    const [projects] = useState(sampleProjects);
    const [approvals, setApprovals] = useState(sampleApprovals);
    const [invoices] = useState(sampleInvoices);
    const [payments] = useState(samplePayments);
    const [tickets, setTickets] = useState(sampleTickets);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);

    // Financial summary
    const financialSummary = useMemo(() => ({
        totalInvoiced: invoices.reduce((sum, i) => sum + i.amount, 0),
        totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
        outstanding: invoices.reduce((sum, i) => sum + i.amount, 0) - payments.reduce((sum, p) => sum + p.amount, 0),
        pendingInvoices: invoices.filter(i => i.status === 'pending').length,
    }), [invoices, payments]);

    // Pending counts
    const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
    const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;

    // Handlers
    const handleApprove = (approvalId) => {
        setApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status: 'approved', reviewed_at: new Date().toISOString() } : a));
    };

    const handleRequestChanges = (approvalId, feedback) => {
        setApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status: 'changes_requested', client_feedback: feedback } : a));
    };

    const handleSelectTicket = (ticket) => {
        setSelectedTicket(ticket);
        setMessages(ticket.id === 't1' ? sampleMessages : []);
    };

    const handleCreateTicket = (ticketData) => {
        const newTicket = {
            id: `t${Date.now()}`,
            ...ticketData,
            status: 'open',
            created_at: new Date().toISOString(),
        };
        setTickets(prev => [newTicket, ...prev]);
    };

    const handleSendMessage = (ticketId, message) => {
        const newMsg = { id: `m${Date.now()}`, message, user: { full_name: 'You', role: 'client' }, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, newMsg]);
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    Client Portal <span className="text-cyan-400">🏢</span>
                </h1>
                <p className="text-slate-400">Track your projects, approvals, and finances</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        {tab.id === 'approvals' && pendingApprovals > 0 && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                                {pendingApprovals}
                            </span>
                        )}
                        {tab.id === 'support' && openTickets > 0 && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-cyan-500 text-white">
                                {openTickets}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'projects' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {projects.map(project => (
                            <ProjectProgress key={project.id} project={project} />
                        ))}
                    </div>

                    {/* Completed tasks preview */}
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span>✓</span> Completed Deliverables
                        </h2>
                        <div className="glass-panel p-4">
                            <div className="space-y-3">
                                {['Discovery Document', 'Brand Guidelines', 'Homepage Design V1', 'Content Strategy'].map((task, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">✓</div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm">{task}</p>
                                            <p className="text-xs text-slate-500">Completed Dec {10 + idx}, 2024</p>
                                        </div>
                                        <button className="text-indigo-400 hover:text-indigo-300 text-sm">View</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'approvals' && (
                <ApprovalCenter
                    approvals={approvals}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                />
            )}

            {activeTab === 'financials' && (
                <FinancialsTab
                    summary={financialSummary}
                    invoices={invoices}
                    payments={payments}
                    onDownloadInvoice={(inv) => alert(`Download ${inv.invoice_number}`)}
                />
            )}

            {activeTab === 'support' && (
                <SupportTickets
                    tickets={tickets}
                    selectedTicket={selectedTicket}
                    messages={messages}
                    onSelectTicket={handleSelectTicket}
                    onCreateTicket={handleCreateTicket}
                    onSendMessage={handleSendMessage}
                />
            )}
        </DashboardLayout>
    );
}
