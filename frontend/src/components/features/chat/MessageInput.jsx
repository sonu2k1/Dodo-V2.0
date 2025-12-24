import { useState, useRef, useCallback, useEffect } from 'react';

export default function MessageInput({
    onSend,
    onTyping,
    replyTo,
    onCancelReply,
    editMessage,
    onCancelEdit,
    disabled = false,
}) {
    const [content, setContent] = useState('');
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Focus textarea when reply or edit changes
    useEffect(() => {
        if (replyTo || editMessage) {
            textareaRef.current?.focus();
            if (editMessage) {
                setContent(editMessage.content);
            }
        }
    }, [replyTo, editMessage]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }
    }, [content]);

    const handleChange = (e) => {
        setContent(e.target.value);

        // Typing indicator with debounce
        if (onTyping) {
            onTyping(true);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 2000);
        }
    };

    const handleSubmit = useCallback((e) => {
        e?.preventDefault();

        const trimmedContent = content.trim();
        if (!trimmedContent || disabled) return;

        onSend(trimmedContent, {
            replyToId: replyTo?.id,
            isEdit: !!editMessage,
            editMessageId: editMessage?.id,
        });

        setContent('');
        onCancelReply?.();
        onCancelEdit?.();

        // Stop typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        onTyping?.(false);
    }, [content, disabled, onSend, replyTo, editMessage, onCancelReply, onCancelEdit, onTyping]);

    const handleKeyDown = (e) => {
        // Submit on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }

        // Cancel on Escape
        if (e.key === 'Escape') {
            if (replyTo) onCancelReply?.();
            if (editMessage) {
                onCancelEdit?.();
                setContent('');
            }
        }
    };

    return (
        <div className="border-t border-slate-700/50 bg-slate-900/50">
            {/* Reply/Edit indicator */}
            {(replyTo || editMessage) && (
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        {replyTo ? (
                            <>
                                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                <span className="text-slate-400">
                                    Replying to <span className="text-white">{replyTo.sender?.full_name}</span>
                                </span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="text-slate-400">Editing message</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={replyTo ? onCancelReply : onCancelEdit}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex items-end gap-3">
                    {/* Attachment button */}
                    <button
                        type="button"
                        className="shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Attach file"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>

                    {/* Text input */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            disabled={disabled}
                            rows={1}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700/50 rounded-xl
                         text-white placeholder-slate-400 resize-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
                            style={{ maxHeight: '200px' }}
                        />
                    </div>

                    {/* Emoji button */}
                    <button
                        type="button"
                        className="shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Add emoji"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    {/* Send button */}
                    <button
                        type="submit"
                        disabled={!content.trim() || disabled}
                        className="shrink-0 p-3 rounded-xl bg-indigo-600 text-white
                       hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>

                {/* Keyboard hint */}
                <div className="flex justify-end mt-2">
                    <span className="text-xs text-slate-600">
                        <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> to send,
                        <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 ml-1">Shift + Enter</kbd> for new line
                    </span>
                </div>
            </form>
        </div>
    );
}
