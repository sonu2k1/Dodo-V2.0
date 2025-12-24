import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

// Sample system settings
const initialSettings = {
    company: {
        name: 'KUAVA Technologies',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
    },
    holidays: [
        { id: 1, name: 'Republic Day', date: '2024-01-26', recurring: true },
        { id: 2, name: 'Independence Day', date: '2024-08-15', recurring: true },
        { id: 3, name: 'Gandhi Jayanti', date: '2024-10-02', recurring: true },
        { id: 4, name: 'Diwali', date: '2024-11-01', recurring: false },
        { id: 5, name: 'Christmas', date: '2024-12-25', recurring: true },
    ],
    workingHours: {
        start: '09:00',
        end: '18:00',
        workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
};

const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const timezones = [
    'Asia/Kolkata',
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
];

export default function SystemSettings() {
    const [settings, setSettings] = useState(initialSettings);
    const [activeTab, setActiveTab] = useState('general');
    const [showHolidayModal, setShowHolidayModal] = useState(false);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '', recurring: false });

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'holidays', label: 'Holidays', icon: '📅' },
        { id: 'working-hours', label: 'Working Hours', icon: '⏰' },
    ];

    const updateCompanySetting = (key, value) => {
        setSettings({
            ...settings,
            company: { ...settings.company, [key]: value }
        });
    };

    const addHoliday = () => {
        if (newHoliday.name && newHoliday.date) {
            setSettings({
                ...settings,
                holidays: [...settings.holidays, { id: Date.now(), ...newHoliday }]
            });
            setNewHoliday({ name: '', date: '', recurring: false });
            setShowHolidayModal(false);
        }
    };

    const removeHoliday = (id) => {
        setSettings({
            ...settings,
            holidays: settings.holidays.filter(h => h.id !== id)
        });
    };

    const toggleWorkDay = (day) => {
        const workDays = settings.workingHours.workDays.includes(day)
            ? settings.workingHours.workDays.filter(d => d !== day)
            : [...settings.workingHours.workDays, day];
        setSettings({
            ...settings,
            workingHours: { ...settings.workingHours, workDays }
        });
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">System Settings</h1>
                <p className="text-slate-400">Configure organization-wide settings</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* General Settings */}
            {activeTab === 'general' && (
                <div className="glass-panel p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Company Name</label>
                            <input
                                type="text"
                                value={settings.company.name}
                                onChange={(e) => updateCompanySetting('name', e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Timezone</label>
                            <select
                                value={settings.company.timezone}
                                onChange={(e) => updateCompanySetting('timezone', e.target.value)}
                                className="input-field"
                            >
                                {timezones.map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Currency</label>
                            <select
                                value={settings.company.currency}
                                onChange={(e) => updateCompanySetting('currency', e.target.value)}
                                className="input-field"
                            >
                                {currencies.map(c => (
                                    <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Date Format</label>
                            <select
                                value={settings.company.dateFormat}
                                onChange={(e) => updateCompanySetting('dateFormat', e.target.value)}
                                className="input-field"
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn-primary">Save Changes</button>
                </div>
            )}

            {/* Holidays */}
            {activeTab === 'holidays' && (
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Holiday Calendar</h3>
                        <button onClick={() => setShowHolidayModal(true)} className="btn-primary text-sm">
                            + Add Holiday
                        </button>
                    </div>

                    <div className="space-y-3">
                        {settings.holidays.map(holiday => (
                            <div key={holiday.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl">
                                        📅
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{holiday.name}</p>
                                        <p className="text-sm text-slate-400">
                                            {new Date(holiday.date).toLocaleDateString('en-IN', {
                                                weekday: 'short', month: 'short', day: 'numeric'
                                            })}
                                            {holiday.recurring && (
                                                <span className="ml-2 text-xs text-cyan-400">• Recurring</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeHoliday(holiday.id)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Working Hours */}
            {activeTab === 'working-hours' && (
                <div className="glass-panel p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Working Hours</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Start Time</label>
                            <input
                                type="time"
                                value={settings.workingHours.start}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    workingHours: { ...settings.workingHours, start: e.target.value }
                                })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">End Time</label>
                            <input
                                type="time"
                                value={settings.workingHours.end}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    workingHours: { ...settings.workingHours, end: e.target.value }
                                })}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-3">Working Days</label>
                        <div className="flex flex-wrap gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <button
                                    key={day}
                                    onClick={() => toggleWorkDay(day)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${settings.workingHours.workDays.includes(day)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn-primary">Save Changes</button>
                </div>
            )}

            {/* Add Holiday Modal */}
            {showHolidayModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 animate-slide-up">
                        <h2 className="text-xl font-bold text-white mb-6">Add Holiday</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Holiday Name</label>
                                <input
                                    type="text"
                                    value={newHoliday.name}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., Holi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={newHoliday.date}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newHoliday.recurring}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, recurring: e.target.checked })}
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-slate-300">Recurring every year</span>
                            </label>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowHolidayModal(false)} className="flex-1 btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={addHoliday} className="flex-1 btn-primary">
                                    Add Holiday
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
