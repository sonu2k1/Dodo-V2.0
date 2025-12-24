const { supabaseAdmin } = require('../config/database');

/**
 * Lead Service - Business logic for CRM lead management
 */
class LeadService {
    /**
     * Create a new lead
     */
    async createLead(leadData, createdBy) {
        const { data, error } = await supabaseAdmin
            .from('leads')
            .insert({
                ...leadData,
                created_by: createdBy,
                status: leadData.status || 'new',
            })
            .select()
            .single();

        if (error) throw error;

        // Log activity
        await this.logActivity(data.id, 'created', createdBy, 'Lead created');

        return data;
    }

    /**
     * Get all leads with filters
     */
    async getLeads(filters = {}, userId, userRole) {
        let query = supabaseAdmin
            .from('leads')
            .select(`
        *,
        assigned_user:users!assigned_to (
          id,
          full_name,
          avatar_url
        ),
        created_user:users!created_by (
          id,
          full_name
        )
      `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.source) {
            query = query.eq('source', filters.source);
        }
        if (filters.assignedTo) {
            query = query.eq('assigned_to', filters.assignedTo);
        }
        if (filters.search) {
            query = query.or(`company_name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        // Role-based filtering: employees only see their assigned leads
        if (userRole === 'employee') {
            query = query.eq('assigned_to', userId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Get lead by ID
     */
    async getLeadById(leadId) {
        const { data, error } = await supabaseAdmin
            .from('leads')
            .select(`
        *,
        assigned_user:users!assigned_to (
          id,
          full_name,
          email,
          avatar_url
        ),
        created_user:users!created_by (
          id,
          full_name
        )
      `)
            .eq('id', leadId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update lead
     */
    async updateLead(leadId, updates, userId) {
        const oldLead = await this.getLeadById(leadId);

        const { data, error } = await supabaseAdmin
            .from('leads')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', leadId)
            .select()
            .single();

        if (error) throw error;

        // Log status change
        if (updates.status && updates.status !== oldLead.status) {
            await this.logActivity(
                leadId,
                'status_changed',
                userId,
                `Status changed from ${oldLead.status} to ${updates.status}`
            );
        }

        // Log assignment change
        if (updates.assigned_to && updates.assigned_to !== oldLead.assigned_to) {
            await this.logActivity(
                leadId,
                'assigned',
                userId,
                `Lead assigned to new user`
            );
        }

        return data;
    }

    /**
     * Update lead status
     */
    async updateStatus(leadId, status, userId) {
        return this.updateLead(leadId, { status }, userId);
    }

    /**
     * Assign lead to user
     */
    async assignLead(leadId, assignedTo, userId) {
        return this.updateLead(leadId, { assigned_to: assignedTo }, userId);
    }

    /**
     * Convert lead (mark as won/lost)
     */
    async convertLead(leadId, result, notes, userId) {
        const status = result === 'won' ? 'won' : 'lost';

        const { data, error } = await supabaseAdmin
            .from('leads')
            .update({
                status,
                converted_at: new Date().toISOString(),
                notes: notes || undefined,
                updated_at: new Date().toISOString(),
            })
            .eq('id', leadId)
            .select()
            .single();

        if (error) throw error;

        await this.logActivity(
            leadId,
            'converted',
            userId,
            `Lead converted: ${status.toUpperCase()}`
        );

        return data;
    }

    /**
     * Delete lead (soft delete)
     */
    async deleteLead(leadId, userId) {
        const { error } = await supabaseAdmin
            .from('leads')
            .delete()
            .eq('id', leadId);

        if (error) throw error;
        return { success: true };
    }

    /**
     * Get lead activity history
     */
    async getLeadActivity(leadId) {
        const { data, error } = await supabaseAdmin
            .from('lead_activities')
            .select(`
        *,
        user:users!user_id (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Log lead activity
     */
    async logActivity(leadId, activityType, userId, notes) {
        const { error } = await supabaseAdmin
            .from('lead_activities')
            .insert({
                lead_id: leadId,
                activity_type: activityType,
                user_id: userId,
                notes,
            });

        if (error) console.error('Failed to log activity:', error);
    }

    /**
     * Add note to lead
     */
    async addNote(leadId, note, userId) {
        await this.logActivity(leadId, 'note', userId, note);
        return { success: true };
    }

    /**
     * Get lead statistics
     */
    async getLeadStats(userId, userRole) {
        let query = supabaseAdmin
            .from('leads')
            .select('status, estimated_value');

        if (userRole === 'employee') {
            query = query.eq('assigned_to', userId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const stats = {
            total: data.length,
            byStatus: {},
            totalValue: 0,
            wonValue: 0,
            conversionRate: 0,
        };

        data.forEach(lead => {
            stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
            stats.totalValue += lead.estimated_value || 0;
            if (lead.status === 'won') {
                stats.wonValue += lead.estimated_value || 0;
            }
        });

        const completed = (stats.byStatus.won || 0) + (stats.byStatus.lost || 0);
        if (completed > 0) {
            stats.conversionRate = ((stats.byStatus.won || 0) / completed * 100).toFixed(1);
        }

        return stats;
    }

    /**
     * Get employees for assignment dropdown
     */
    async getEmployeesForAssignment() {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, full_name, avatar_url')
            .in('role', ['employee', 'admin', 'super_admin'])
            .eq('is_active', true)
            .order('full_name');

        if (error) throw error;
        return data;
    }
}

module.exports = new LeadService();
