import { useState, useEffect } from 'react';

const sourceOptions = [
    { value: 'website', label: '🌐 Website' },
    { value: 'referral', label: '👥 Referral' },
    { value: 'social', label: '📱 Social Media' },
    { value: 'cold_call', label: '📞 Cold Call' },
    { value: 'email', label: '✉️ Email' },
    { value: 'event', label: '🎪 Event' },
    { value: 'other', label: '📌 Other' },
];

const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
];

export default function LeadForm({
    isOpen,
    onClose,
    onSubmit,
    employees = [],
    editLead = null,
    isLoading = false,
}) {
    const [formData, setFormData] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        source: 'website',
        status: 'new',
        estimated_value: '',
        assigned_to: '',
        notes: '',
    });

    useEffect(() => {
        if (editLead) {
            setFormData({
                company_name: editLead.company_name || '',
                contact_name: editLead.contact_name || '',
                email: editLead.email || '',
                phone: editLead.phone || '',
                source: editLead.source || 'website',
                status: editLead.status || 'new',
                estimated_value: editLead.estimated_value || '',
                assigned_to: editLead.assigned_to || '',
                notes: editLead.notes || '',
            });
        } else {
            setFormData({
                company_name: '',
                contact_name: '',
                email: '',
                phone: '',
                source: 'website',
                status: 'new',
                estimated_value: '',
                assigned_to: '',
                notes: '',
            });
        }
    }, [editLead, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({
            ...formData,
            estimated_value: parseFloat(formData.estimated_value) || 0,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        {editLead ? 'Edit Lead' : 'Create New Lead'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Company & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Company Name *</label>
                            <input
                                type="text"
                                value={formData.company_name}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                                required
                                className="input-field"
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Contact Name *</label>
                            <input
                                type="text"
                                value={formData.contact_name}
                                onChange={(e) => handleChange('contact_name', e.target.value)}
                                required
                                className="input-field"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                                className="input-field"
                                placeholder="john@acme.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="input-field"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    {/* Source & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Source</label>
                            <select
                                value={formData.source}
                                onChange={(e) => handleChange('source', e.target.value)}
                                className="input-field"
                            >
                                {sourceOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="input-field"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Value & Assignment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Estimated Value (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={formData.estimated_value}
                                onChange={(e) => handleChange('estimated_value', e.target.value)}
                                className="input-field"
                                placeholder="100000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Assign To</label>
                            <select
                                value={formData.assigned_to}
                                onChange={(e) => handleChange('assigned_to', e.target.value)}
                                className="input-field"
                            >
                                <option value="">Unassigned</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Additional information about this lead..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : editLead ? 'Save Changes' : 'Create Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
