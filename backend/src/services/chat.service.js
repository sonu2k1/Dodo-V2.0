const { supabaseAdmin } = require('../config/database');

/**
 * Chat Service - Business logic for chat operations
 */
class ChatService {
    /**
     * Create a new chat room
     */
    async createRoom({ name, projectId = null, isGroup = true, createdBy }) {
        const { data, error } = await supabaseAdmin
            .from('chat_rooms')
            .insert({
                name,
                project_id: projectId,
                is_group: isGroup,
                created_by: createdBy,
            })
            .select()
            .single();

        if (error) throw error;

        // Add creator as member
        await this.addRoomMember(data.id, createdBy);

        return data;
    }

    /**
     * Get all rooms for a user
     */
    async getUserRooms(userId) {
        const { data, error } = await supabaseAdmin
            .from('chat_room_members')
            .select(`
        room:chat_rooms (
          id,
          name,
          project_id,
          is_group,
          created_at
        )
      `)
            .eq('user_id', userId);

        if (error) throw error;
        return data.map(d => d.room);
    }

    /**
     * Get or create direct message room between two users
     */
    async getOrCreateDirectMessage(userId1, userId2) {
        // Check for existing DM room
        const { data: existing } = await supabaseAdmin
            .rpc('get_dm_room', { user_id_1: userId1, user_id_2: userId2 });

        if (existing && existing.length > 0) {
            return existing[0];
        }

        // Create new DM room
        const { data: newRoom, error } = await supabaseAdmin
            .from('chat_rooms')
            .insert({
                name: null, // DM rooms don't have names
                is_group: false,
                created_by: userId1,
            })
            .select()
            .single();

        if (error) throw error;

        // Add both users as members
        await Promise.all([
            this.addRoomMember(newRoom.id, userId1),
            this.addRoomMember(newRoom.id, userId2),
        ]);

        return newRoom;
    }

    /**
     * Add member to room
     */
    async addRoomMember(roomId, userId) {
        const { error } = await supabaseAdmin
            .from('chat_room_members')
            .upsert({
                room_id: roomId,
                user_id: userId,
                joined_at: new Date().toISOString(),
            }, { onConflict: 'room_id,user_id' });

        if (error && error.code !== '23505') throw error; // Ignore duplicate
    }

    /**
     * Remove member from room
     */
    async removeRoomMember(roomId, userId) {
        const { error } = await supabaseAdmin
            .from('chat_room_members')
            .delete()
            .eq('room_id', roomId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    /**
     * Check if user can access room
     */
    async canAccessRoom(userId, roomId, userRole) {
        // Admins can access all rooms
        if (['super_admin', 'admin'].includes(userRole)) {
            return true;
        }

        // Check if user is a member
        const { data, error } = await supabaseAdmin
            .from('chat_room_members')
            .select('id')
            .eq('room_id', roomId)
            .eq('user_id', userId)
            .single();

        return !error && !!data;
    }

    /**
     * Create a message
     */
    async createMessage({ roomId, senderId, content, messageType = 'text', replyToId = null, fileUrl = null }) {
        const { data, error } = await supabaseAdmin
            .from('chat_messages')
            .insert({
                room_id: roomId,
                sender_id: senderId,
                content,
                message_type: messageType,
                reply_to_id: replyToId,
                file_url: fileUrl,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get messages for a room
     */
    async getRoomMessages(roomId, { before, limit = 50 } = {}) {
        let query = supabaseAdmin
            .from('chat_messages')
            .select(`
        *,
        sender:users!sender_id (
          id,
          full_name,
          avatar_url
        ),
        reply_to:chat_messages!reply_to_id (
          id,
          content,
          sender:users!sender_id (
            full_name
          )
        )
      `)
            .eq('room_id', roomId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (before) {
            query = query.lt('created_at', before);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.reverse(); // Return in chronological order
    }

    /**
     * Edit a message
     */
    async editMessage(messageId, userId, content) {
        const { data, error } = await supabaseAdmin
            .from('chat_messages')
            .update({
                content,
                is_edited: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', messageId)
            .eq('sender_id', userId) // Only sender can edit
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a message (soft delete by clearing content)
     */
    async deleteMessage(messageId, userId) {
        const { data, error } = await supabaseAdmin
            .from('chat_messages')
            .update({
                content: '[Message deleted]',
                message_type: 'system',
                updated_at: new Date().toISOString(),
            })
            .eq('id', messageId)
            .eq('sender_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Mark messages as read
     */
    async markMessagesRead(roomId, userId) {
        const { error } = await supabaseAdmin
            .from('chat_room_members')
            .update({ last_read_at: new Date().toISOString() })
            .eq('room_id', roomId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    /**
     * Set user online status
     */
    async setUserOnline(userId, isOnline) {
        const { error } = await supabaseAdmin
            .from('users')
            .update({
                last_login_at: isOnline ? new Date().toISOString() : undefined,
            })
            .eq('id', userId);

        if (error) console.error('Failed to update online status:', error);
    }

    /**
     * Get channels (public rooms)
     */
    async getChannels() {
        const { data, error } = await supabaseAdmin
            .from('chat_rooms')
            .select('*')
            .eq('is_group', true)
            .is('project_id', null)
            .order('name');

        if (error) throw error;
        return data;
    }

    /**
     * Get contextual rooms (project/task linked)
     */
    async getContextualRooms(projectId = null, taskId = null) {
        let query = supabaseAdmin
            .from('chat_rooms')
            .select('*');

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Create default channels
     */
    async createDefaultChannels(createdBy) {
        const defaultChannels = [
            { name: 'general', emoji: '💬' },
            { name: 'design', emoji: '🎨' },
            { name: 'development', emoji: '💻' },
            { name: 'random', emoji: '🎲' },
        ];

        for (const channel of defaultChannels) {
            const { data: existing } = await supabaseAdmin
                .from('chat_rooms')
                .select('id')
                .eq('name', channel.name)
                .eq('is_group', true)
                .single();

            if (!existing) {
                await this.createRoom({
                    name: channel.name,
                    isGroup: true,
                    createdBy,
                });
            }
        }
    }
}

module.exports = new ChatService();
