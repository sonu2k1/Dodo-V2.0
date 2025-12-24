const express = require('express');
const chatService = require('../services/chat.service');
const { authenticate, requireRoles } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const { ROLES } = require('../config/rbac');

const router = express.Router();

/**
 * GET /chat/rooms
 * Get all rooms for current user
 */
router.get('/rooms', authenticate, asyncHandler(async (req, res) => {
    const rooms = await chatService.getUserRooms(req.user.id);
    res.json({ success: true, data: rooms });
}));

/**
 * GET /chat/channels
 * Get all public channels
 */
router.get('/channels', authenticate, asyncHandler(async (req, res) => {
    const channels = await chatService.getChannels();
    res.json({ success: true, data: channels });
}));

/**
 * POST /chat/rooms
 * Create a new room
 */
router.post('/rooms', authenticate, asyncHandler(async (req, res) => {
    const { name, projectId, isGroup } = req.body;

    const room = await chatService.createRoom({
        name,
        projectId,
        isGroup: isGroup !== false,
        createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: room });
}));

/**
 * GET /chat/rooms/:roomId/messages
 * Get messages for a room
 */
router.get('/rooms/:roomId/messages', authenticate, asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { before, limit } = req.query;

    const canAccess = await chatService.canAccessRoom(req.user.id, roomId, req.user.role);
    if (!canAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await chatService.getRoomMessages(roomId, {
        before,
        limit: parseInt(limit) || 50,
    });

    res.json({ success: true, data: messages });
}));

/**
 * POST /chat/rooms/:roomId/join
 * Join a room
 */
router.post('/rooms/:roomId/join', authenticate, asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    await chatService.addRoomMember(roomId, req.user.id);
    res.json({ success: true, message: 'Joined room' });
}));

/**
 * POST /chat/rooms/:roomId/leave
 * Leave a room
 */
router.post('/rooms/:roomId/leave', authenticate, asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    await chatService.removeRoomMember(roomId, req.user.id);
    res.json({ success: true, message: 'Left room' });
}));

/**
 * POST /chat/dm/:userId
 * Get or create DM with user
 */
router.post('/dm/:userId', authenticate, asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const room = await chatService.getOrCreateDirectMessage(req.user.id, userId);
    res.json({ success: true, data: room });
}));

/**
 * GET /chat/project/:projectId
 * Get or create project chat room
 */
router.get('/project/:projectId', authenticate, asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const rooms = await chatService.getContextualRooms(projectId);
    res.json({ success: true, data: rooms });
}));

/**
 * POST /chat/init-defaults
 * Initialize default channels (Admin only)
 */
router.post('/init-defaults',
    authenticate,
    requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        await chatService.createDefaultChannels(req.user.id);
        res.json({ success: true, message: 'Default channels created' });
    })
);

module.exports = router;
