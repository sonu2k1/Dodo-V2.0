import { useState } from 'react';

export default function AISmartSummary({
    leadId,
    onGenerateSummary,
    onGenerateInsights,
    onGenerateFollowUp,
    isLoading = false,
}) {
    const [activeTab, setActiveTab] = useState('summary');
    const [emails, setEmails] = useState([
        { from: '', subject: '', date: '', body: '' }
    ]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const addEmail = () => {
        setEmails([...emails, { from: '', subject: '', date: '', body: '' }]);
    };

    const updateEmail = (index, field, value) => {
        const updated = [...emails];
        updated[index][field] = value;
        setEmails(updated);
    };

    const removeEmail = (index) => {
        if (emails.length > 1) {
            setEmails(emails.filter((_, i) => i !== index));
        }
    };

    const handleGenerateSummary = async () => {
        setError(null);
        try {
            const data = await onGenerateSummary?.(emails.filter(e => e.body.trim()));
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to generate summary');
        }
    };

    const handleGenerateInsights = async () => {
        setError(null);
        try {
            const data = await onGenerateInsights?.();
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to generate insights');
        }
    };

    const handleGenerateFollowUp = async () => {
        setError(null);
        try {
            const data = await onGenerateFollowUp?.();
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to generate follow-up');
        }
    };

    return (
        <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xl">✨</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                    <p className="text-sm text-slate-400">Powered by Gemini</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[
                    { id: 'summary', label: '📧 Email Summary', action: handleGenerateSummary },
                    { id: 'insights', label: '💡 Lead Insights', action: handleGenerateInsights },
                    { id: 'followup', label: '✉️ Follow-up', action: handleGenerateFollowUp },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setResult(null); }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Email Summary Tab */}
            {activeTab === 'summary' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                        Paste email threads to get an AI-generated summary with key points and action items.
                    </p>

                    {emails.map((email, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-300">Email {idx + 1}</span>
                                {emails.length > 1 && (
                                    <button
                                        onClick={() => removeEmail(idx)}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="From (e.g., john@client.com)"
                                    value={email.from}
                                    onChange={(e) => updateEmail(idx, 'from', e.target.value)}
                                    className="input-field text-sm py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Date"
                                    value={email.date}
                                    onChange={(e) => updateEmail(idx, 'date', e.target.value)}
                                    className="input-field text-sm py-2"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Subject"
                                value={email.subject}
                                onChange={(e) => updateEmail(idx, 'subject', e.target.value)}
                                className="input-field text-sm py-2"
                            />
                            <textarea
                                placeholder="Email body..."
                                value={email.body}
                                onChange={(e) => updateEmail(idx, 'body', e.target.value)}
                                rows={4}
                                className="input-field text-sm resize-none"
                            />
                        </div>
                    ))}

                    <button
                        onClick={addEmail}
                        className="w-full py-2 border border-dashed border-slate-600 text-slate-400 rounded-lg hover:border-slate-500 hover:text-slate-300 transition-colors text-sm"
                    >
                        + Add another email
                    </button>

                    <button
                        onClick={handleGenerateSummary}
                        disabled={isLoading || !emails.some(e => e.body.trim())}
                        className="w-full btn-primary bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                        {isLoading ? 'Generating...' : '✨ Generate Smart Summary'}
                    </button>
                </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                        Get AI-powered insights about this lead including score, recommendations, and suggested timeline.
                    </p>
                    <button
                        onClick={handleGenerateInsights}
                        disabled={isLoading}
                        className="w-full btn-primary bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                        {isLoading ? 'Analyzing...' : '💡 Generate Lead Insights'}
                    </button>
                </div>
            )}

            {/* Follow-up Tab */}
            {activeTab === 'followup' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                        Generate a personalized follow-up email for this lead based on their profile and history.
                    </p>
                    <button
                        onClick={handleGenerateFollowUp}
                        disabled={isLoading}
                        className="w-full btn-primary bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                        {isLoading ? 'Writing...' : '✉️ Generate Follow-up Email'}
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-purple-400">AI Response</span>
                        <button
                            onClick={() => navigator.clipboard.writeText(result.summary || result.insights || result.suggestion)}
                            className="text-xs text-slate-400 hover:text-white"
                        >
                            📋 Copy
                        </button>
                    </div>
                    <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {result.summary || result.insights || result.suggestion}
                    </div>
                    <p className="text-xs text-slate-600 mt-3">
                        Generated at {new Date(result.generatedAt).toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    );
}
