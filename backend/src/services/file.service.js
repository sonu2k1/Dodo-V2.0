const { supabaseAdmin } = require('../config/database');
const driveService = require('./drive.service');

/**
 * File Management Service - Links files stored in Drive to database
 */
class FileService {
    /**
     * Save file reference to database
     */
    async saveFileReference(fileData, uploadedBy) {
        const { data, error } = await supabaseAdmin
            .from('files')
            .insert({
                drive_file_id: fileData.id,
                name: fileData.name,
                mime_type: fileData.mimeType,
                size: parseInt(fileData.size) || 0,
                drive_url: fileData.webViewLink,
                download_url: fileData.webContentLink,
                thumbnail_url: fileData.thumbnailLink,
                folder_id: fileData.folderId,
                entity_type: fileData.entityType, // 'client', 'project', 'task'
                entity_id: fileData.entityId,
                uploaded_by: uploadedBy,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get files for an entity
     */
    async getEntityFiles(entityType, entityId, userId, userRole) {
        let query = supabaseAdmin
            .from('files')
            .select(`
        *,
        uploader:users!uploaded_by (
          id,
          full_name
        )
      `)
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false });

        // Role-based filtering for clients
        if (entityType === 'client' && userRole === 'client') {
            query = query.eq('is_visible_to_client', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Get file by ID
     */
    async getFile(fileId) {
        const { data, error } = await supabaseAdmin
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update file visibility
     */
    async updateVisibility(fileId, isVisibleToClient, userId) {
        const { data, error } = await supabaseAdmin
            .from('files')
            .update({
                is_visible_to_client: isVisibleToClient,
                updated_at: new Date().toISOString(),
            })
            .eq('id', fileId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete file reference (and optionally from Drive)
     */
    async deleteFile(fileId, userId, deleteFromDrive = false) {
        const file = await this.getFile(fileId);

        if (deleteFromDrive && file.drive_file_id) {
            try {
                await driveService.deleteFile(file.drive_file_id);
            } catch (err) {
                console.error('Failed to delete from Drive:', err.message);
            }
        }

        const { error } = await supabaseAdmin
            .from('files')
            .delete()
            .eq('id', fileId);

        if (error) throw error;
        return { success: true };
    }

    /**
     * Save client folder reference
     */
    async saveClientFolder(clientId, folderData) {
        const { data, error } = await supabaseAdmin
            .from('client_folders')
            .upsert({
                client_id: clientId,
                drive_folder_id: folderData.folderId,
                folder_url: folderData.folderUrl,
                documents_folder_id: folderData.subfolders.documents?.id,
                invoices_folder_id: folderData.subfolders.invoices?.id,
                projects_folder_id: folderData.subfolders.projects?.id,
                contracts_folder_id: folderData.subfolders.contracts?.id,
            }, { onConflict: 'client_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get client folder
     */
    async getClientFolder(clientId) {
        const { data, error } = await supabaseAdmin
            .from('client_folders')
            .select('*')
            .eq('client_id', clientId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    /**
     * Check user access to file
     */
    async canAccessFile(fileId, userId, userRole) {
        const file = await this.getFile(fileId);

        // Admins can access all
        if (['super_admin', 'admin'].includes(userRole)) {
            return true;
        }

        // Clients can only access visible files for their entity
        if (userRole === 'client') {
            return file.is_visible_to_client;
        }

        // Employees can access files they uploaded or entity files
        return true;
    }

    /**
     * Get recent files for user
     */
    async getRecentFiles(userId, limit = 10) {
        const { data, error } = await supabaseAdmin
            .from('files')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    /**
     * Search files
     */
    async searchFiles(query, entityType = null, entityId = null) {
        let dbQuery = supabaseAdmin
            .from('files')
            .select('*')
            .ilike('name', `%${query}%`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (entityType) {
            dbQuery = dbQuery.eq('entity_type', entityType);
        }
        if (entityId) {
            dbQuery = dbQuery.eq('entity_id', entityId);
        }

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }
}

module.exports = new FileService();
