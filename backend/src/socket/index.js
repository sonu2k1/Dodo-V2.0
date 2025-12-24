const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { supabaseAdmin } = require('../config/database');
const chatService = require('../services/chat.service');

/**
 * Socket.io server setup with authentication and event handlers
 */
function setupSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: config.frontendUrl,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token ||
                socket.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return next(new Error('Authentication required'));
            }

            // Verify JWT
            const decoded = jwt.verify(token, config.jwt.secret);

            // Get user from database
            const { data: user, error } = await supabaseAdmin
                .from('users')
                .select('id, email, full_name, role, avatar_url, is_active')
                .eq('id', decoded.sub)
                .single();

            if (error || !user || !user.is_active) {
                return next(new Error('Invalid user'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.full_name} (${socket.id})`);

        // Join user's personal room for DMs
        socket.join(`user:${socket.user.id}`);

        // Get user's rooms and join them
        const rooms = await chatService.getUserRooms(socket.user.id);
        rooms.forEach(room => {
            socket.join(`room:${room.id}`);
        });

        // Update online status
        await chatService.setUserOnline(socket.user.id, true);
        io.emit('user:online', { userId: socket.user.id });

        // ======= EVENT HANDLERS =======

        /**
         * Join a chat room
         */
        socket.on('room:join', async ({ roomId }) => {
            try {
                const canJoin = await chatService.canAccessRoom(socket.user.id, roomId, socket.user.role);
                if (canJoin) {
                    socket.join(`room:${roomId}`);
                    await chatService.addRoomMember(roomId, socket.user.id);
                    socket.emit('room:joined', { roomId });
                } else {
                    socket.emit('error', { message: 'Cannot join this room' });
                }
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        /**
         * Leave a chat room
         */
        socket.on('room:leave', async ({ roomId }) => {
            socket.leave(`room:${roomId}`);
            await chatService.removeRoomMember(roomId, socket.user.id);
            socket.emit('room:left', { roomId });
        });

        /**
         * Send a message
         */
        socket.on('message:send', async ({ roomId, content, messageType = 'text', replyToId = null }) => {
            try {
                // Validate access
                const canAccess = await chatService.canAccessRoom(socket.user.id, roomId, socket.user.role);
                if (!canAccess) {
                    return socket.emit('error', { message: 'Access denied' });
                }

                // Save message to database
                const message = await chatService.createMessage({
                    roomId,
                    senderId: socket.user.id,
                    content,
                    messageType,
                    replyToId,
                });

                // Add sender info for broadcast
                const fullMessage = {
                    ...message,
                    sender: {
                        id: socket.user.id,
                        full_name: socket.user.full_name,
                        avatar_url: socket.user.avatar_url,
                    },
                };

                // Broadcast to room
                io.to(`room:${roomId}`).emit('message:new', fullMessage);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        /**
         * Edit a message
         */
        socket.on('message:edit', async ({ messageId, content }) => {
            try {
                const message = await chatService.editMessage(messageId, socket.user.id, content);
                if (message) {
                    io.to(`room:${message.room_id}`).emit('message:updated', message);
                }
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        /**
         * Delete a message
         */
        socket.on('message:delete', async ({ messageId }) => {
            try {
                const message = await chatService.deleteMessage(messageId, socket.user.id);
                if (message) {
                    io.to(`room:${message.room_id}`).emit('message:deleted', { messageId, roomId: message.room_id });
                }
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        /**
         * Typing indicator
         */
        socket.on('typing:start', ({ roomId }) => {
            socket.to(`room:${roomId}`).emit('typing:started', {
                roomId,
                user: { id: socket.user.id, full_name: socket.user.full_name },
            });
        });

        socket.on('typing:stop', ({ roomId }) => {
            socket.to(`room:${roomId}`).emit('typing:stopped', {
                roomId,
                userId: socket.user.id,
            });
        });

        /**
         * Mark messages as read
         */
        socket.on('messages:read', async ({ roomId }) => {
            await chatService.markMessagesRead(roomId, socket.user.id);
        });

        /**
         * Create direct message room
         */
        socket.on('dm:create', async ({ targetUserId }) => {
            try {
                const room = await chatService.getOrCreateDirectMessage(socket.user.id, targetUserId);
                socket.join(`room:${room.id}`);

                // Also add target user to room if online
                io.to(`user:${targetUserId}`).emit('room:new', room);
                socket.emit('dm:created', room);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        /**
         * Get room messages with pagination
         */
        socket.on('messages:fetch', async ({ roomId, before, limit = 50 }) => {
            try {
                const canAccess = await chatService.canAccessRoom(socket.user.id, roomId, socket.user.role);
                if (!canAccess) {
                    return socket.emit('error', { message: 'Access denied' });
                }

                const messages = await chatService.getRoomMessages(roomId, { before, limit });
                socket.emit('messages:fetched', { roomId, messages });
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        /**
         * Disconnect handler
         */
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.full_name}`);
            await chatService.setUserOnline(socket.user.id, false);
            io.emit('user:offline', { userId: socket.user.id });
        });
    });

    return io;
}

module.exports = { setupSocketServer };
