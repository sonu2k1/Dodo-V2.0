const express = require('express');
const multer = require('multer');
const driveService = require('../services/drive.service');
const fileService = require('../services/file.service');
const { authenticate, requireRoles } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const { ROLES } = require('../config/rbac');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
});

// Initialize Drive service
driveService.initialize();

/**
 * POST /files/upload
 * Upload file to Google Drive and save reference
 */
router.post('/upload',
    authenticate,
    upload.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }

        const { entityType, entityId, folderId } = req.body;

        if (!driveService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'Google Drive not configured'
            });
        }

        // Upload to Drive
        const driveFile = await driveService.uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            folderId
        );

        // Save reference in database
        const fileRecord = await fileService.saveFileReference({
            ...driveFile,
            folderId,
            entityType,
            entityId,
        }, req.user.id);

        res.status(201).json({ success: true, data: fileRecord });
    })
);

/**
 * GET /files/entity/:type/:id
 * Get files for an entity (client, project, task)
 */
router.get('/entity/:type/:id', authenticate, asyncHandler(async (req, res) => {
    const { type, id } = req.params;

    const files = await fileService.getEntityFiles(type, id, req.user.id, req.user.role);
    res.json({ success: true, data: files });
}));

/**
 * GET /files/recent
 * Get recent files
 */
router.get('/recent', authenticate, asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const files = await fileService.getRecentFiles(req.user.id, limit);
    res.json({ success: true, data: files });
}));

/**
 * GET /files/search
 * Search files
 */
router.get('/search', authenticate, asyncHandler(async (req, res) => {
    const { q, entityType, entityId } = req.query;

    if (!q || q.length < 2) {
        return res.status(400).json({ success: false, message: 'Query too short' });
    }

    const files = await fileService.searchFiles(q, entityType, entityId);
    res.json({ success: true, data: files });
}));

/**
 * GET /files/:id
 * Get file details
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const file = await fileService.getFile(req.params.id);

    if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check access
    const canAccess = await fileService.canAccessFile(req.params.id, req.user.id, req.user.role);
    if (!canAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: file });
}));

/**
 * PATCH /files/:id/visibility
 * Update file visibility for clients
 */
router.patch('/:id/visibility',
    authenticate,
    requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE),
    asyncHandler(async (req, res) => {
        const { isVisibleToClient } = req.body;

        const file = await fileService.updateVisibility(
            req.params.id,
            isVisibleToClient,
            req.user.id
        );

        res.json({ success: true, data: file });
    })
);

/**
 * DELETE /files/:id
 * Delete file
 */
router.delete('/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const { deleteFromDrive } = req.query;

        await fileService.deleteFile(
            req.params.id,
            req.user.id,
            deleteFromDrive === 'true'
        );

        res.json({ success: true, message: 'File deleted' });
    })
);

// ======= CLIENT FOLDERS =======

/**
 * POST /files/client/:clientId/folder
 * Create client folder structure in Drive
 */
router.post('/client/:clientId/folder',
    authenticate,
    requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const { clientName } = req.body;

        if (!driveService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'Google Drive not configured'
            });
        }

        // Check if folder already exists
        const existing = await fileService.getClientFolder(clientId);
        if (existing) {
            return res.json({ success: true, data: existing, message: 'Folder already exists' });
        }

        // Create folders in Drive
        const folders = await driveService.createClientFolders(clientName, clientId);

        // Save reference
        const record = await fileService.saveClientFolder(clientId, folders);

        res.status(201).json({ success: true, data: record });
    })
);

/**
 * GET /files/client/:clientId/folder
 * Get client folder info
 */
router.get('/client/:clientId/folder', authenticate, asyncHandler(async (req, res) => {
    const folder = await fileService.getClientFolder(req.params.clientId);

    if (!folder) {
        return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    res.json({ success: true, data: folder });
}));

/**
 * GET /files/drive/list/:folderId
 * List files directly from Drive folder
 */
router.get('/drive/list/:folderId',
    authenticate,
    asyncHandler(async (req, res) => {
        if (!driveService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'Google Drive not configured'
            });
        }

        const { pageToken } = req.query;
        const result = await driveService.listFiles(req.params.folderId, pageToken);
        res.json({ success: true, data: result });
    })
);

module.exports = router;
