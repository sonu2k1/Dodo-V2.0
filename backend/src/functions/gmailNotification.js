/**
 * Cloud Function: Gmail Push Notification Handler
 * 
 * This function handles Gmail push notifications via Pub/Sub
 * when emails with the "DoDo" label are received.
 * 
 * Deploy to Google Cloud Functions:
 * gcloud functions deploy handleGmailNotification \
 *   --runtime nodejs18 \
 *   --trigger-topic gmail-notifications \
 *   --set-env-vars SUPABASE_URL=...,SUPABASE_SERVICE_KEY=...
 */

const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Main handler for Gmail push notifications
 */
exports.handleGmailNotification = async (message, context) => {
    try {
        // Decode Pub/Sub message
        const data = message.data
            ? JSON.parse(Buffer.from(message.data, 'base64').toString())
            : {};

        console.log('Received Gmail notification:', data);

        const { emailAddress, historyId } = data;

        if (!emailAddress || !historyId) {
            console.log('Missing required data, skipping');
            return;
        }

        // Find user by email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, google_refresh_token')
            .eq('email', emailAddress)
            .single();

        if (userError || !user?.google_refresh_token) {
            console.log('User not found or no refresh token:', emailAddress);
            return;
        }

        // Initialize Gmail with user's refresh token
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({ refresh_token: user.google_refresh_token });

        const gmail = google.gmail({ version: 'v1', auth });

        // Get history since last known historyId
        const { data: lastSync } = await supabase
            .from('gmail_sync_state')
            .select('history_id')
            .eq('user_id', user.id)
            .single();

        const history = await gmail.users.history.list({
            userId: 'me',
            startHistoryId: lastSync?.history_id || historyId,
            labelId: await getDodoLabelId(gmail),
        });

        if (!history.data.history) {
            console.log('No new history');
            return;
        }

        // Process new messages
        for (const record of history.data.history) {
            if (record.messagesAdded) {
                for (const msgRecord of record.messagesAdded) {
                    await processNewEmail(gmail, msgRecord.message.id, user.id);
                }
            }
        }

        // Update sync state
        await supabase
            .from('gmail_sync_state')
            .upsert({
                user_id: user.id,
                history_id: history.data.historyId,
                updated_at: new Date().toISOString(),
            });

        console.log(`Processed ${history.data.history.length} history records`);
    } catch (error) {
        console.error('Error processing Gmail notification:', error);
        throw error;
    }
};

/**
 * Get the DoDo label ID
 */
async function getDodoLabelId(gmail) {
    const response = await gmail.users.labels.list({ userId: 'me' });
    const dodoLabel = response.data.labels?.find(l => l.name === 'DoDo');
    return dodoLabel?.id;
}

/**
 * Process a new email and create a task
 */
async function processNewEmail(gmail, messageId, userId) {
    try {
        // Check if task already exists for this email
        const { data: existing } = await supabase
            .from('tasks')
            .select('id')
            .eq('source_email_id', messageId)
            .single();

        if (existing) {
            console.log(`Task already exists for email ${messageId}`);
            return;
        }

        // Get full message
        const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full',
        });

        const headers = message.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(h => h.name === 'From')?.value || '';

        // Create task
        const { data: task, error } = await supabase
            .from('tasks')
            .insert({
                title: `📧 ${subject.replace(/^(Re:|Fwd:)\s*/gi, '').trim()}`,
                description: `Created from email by ${from}\n\n${message.data.snippet}`,
                status: 'todo',
                priority: 'medium',
                source: 'email',
                source_email_id: messageId,
                source_email_thread_id: message.data.threadId,
                created_by: userId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            return;
        }

        console.log(`Created task ${task.id} from email ${messageId}`);
    } catch (error) {
        console.error(`Error processing email ${messageId}:`, error);
    }
}

/**
 * HTTP endpoint for manual trigger (testing)
 */
exports.manualProcessEmails = async (req, res) => {
    try {
        const { userId, accessToken } = req.body;

        if (!userId || !accessToken) {
            return res.status(400).json({ error: 'userId and accessToken required' });
        }

        // Initialize Gmail
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth });

        // Get DoDo label ID
        const labelId = await getDodoLabelId(gmail);
        if (!labelId) {
            return res.json({ message: 'DoDo label not found', tasksCreated: 0 });
        }

        // List messages with DoDo label
        const messages = await gmail.users.messages.list({
            userId: 'me',
            labelIds: [labelId],
            maxResults: 20,
        });

        if (!messages.data.messages) {
            return res.json({ message: 'No emails with DoDo label', tasksCreated: 0 });
        }

        let tasksCreated = 0;
        for (const msg of messages.data.messages) {
            const result = await processNewEmail(gmail, msg.id, userId);
            if (result) tasksCreated++;
        }

        res.json({ message: 'Processed', tasksCreated });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};
