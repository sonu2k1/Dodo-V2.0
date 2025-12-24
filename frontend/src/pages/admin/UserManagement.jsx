import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

// Sample users data
const initialUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@dodo.com', role: 'admin', status: 'active', lastLogin: '2024-12-23' },
    { id: 2, name: 'Bob Smith', email: 'bob@dodo.com', role: 'employee', status: 'active', lastLogin: '2024-12-22' },
    { id: 3, name: 'Carol Williams', email: 'carol@dodo.com', role: 'employee', status: 'active', lastLogin: '2024-12-21' },
    { id: 4, name: 'David Brown', email: 'david@client.com', role: 'client', status: 'active', lastLogin: '2024-12-20' },
    { id: 5, name: 'Emma Davis', email: 'emma@dodo.com', role: 'employee', status: 'inactive', lastLogin: '2024-12-15' },
];

const roleColors = {
    super_admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    employee: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    client: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function UserManagement() {
    const [users, setUsers] = useState(initialUsers);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'employee',
        password: '',
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        } else {
            setUsers([...users, { id: Date.now(), ...formData, status: 'active', lastLogin: 'Never' }]);
        }
        closeModal();
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'employee', password: '' });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'employee', password: '' });
    };

    const toggleStatus = (userId) => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
        ));
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400">Create and manage user accounts and roles</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="input-field md:w-48"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                        <option value="client">Client</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-left text-sm font-medium text-slate-400 p-4">User</th>
                                <th className="text-left text-sm font-medium text-slate-400 p-4">Role</th>
                                <th className="text-left text-sm font-medium text-slate-400 p-4">Status</th>
                                <th className="text-left text-sm font-medium text-slate-400 p-4">Last Login</th>
                                <th className="text-right text-sm font-medium text-slate-400 p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="table-row">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-sm text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge border ${roleColors[user.role]}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">{user.lastLogin}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(user.id)}
                                                className={`p-2 rounded-lg transition-colors ${user.status === 'active'
                                                        ? 'text-amber-400 hover:bg-amber-500/10'
                                                        : 'text-emerald-400 hover:bg-emerald-500/10'
                                                    }`}
                                                title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {user.status === 'active' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 animate-slide-up">
                        <h2 className="text-xl font-bold text-white mb-6">
                            {editingUser ? 'Edit User' : 'Create New User'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="input-field"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="input-field"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="client">Client</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                        className="input-field"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn-primary">
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
