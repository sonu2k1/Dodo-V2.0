const { supabaseAdmin } = require('../config/database');

/**
 * Client Portal Service - Business logic for client-facing features
 */
class ClientPortalService {
    /**
     * Get client's projects with progress
     */
    async getClientProjects(clientId) {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select(`
        id,
        name,
        description,
        status,
        start_date,
        end_date,
        current_phase,
        total_phases,
        phases,
        created_at
      `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate progress for each project
        return data.map(project => ({
            ...project,
            progressPercent: project.total_phases > 0
                ? Math.round((project.current_phase / project.total_phases) * 100)
                : 0,
        }));
    }

    /**
     * Get project details with phases
     */
    async getProjectDetails(projectId, clientId) {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select(`
        *,
        tasks:tasks (
          id,
          title,
          status,
          completed_at
        )
      `)
            .eq('id', projectId)
            .eq('client_id', clientId)
            .single();

        if (error) throw error;

        // Filter to only completed tasks
        if (data) {
            data.completedTasks = data.tasks?.filter(t => t.status === 'completed') || [];
            delete data.tasks;
        }

        return data;
    }

    /**
     * Get completed tasks for client (read-only)
     */
    async getCompletedTasks(clientId, projectId = null) {
        let query = supabaseAdmin
            .from('tasks')
            .select(`
        id,
        title,
        description,
        status,
        completed_at,
        project:projects!inner (
          id,
          name,
          client_id
        )
      `)
            .eq('project.client_id', clientId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false });

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Get pending approvals for client
     */
    async getPendingApprovals(clientId) {
        const { data, error } = await supabaseAdmin
            .from('approvals')
            .select(`
        *,
        project:projects (id, name),
        submitted_by:users!submitted_by (id, full_name)
      `)
            .eq('client_id', clientId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get all approvals for client
     */
    async getApprovals(clientId, status = null) {
        let query = supabaseAdmin
            .from('approvals')
            .select(`
        *,
        project:projects (id, name),
        submitted_by:users!submitted_by (id, full_name),
        reviewed_by:users!reviewed_by (id, full_name)
      `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Submit approval decision
     */
    async submitApprovalDecision(approvalId, clientId, decision, feedback = null) {
        const status = decision === 'approve' ? 'approved' : 'changes_requested';

        const { data, error } = await supabaseAdmin
            .from('approvals')
            .update({
                status,
                client_feedback: feedback,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', approvalId)
            .eq('client_id', clientId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get invoices for client
     */
    async getInvoices(clientId) {
        const { data, error } = await supabaseAdmin
            .from('invoices')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get payment history for client
     */
    async getPaymentHistory(clientId) {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .select(`
        *,
        invoice:invoices (id, invoice_number, amount)
      `)
            .eq('client_id', clientId)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get financial summary for client
     */
    async getFinancialSummary(clientId) {
        const invoices = await this.getInvoices(clientId);
        const payments = await this.getPaymentHistory(clientId);

        const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
        const outstanding = totalInvoiced - totalPaid;

        return {
            totalInvoiced,
            totalPaid,
            outstanding,
            invoiceCount: invoices.length,
            pendingInvoices: invoices.filter(i => i.status === 'pending').length,
        };
    }

    /**
     * Get support tickets for client
     */
    async getSupportTickets(clientId, status = null) {
        let query = supabaseAdmin
            .from('support_tickets')
            .select(`
        *,
        assigned_to:users!assigned_to (id, full_name),
        created_by:users!created_by (id, full_name)
      `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Create support ticket
     */
    async createSupportTicket(clientId, userId, ticketData) {
        const { data, error } = await supabaseAdmin
            .from('support_tickets')
            .insert({
                client_id: clientId,
                created_by: userId,
                subject: ticketData.subject,
                description: ticketData.description,
                priority: ticketData.priority || 'medium',
                category: ticketData.category || 'general',
                status: 'open',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Add message to ticket
     */
    async addTicketMessage(ticketId, userId, message, isInternal = false) {
        const { data, error } = await supabaseAdmin
            .from('ticket_messages')
            .insert({
                ticket_id: ticketId,
                user_id: userId,
                message,
                is_internal: isInternal,
            })
            .select()
            .single();

        if (error) throw error;

        // Update ticket updated_at
        await supabaseAdmin
            .from('support_tickets')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', ticketId);

        return data;
    }

    /**
     * Get ticket messages
     */
    async getTicketMessages(ticketId, isClient = true) {
        let query = supabaseAdmin
            .from('ticket_messages')
            .select(`
        *,
        user:users!user_id (id, full_name, role)
      `)
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        // Clients don't see internal messages
        if (isClient) {
            query = query.eq('is_internal', false);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
}

module.exports = new ClientPortalService();
