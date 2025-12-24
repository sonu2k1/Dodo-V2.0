import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

// Sample announcements
const initialAnnouncements = [
    {
        id: 1,
        title: 'System Maintenance Scheduled',
        message: 'The system will undergo maintenance on December 25th from 2:00 AM to 4:00 AM IST. Please save your work before this time.',
        priority: 'high',
        targetRoles: ['all'],
        publishedAt: '2024-12-23T10:00:00',
        expiresAt: '2024-12-26T00:00:00',
        status: 'active',
        author: 'System Admin'
    },
    {
        id: 2,
        title: 'New Feature: Time Tracking',
        message: 'We\'ve launched a new time tracking feature! You can now log time directly from task cards. Check out the guide in the help section.',
        priority: 'normal',
        targetRoles: ['employee'],
        publishedAt: '2024-12-20T09:00:00',
        expiresAt: null,
        status: 'active',
        author: 'Product Team'
    },
    {
        id: 3,
        title: 'Holiday Schedule Update',
        message: 'Please note the updated holiday schedule for Q1 2025. All leaves must be applied at least 2 weeks in advance.',
        priority: 'normal',
        targetRoles: ['employee', 'admin'],
        publishedAt: '2024-12-18T14:00:00',
        expiresAt: '2025-01-31T00:00:00',
        status: 'active',
        author: 'HR Team'
    },
];

const priorityStyles = {
    high: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔴' },
    normal: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🔵' },
    low: { badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: '⚪' },
};

const roleOptions = [
    { value: 'all', label: 'Everyone' },
    { value: 'super_admin', label: 'Super Admins' },
    { value: 'admin', label: 'Admins' },
    { value: 'employee', label: 'Employees' },
    { value: 'client', label: 'Clients' },
];

export default function Announcements() {
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        priority: 'normal',
        targetRoles: ['all'],
        expiresAt: '',
    });

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        setFormData({ title: '', message: '', priority: 'normal', targetRoles: ['all'], expiresAt: '' });
        setShowModal(true);
    };

    const openEditModal = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            message: announcement.message,
            priority: announcement.priority,
            targetRoles: announcement.targetRoles,
            expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAnnouncement) {
            setAnnouncements(announcements.map(a =>
                a.id === editingAnnouncement.id
                    ? { ...a, ...formData, expiresAt: formData.expiresAt || null }
                    : a
            ));
        } else {
            setAnnouncements([{
                id: Date.now(),
                ...formData,
                publishedAt: new Date().toISOString(),
                expiresAt: formData.expiresAt || null,
                status: 'active',
                author: 'Super Admin'
            }, ...announcements]);
        }
        setShowModal(false);
    };

    const toggleStatus = (id) => {
        setAnnouncements(announcements.map(a =>
            a.id === id ? { ...a, status: a.status === 'active' ? 'archived' : 'active' } : a
        ));
    };

    const deleteAnnouncement = (id) => {
        setAnnouncements(announcements.filter(a => a.id !== id));
    };

    const handleRoleToggle = (role) => {
        if (role === 'all') {
            setFormData({ ...formData, targetRoles: ['all'] });
        } else {
            const newRoles = formData.targetRoles.includes('all')
                ? [role]
                : formData.targetRoles.includes(role)
                    ? formData.targetRoles.filter(r => r !== role)
                    : [...formData.targetRoles, role];
            setFormData({ ...formData, targetRoles: newRoles.length ? newRoles : ['all'] });
        }
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Announcements</h1>
                    <p className="text-slate-400">Broadcast messages to your organization</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    New Announcement
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{announcements.filter(a => a.status === 'active').length}</p>
                    <p className="text-sm text-slate-400">Active</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{announcements.filter(a => a.priority === 'high').length}</p>
                    <p className="text-sm text-slate-400">High Priority</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{announcements.length}</p>
                    <p className="text-sm text-slate-400">Total</p>
                </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {announcements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className={`glass-panel p-6 transition-all ${announcement.status === 'archived' ? 'opacity-60' : ''
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Priority indicator */}
                            <div className="text-2xl">{priorityStyles[announcement.priority].icon}</div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                                    <span className={`badge border ${priorityStyles[announcement.priority].badge}`}>
                                        {announcement.priority}
                                    </span>
                                    {announcement.status === 'archived' && (
                                        <span className="badge bg-slate-700 text-slate-400">Archived</span>
                                    )}
                                </div>

                                <p className="text-slate-300 mb-4">{announcement.message}</p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {announcement.author}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(announcement.publishedAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {announcement.targetRoles.includes('all') ? 'Everyone' : announcement.targetRoles.join(', ')}
                                    </span>
                                    {announcement.expiresAt && (
                                        <span className="flex items-center gap-1 text-amber-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(announcement)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => toggleStatus(announcement.id)}
                                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                    title={announcement.status === 'active' ? 'Archive' : 'Restore'}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => deleteAnnouncement(announcement.id)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-6">
                            {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="input-field"
                                    placeholder="Announcement title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    rows={4}
                                    className="input-field resize-none"
                                    placeholder="Write your announcement..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Priority</label>
                                <div className="flex gap-2">
                                    {['low', 'normal', 'high'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: p })}
                                            className={`flex-1 py-2 rounded-lg capitalize transition-all ${formData.priority === p
                                                    ? p === 'high' ? 'bg-red-600 text-white' :
                                                        p === 'normal' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Target Audience</label>
                                <div className="flex flex-wrap gap-2">
                                    {roleOptions.map(role => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => handleRoleToggle(role.value)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${formData.targetRoles.includes(role.value)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Expiration Date (optional)</label>
                                <input
                                    type="date"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn-primary">
                                    {editingAnnouncement ? 'Save Changes' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
