import { useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

// Format timestamp for display
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Group messages by date
const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;

    messages.forEach(msg => {
        const msgDate = new Date(msg.created_at).toDateString();
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            groups.push({ type: 'date', date: msg.created_at });
        }
        groups.push({ type: 'message', ...msg });
    });

    return groups;
};

export default function MessageList({
    messages = [],
    typingUsers = [],
    onLoadMore,
    onEditMessage,
    onDeleteMessage,
    onReply,
}) {
    const { user } = useAuth();
    const containerRef = useRef(null);
    const bottomRef = useRef(null);

    // Group messages by date
    const groupedItems = useMemo(() => groupMessagesByDate(messages), [messages]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length]);

    const renderDateDivider = (date) => (
        <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-slate-700/50"></div>
            <span className="text-xs font-medium text-slate-500 px-3 py-1 rounded-full bg-slate-800">
                {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })}
            </span>
            <div className="flex-1 h-px bg-slate-700/50"></div>
        </div>
    );

    const renderMessage = (message) => {
        const isOwnMessage = message.sender_id === user?.id;
        const sender = message.sender;

        return (
            <div
                key={message.id}
                className={`group flex gap-3 px-4 py-1.5 hover:bg-slate-800/30 transition-colors ${message._optimistic ? 'opacity-60' : ''
                    }`}
            >
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {sender?.avatar_url ? (
                            <img src={sender.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                        ) : (
                            sender?.full_name?.charAt(0) || '?'
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-baseline gap-2 mb-0.5">
                        <span className={`font-semibold text-sm ${isOwnMessage ? 'text-indigo-400' : 'text-white'}`}>
                            {sender?.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-slate-500">
                            {formatTime(message.created_at)}
                        </span>
                        {message.is_edited && (
                            <span className="text-xs text-slate-600">(edited)</span>
                        )}
                    </div>

                    {/* Reply preview */}
                    {message.reply_to && (
                        <div className="mb-1 pl-3 border-l-2 border-slate-600 text-sm">
                            <span className="text-slate-500">
                                Replying to <span className="text-slate-400">{message.reply_to.sender?.full_name}</span>
                            </span>
                            <p className="text-slate-500 truncate">{message.reply_to.content}</p>
                        </div>
                    )}

                    {/* Message content */}
                    {message.message_type === 'system' ? (
                        <p className="text-sm text-slate-500 italic">{message.content}</p>
                    ) : (
                        <p className="text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    )}

                    {/* File attachment */}
                    {message.file_url && (
                        <div className="mt-2">
                            <a
                                href={message.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span className="text-sm">Attachment</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {message.message_type !== 'system' && (
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                            <button
                                onClick={() => onReply?.(message)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                title="Reply"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                            </button>
                            {isOwnMessage && (
                                <>
                                    <button
                                        onClick={() => onEditMessage?.(message)}
                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDeleteMessage?.(message.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto"
        >
            {/* Load more button */}
            {messages.length >= 50 && (
                <div className="text-center py-4">
                    <button
                        onClick={() => onLoadMore?.(messages[0]?.created_at)}
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Load earlier messages
                    </button>
                </div>
            )}

            {/* Messages */}
            {groupedItems.map((item, idx) =>
                item.type === 'date'
                    ? <div key={`date-${idx}`}>{renderDateDivider(item.date)}</div>
                    : renderMessage(item)
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
                <div className="px-4 py-2 flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {typingUsers.slice(0, 3).map((u, idx) => (
                            <div
                                key={idx}
                                className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-xs text-white"
                            >
                                {u.full_name?.charAt(0)}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-slate-400">
                            {typingUsers.length === 1
                                ? `${typingUsers[0].full_name} is typing`
                                : `${typingUsers.length} people are typing`
                            }
                        </span>
                        <span className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                        <span className="text-3xl">💬</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">No messages yet</h3>
                    <p className="text-sm text-slate-400">Be the first to send a message!</p>
                </div>
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
        </div>
    );
}
