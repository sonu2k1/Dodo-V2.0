import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import socketClient from '../lib/socket';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState({});
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [unreadCounts, setUnreadCounts] = useState({});

    // Connect socket when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const socket = socketClient.connect(token);

                socket.on('connect', () => setIsConnected(true));
                socket.on('disconnect', () => setIsConnected(false));

                // Message events
                socket.on('message:new', handleNewMessage);
                socket.on('message:updated', handleMessageUpdated);
                socket.on('message:deleted', handleMessageDeleted);
                socket.on('messages:fetched', handleMessagesFetched);

                // Room events
                socket.on('room:joined', handleRoomJoined);
                socket.on('room:new', handleNewRoom);

                // Typing events
                socket.on('typing:started', handleTypingStarted);
                socket.on('typing:stopped', handleTypingStopped);

                // Online status
                socket.on('user:online', ({ userId }) => {
                    setOnlineUsers(prev => new Set([...prev, userId]));
                });
                socket.on('user:offline', ({ userId }) => {
                    setOnlineUsers(prev => {
                        const next = new Set(prev);
                        next.delete(userId);
                        return next;
                    });
                });

                // DM created
                socket.on('dm:created', handleNewRoom);

                return () => {
                    socketClient.disconnect();
                };
            }
        }
    }, [isAuthenticated, user]);

    // ======= EVENT HANDLERS =======

    const handleNewMessage = useCallback((message) => {
        setMessages(prev => ({
            ...prev,
            [message.room_id]: [...(prev[message.room_id] || []), message],
        }));

        // Update unread count if not in active room
        if (message.room_id !== activeRoom?.id && message.sender_id !== user?.id) {
            setUnreadCounts(prev => ({
                ...prev,
                [message.room_id]: (prev[message.room_id] || 0) + 1,
            }));
        }
    }, [activeRoom, user]);

    const handleMessageUpdated = useCallback((message) => {
        setMessages(prev => ({
            ...prev,
            [message.room_id]: prev[message.room_id]?.map(m =>
                m.id === message.id ? message : m
            ) || [],
        }));
    }, []);

    const handleMessageDeleted = useCallback(({ messageId, roomId }) => {
        setMessages(prev => ({
            ...prev,
            [roomId]: prev[roomId]?.filter(m => m.id !== messageId) || [],
        }));
    }, []);

    const handleMessagesFetched = useCallback(({ roomId, messages: fetchedMessages }) => {
        setMessages(prev => ({
            ...prev,
            [roomId]: fetchedMessages,
        }));
    }, []);

    const handleRoomJoined = useCallback(({ roomId }) => {
        console.log('Joined room:', roomId);
    }, []);

    const handleNewRoom = useCallback((room) => {
        setRooms(prev => [...prev, room]);
    }, []);

    const handleTypingStarted = useCallback(({ roomId, user: typingUser }) => {
        setTypingUsers(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []).filter(u => u.id !== typingUser.id), typingUser],
        }));

        // Auto-remove after 3 seconds
        setTimeout(() => {
            setTypingUsers(prev => ({
                ...prev,
                [roomId]: (prev[roomId] || []).filter(u => u.id !== typingUser.id),
            }));
        }, 3000);
    }, []);

    const handleTypingStopped = useCallback(({ roomId, userId }) => {
        setTypingUsers(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || []).filter(u => u.id !== userId),
        }));
    }, []);

    // ======= ACTIONS =======

    const joinRoom = useCallback((room) => {
        setActiveRoom(room);
        socketClient.joinRoom(room.id);
        socketClient.fetchMessages(room.id);
        socketClient.markAsRead(room.id);

        // Clear unread count
        setUnreadCounts(prev => ({ ...prev, [room.id]: 0 }));
    }, []);

    const sendMessage = useCallback((content, options = {}) => {
        if (activeRoom) {
            socketClient.sendMessage(activeRoom.id, content, options);
        }
    }, [activeRoom]);

    const editMessage = useCallback((messageId, content) => {
        socketClient.editMessage(messageId, content);
    }, []);

    const deleteMessage = useCallback((messageId) => {
        socketClient.deleteMessage(messageId);
    }, []);

    const startTyping = useCallback(() => {
        if (activeRoom) {
            socketClient.startTyping(activeRoom.id);
        }
    }, [activeRoom]);

    const stopTyping = useCallback(() => {
        if (activeRoom) {
            socketClient.stopTyping(activeRoom.id);
        }
    }, [activeRoom]);

    const createDirectMessage = useCallback((targetUserId) => {
        socketClient.createDM(targetUserId);
    }, []);

    const loadMoreMessages = useCallback((before) => {
        if (activeRoom) {
            socketClient.fetchMessages(activeRoom.id, { before });
        }
    }, [activeRoom]);

    const value = {
        isConnected,
        rooms,
        setRooms,
        activeRoom,
        setActiveRoom,
        messages,
        typingUsers,
        onlineUsers,
        unreadCounts,
        joinRoom,
        sendMessage,
        editMessage,
        deleteMessage,
        startTyping,
        stopTyping,
        createDirectMessage,
        loadMoreMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext;
