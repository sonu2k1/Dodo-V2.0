import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

/**
 * Socket.io client singleton
 */
class SocketClient {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Connect to socket server
     */
    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.reconnectAttempts++;
        });

        return this.socket;
    }

    /**
     * Disconnect from socket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Get socket instance
     */
    getSocket() {
        return this.socket;
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.socket?.connected || false;
    }

    // ======= ROOM OPERATIONS =======

    joinRoom(roomId) {
        this.socket?.emit('room:join', { roomId });
    }

    leaveRoom(roomId) {
        this.socket?.emit('room:leave', { roomId });
    }

    // ======= MESSAGE OPERATIONS =======

    sendMessage(roomId, content, options = {}) {
        this.socket?.emit('message:send', {
            roomId,
            content,
            messageType: options.messageType || 'text',
            replyToId: options.replyToId || null,
        });
    }

    editMessage(messageId, content) {
        this.socket?.emit('message:edit', { messageId, content });
    }

    deleteMessage(messageId) {
        this.socket?.emit('message:delete', { messageId });
    }

    fetchMessages(roomId, options = {}) {
        this.socket?.emit('messages:fetch', {
            roomId,
            before: options.before,
            limit: options.limit || 50,
        });
    }

    // ======= TYPING INDICATORS =======

    startTyping(roomId) {
        this.socket?.emit('typing:start', { roomId });
    }

    stopTyping(roomId) {
        this.socket?.emit('typing:stop', { roomId });
    }

    // ======= DIRECT MESSAGES =======

    createDM(targetUserId) {
        this.socket?.emit('dm:create', { targetUserId });
    }

    // ======= READ STATUS =======

    markAsRead(roomId) {
        this.socket?.emit('messages:read', { roomId });
    }

    // ======= EVENT LISTENERS =======

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        this.socket?.on(event, callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        this.socket?.off(event, callback);
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Re-attach listeners after reconnection
    reattachListeners() {
        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                this.socket?.on(event, callback);
            });
        });
    }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;
