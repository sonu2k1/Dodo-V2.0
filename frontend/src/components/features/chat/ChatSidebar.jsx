import { useMemo } from 'react';
import { useChat } from '../../../contexts/ChatContext';

// Channel icons
const channelIcons = {
    general: '💬',
    design: '🎨',
    development: '💻',
    dev: '💻',
    random: '🎲',
    announcements: '📢',
};

export default function ChatSidebar({
    channels = [],
    directMessages = [],
    contextualRooms = [],
    onCreateChannel,
    onCreateDM,
}) {
    const { activeRoom, joinRoom, unreadCounts, onlineUsers } = useChat();

    // Group DMs by online status
    const sortedDMs = useMemo(() => {
        return [...directMessages].sort((a, b) => {
            const aOnline = a.otherUser && onlineUsers.has(a.otherUser.id);
            const bOnline = b.otherUser && onlineUsers.has(b.otherUser.id);
            if (aOnline && !bOnline) return -1;
            if (!aOnline && bOnline) return 1;
            return 0;
        });
    }, [directMessages, onlineUsers]);

    return (
        <div className="w-64 h-full bg-slate-900/95 border-r border-slate-700/50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm">
                        💬
                    </span>
                    DoDo Chat
                </h2>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* Channels */}
                <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Channels
                        </span>
                        {onCreateChannel && (
                            <button
                                onClick={onCreateChannel}
                                className="text-slate-500 hover:text-white transition-colors"
                                title="Create channel"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="space-y-0.5">
                        {channels.map((channel) => {
                            const isActive = activeRoom?.id === channel.id;
                            const unread = unreadCounts[channel.id] || 0;
                            const icon = channelIcons[channel.name] || '#';

                            return (
                                <button
                                    key={channel.id}
                                    onClick={() => joinRoom(channel)}
                                    className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left
                    transition-all duration-150
                    ${isActive
                                            ? 'bg-indigo-600/30 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }
                  `}
                                >
                                    <span className="text-lg opacity-75">{icon}</span>
                                    <span className="flex-1 truncate font-medium">
                                        {channel.name}
                                    </span>
                                    {unread > 0 && (
                                        <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500 text-white">
                                            {unread > 99 ? '99+' : unread}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Contextual Rooms (Project/Task linked) */}
                {contextualRooms.length > 0 && (
                    <div className="p-3 border-t border-slate-800">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            Project Chats
                        </span>
                        <div className="space-y-0.5">
                            {contextualRooms.map((room) => {
                                const isActive = activeRoom?.id === room.id;
                                const unread = unreadCounts[room.id] || 0;

                                return (
                                    <button
                                        key={room.id}
                                        onClick={() => joinRoom(room)}
                                        className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left
                      transition-all duration-150
                      ${isActive
                                                ? 'bg-cyan-600/30 text-white'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }
                    `}
                                    >
                                        <span className="text-lg">📁</span>
                                        <span className="flex-1 truncate">{room.name || 'Project Chat'}</span>
                                        {unread > 0 && (
                                            <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-cyan-500 text-white">
                                                {unread}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Direct Messages */}
                <div className="p-3 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Direct Messages
                        </span>
                        {onCreateDM && (
                            <button
                                onClick={onCreateDM}
                                className="text-slate-500 hover:text-white transition-colors"
                                title="New message"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="space-y-0.5">
                        {sortedDMs.map((dm) => {
                            const isActive = activeRoom?.id === dm.id;
                            const unread = unreadCounts[dm.id] || 0;
                            const otherUser = dm.otherUser;
                            const isOnline = otherUser && onlineUsers.has(otherUser.id);

                            return (
                                <button
                                    key={dm.id}
                                    onClick={() => joinRoom(dm)}
                                    className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left
                    transition-all duration-150
                    ${isActive
                                            ? 'bg-slate-700/50 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }
                  `}
                                >
                                    {/* Avatar with online indicator */}
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                            {otherUser?.avatar_url ? (
                                                <img src={otherUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                otherUser?.full_name?.charAt(0) || '?'
                                            )}
                                        </div>
                                        {isOnline && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                                        )}
                                    </div>

                                    <span className="flex-1 truncate">
                                        {otherUser?.full_name || 'Unknown User'}
                                    </span>

                                    {unread > 0 && (
                                        <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500 text-white">
                                            {unread}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {sortedDMs.length === 0 && (
                            <p className="text-sm text-slate-600 text-center py-4">
                                No conversations yet
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Connection status */}
            <div className="p-3 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${true ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></span>
                    <span className="text-slate-500">
                        {true ? 'Connected' : 'Reconnecting...'}
                    </span>
                </div>
            </div>
        </div>
    );
}
