import { useState, useEffect, useCallback } from 'react';
import { ChatProvider, useChat } from '../contexts/ChatContext';
import ChatSidebar from '../components/features/chat/ChatSidebar';
import MessageList from '../components/features/chat/MessageList';
import MessageInput from '../components/features/chat/MessageInput';

// Sample data for demo (will be replaced by API)
const sampleChannels = [
    { id: 'ch-1', name: 'general', is_group: true },
    { id: 'ch-2', name: 'design', is_group: true },
    { id: 'ch-3', name: 'development', is_group: true },
    { id: 'ch-4', name: 'random', is_group: true },
];

const sampleDMs = [
    { id: 'dm-1', is_group: false, otherUser: { id: 'u1', full_name: 'Alice Johnson', avatar_url: null } },
    { id: 'dm-2', is_group: false, otherUser: { id: 'u2', full_name: 'Bob Smith', avatar_url: null } },
];

const sampleMessages = [
    {
        id: 'm1',
        room_id: 'ch-1',
        content: 'Hey everyone! Welcome to the general channel 👋',
        sender_id: 'u1',
        sender: { id: 'u1', full_name: 'Alice Johnson' },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        message_type: 'text'
    },
    {
        id: 'm2',
        room_id: 'ch-1',
        content: 'Thanks Alice! Excited to be here.',
        sender_id: 'u2',
        sender: { id: 'u2', full_name: 'Bob Smith' },
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        message_type: 'text'
    },
    {
        id: 'm3',
        room_id: 'ch-1',
        content: 'Just pushed the latest updates to the design system. Let me know if you have any questions! 🎨',
        sender_id: 'u1',
        sender: { id: 'u1', full_name: 'Alice Johnson' },
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        message_type: 'text'
    },
];

// Inner component that uses chat context
function ChatPageInner() {
    const {
        activeRoom,
        messages,
        typingUsers,
        joinRoom,
        sendMessage,
        editMessage,
        deleteMessage,
        startTyping,
        stopTyping,
        loadMoreMessages,
    } = useChat();

    const [rooms, setRooms] = useState({
        channels: sampleChannels,
        dms: sampleDMs,
        contextual: [],
    });

    const [localMessages, setLocalMessages] = useState(sampleMessages);
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    // Set default active room
    useEffect(() => {
        if (!activeRoom && rooms.channels.length > 0) {
            joinRoom(rooms.channels[0]);
        }
    }, [activeRoom, rooms.channels, joinRoom]);

    // Get messages for active room (demo: from local state or context)
    const currentMessages = activeRoom
        ? (messages[activeRoom.id] || localMessages.filter(m => m.room_id === activeRoom.id))
        : [];

    const currentTypingUsers = activeRoom
        ? (typingUsers[activeRoom.id] || [])
        : [];

    // Handle send message (demo: add to local state)
    const handleSendMessage = useCallback((content, options) => {
        if (options.isEdit && options.editMessageId) {
            // Edit existing message
            setLocalMessages(prev => prev.map(m =>
                m.id === options.editMessageId
                    ? { ...m, content, is_edited: true, updated_at: new Date().toISOString() }
                    : m
            ));
            editMessage(options.editMessageId, content);
        } else {
            // New message
            const newMessage = {
                id: `m-${Date.now()}`,
                room_id: activeRoom.id,
                content,
                sender_id: 'current-user',
                sender: { id: 'current-user', full_name: 'You' },
                created_at: new Date().toISOString(),
                message_type: 'text',
                reply_to_id: options.replyToId,
                reply_to: options.replyToId
                    ? localMessages.find(m => m.id === options.replyToId)
                    : null,
            };
            setLocalMessages(prev => [...prev, newMessage]);
            sendMessage(content, options);
        }
    }, [activeRoom, sendMessage, editMessage, localMessages]);

    // Handle delete message
    const handleDeleteMessage = useCallback((messageId) => {
        setLocalMessages(prev => prev.filter(m => m.id !== messageId));
        deleteMessage(messageId);
    }, [deleteMessage]);

    // Handle typing
    const handleTyping = useCallback((isTyping) => {
        if (isTyping) {
            startTyping();
        } else {
            stopTyping();
        }
    }, [startTyping, stopTyping]);

    // Create new DM modal (placeholder)
    const handleCreateDM = useCallback(() => {
        // Would open a user selection modal
        console.log('Create DM');
    }, []);

    return (
        <div className="h-screen flex bg-slate-900">
            {/* Sidebar */}
            <ChatSidebar
                channels={rooms.channels}
                directMessages={rooms.dms}
                contextualRooms={rooms.contextual}
                onCreateDM={handleCreateDM}
            />

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
                {activeRoom ? (
                    <>
                        {/* Header */}
                        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">
                                    {activeRoom.is_group ? '💬' : '👤'}
                                </span>
                                <div>
                                    <h2 className="font-semibold text-white">
                                        {activeRoom.is_group
                                            ? `#${activeRoom.name}`
                                            : activeRoom.otherUser?.full_name || 'Direct Message'
                                        }
                                    </h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <MessageList
                            messages={currentMessages}
                            typingUsers={currentTypingUsers}
                            onLoadMore={loadMoreMessages}
                            onEditMessage={setEditingMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onReply={setReplyTo}
                        />

                        {/* Input */}
                        <MessageInput
                            onSend={handleSendMessage}
                            onTyping={handleTyping}
                            replyTo={replyTo}
                            onCancelReply={() => setReplyTo(null)}
                            editMessage={editingMessage}
                            onCancelEdit={() => setEditingMessage(null)}
                        />
                    </>
                ) : (
                    /* No room selected */
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                            <span className="text-4xl">💬</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Welcome to DoDo Chat</h2>
                        <p className="text-slate-400 max-w-md">
                            Select a channel or start a direct message to begin chatting with your team.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main page component with provider
export default function ChatPage() {
    return (
        <ChatProvider>
            <ChatPageInner />
        </ChatProvider>
    );
}
