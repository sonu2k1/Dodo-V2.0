const { google } = require('googleapis');
const config = require('../config/env');
const { supabaseAdmin } = require('../config/database');

/**
 * Gmail Service for email ingestion and task creation
 */
class GmailService {
    constructor() {
        this.gmail = null;
        this.initialized = false;
    }

    /**
     * Initialize Gmail API with OAuth token
     */
    async initialize(accessToken) {
        try {
            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });

            this.gmail = google.gmail({ version: 'v1', auth });
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize Gmail:', error.message);
            return false;
        }
    }

    /**
     * Get or create "DoDo" label
     */
    async getOrCreateDoDoLabel() {
        if (!this.initialized) {
            throw new Error('Gmail not initialized');
        }

        // List existing labels
        const labelsResponse = await this.gmail.users.labels.list({ userId: 'me' });
        const existingLabel = labelsResponse.data.labels?.find(l => l.name === 'DoDo');

        if (existingLabel) {
            return existingLabel.id;
        }

        // Create label if not exists
        const newLabel = await this.gmail.users.labels.create({
            userId: 'me',
            requestBody: {
                name: 'DoDo',
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show',
                color: {
                    backgroundColor: '#4285f4',
                    textColor: '#ffffff',
                },
            },
        });

        return newLabel.data.id;
    }

    /**
     * Fetch emails with "DoDo" label
     */
    async fetchDoDoEmails(maxResults = 20) {
        if (!this.initialized) {
            throw new Error('Gmail not initialized');
        }

        const labelId = await this.getOrCreateDoDoLabel();

        const messagesResponse = await this.gmail.users.messages.list({
            userId: 'me',
            labelIds: [labelId],
            maxResults,
        });

        if (!messagesResponse.data.messages) {
            return [];
        }

        const emails = [];
        for (const msg of messagesResponse.data.messages) {
            const fullMessage = await this.gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full',
            });

            const headers = fullMessage.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || '';
            const date = headers.find(h => h.name === 'Date')?.value;

            // Get body
            let body = '';
            if (fullMessage.data.payload.body?.data) {
                body = Buffer.from(fullMessage.data.payload.body.data, 'base64').toString('utf-8');
            } else if (fullMessage.data.payload.parts) {
                const textPart = fullMessage.data.payload.parts.find(p => p.mimeType === 'text/plain');
                if (textPart?.body?.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                }
            }

            emails.push({
                id: msg.id,
                threadId: msg.threadId,
                subject,
                from,
                date: date ? new Date(date).toISOString() : null,
                snippet: fullMessage.data.snippet,
                body: body.substring(0, 1000), // Limit body length
                labelIds: fullMessage.data.labelIds,
            });
        }

        return emails;
    }

    /**
     * Create task from email
     */
    async createTaskFromEmail(email, userId, projectId = null) {
        // Parse subject for task details
        const title = email.subject.replace(/^(Re:|Fwd:)\s*/gi, '').trim();

        // Extract sender name
        const senderMatch = email.from.match(/^([^<]+)/);
        const senderName = senderMatch ? senderMatch[1].trim() : email.from;

        const taskData = {
            title: `📧 ${title}`,
            description: [
                `Created from email by ${senderName}`,
                '',
                email.snippet,
                '',
                `Email ID: ${email.id}`,
            ].join('\n'),
            status: 'todo',
            priority: 'medium',
            source: 'email',
            source_email_id: email.id,
            source_email_thread_id: email.threadId,
            project_id: projectId,
            created_by: userId,
            created_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
            .from('tasks')
            .insert(taskData)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    /**
     * Process all DoDo emails and create tasks
     */
    async processDoDoEmails(userId, projectId = null) {
        const emails = await this.fetchDoDoEmails();
        const results = [];

        for (const email of emails) {
            // Check if task already exists for this email
            const { data: existing } = await supabaseAdmin
                .from('tasks')
                .select('id')
                .eq('source_email_id', email.id)
                .single();

            if (existing) {
                results.push({ emailId: email.id, action: 'skipped', reason: 'Task already exists' });
                continue;
            }

            try {
                const task = await this.createTaskFromEmail(email, userId, projectId);
                results.push({ emailId: email.id, action: 'created', taskId: task.id });

                // Optionally remove the label after processing
                // await this.removeDoDoLabel(email.id);
            } catch (error) {
                results.push({ emailId: email.id, action: 'failed', error: error.message });
            }
        }

        return results;
    }

    /**
     * Remove DoDo label from email (after processing)
     */
    async removeDoDoLabel(messageId) {
        const labelId = await this.getOrCreateDoDoLabel();

        await this.gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: [labelId],
            },
        });
    }

    /**
     * Watch for new emails (for Cloud Functions / Pub/Sub)
     */
    async setupWatch(topicName) {
        if (!this.initialized) {
            throw new Error('Gmail not initialized');
        }

        const labelId = await this.getOrCreateDoDoLabel();

        const response = await this.gmail.users.watch({
            userId: 'me',
            requestBody: {
                topicName, // e.g., 'projects/your-project/topics/gmail-notifications'
                labelIds: [labelId],
            },
        });

        return {
            historyId: response.data.historyId,
            expiration: response.data.expiration,
        };
    }
}

module.exports = new GmailService();
