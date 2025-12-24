const { google } = require('googleapis');
const path = require('path');
const config = require('../config/env');

/**
 * Google Drive Service for file management
 */
class DriveService {
    constructor() {
        this.drive = null;
        this.rootFolderId = null;
        this.initialized = false;
    }

    /**
     * Initialize Drive API with service account
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const auth = new google.auth.GoogleAuth({
                credentials: config.google?.serviceAccountKey ?
                    JSON.parse(config.google.serviceAccountKey) : undefined,
                keyFile: config.google?.serviceAccountKeyPath,
                scopes: ['https://www.googleapis.com/auth/drive'],
            });

            this.drive = google.drive({ version: 'v3', auth });
            this.rootFolderId = config.google?.driveFolderId;
            this.initialized = true;
            console.log('Google Drive service initialized');
        } catch (error) {
            console.error('Failed to initialize Google Drive:', error.message);
        }
    }

    /**
     * Check if Drive is configured
     */
    isConfigured() {
        return this.initialized && !!this.drive;
    }

    /**
     * Create a folder in Drive
     */
    async createFolder(name, parentId = null) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        const fileMetadata = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId || this.rootFolderId],
        };

        const folder = await this.drive.files.create({
            resource: fileMetadata,
            fields: 'id, name, webViewLink',
        });

        return folder.data;
    }

    /**
     * Create client folder structure
     * Structure: /Clients/{ClientName}/[Documents, Invoices, Projects]
     */
    async createClientFolders(clientName, clientId) {
        if (!this.isConfigured()) {
            return null;
        }

        try {
            // Create main client folder
            const clientFolder = await this.createFolder(clientName);

            // Create subfolders
            const subfolders = ['Documents', 'Invoices', 'Projects', 'Contracts'];
            const folders = { main: clientFolder };

            for (const subfolder of subfolders) {
                const folder = await this.createFolder(subfolder, clientFolder.id);
                folders[subfolder.toLowerCase()] = folder;
            }

            return {
                clientId,
                folderId: clientFolder.id,
                folderUrl: clientFolder.webViewLink,
                subfolders: folders,
            };
        } catch (error) {
            console.error('Failed to create client folders:', error.message);
            throw error;
        }
    }

    /**
     * Upload file to Drive
     */
    async uploadFile(fileBuffer, fileName, mimeType, folderId) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        const { Readable } = require('stream');
        const fileStream = new Readable();
        fileStream.push(fileBuffer);
        fileStream.push(null);

        const fileMetadata = {
            name: fileName,
            parents: [folderId || this.rootFolderId],
        };

        const media = {
            mimeType,
            body: fileStream,
        };

        const file = await this.drive.files.create({
            resource: fileMetadata,
            media,
            fields: 'id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink',
        });

        return file.data;
    }

    /**
     * List files in a folder
     */
    async listFiles(folderId, pageToken = null) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        const response = await this.drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink)',
            pageSize: 50,
            pageToken,
            orderBy: 'modifiedTime desc',
        });

        return {
            files: response.data.files,
            nextPageToken: response.data.nextPageToken,
        };
    }

    /**
     * Get file details
     */
    async getFile(fileId) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        const file = await this.drive.files.get({
            fileId,
            fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, parents',
        });

        return file.data;
    }

    /**
     * Delete file
     */
    async deleteFile(fileId) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        await this.drive.files.delete({ fileId });
        return { success: true };
    }

    /**
     * Set file permissions
     */
    async setPermission(fileId, email, role = 'reader') {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        const permission = await this.drive.permissions.create({
            fileId,
            requestBody: {
                type: 'user',
                role, // 'reader', 'writer', 'commenter'
                emailAddress: email,
            },
            sendNotificationEmail: false,
        });

        return permission.data;
    }

    /**
     * Make file public (view only)
     */
    async makePublic(fileId) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        const permission = await this.drive.permissions.create({
            fileId,
            requestBody: {
                type: 'anyone',
                role: 'reader',
            },
        });

        return permission.data;
    }

    /**
     * Move file to folder
     */
    async moveFile(fileId, newFolderId) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        // Get current parents
        const file = await this.drive.files.get({
            fileId,
            fields: 'parents',
        });

        const previousParents = file.data.parents.join(',');

        // Move file
        const updatedFile = await this.drive.files.update({
            fileId,
            addParents: newFolderId,
            removeParents: previousParents,
            fields: 'id, name, webViewLink, parents',
        });

        return updatedFile.data;
    }

    /**
     * Search files
     */
    async searchFiles(query, folderId = null) {
        if (!this.isConfigured()) {
            throw new Error('Google Drive not configured');
        }

        let q = `name contains '${query}' and trashed = false`;
        if (folderId) {
            q = `'${folderId}' in parents and ${q}`;
        }

        const response = await this.drive.files.list({
            q,
            fields: 'files(id, name, mimeType, size, webViewLink, thumbnailLink)',
            pageSize: 20,
        });

        return response.data.files;
    }
}

module.exports = new DriveService();
