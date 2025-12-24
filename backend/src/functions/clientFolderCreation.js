/**
 * Cloud Function: Client Created Handler
 * 
 * This function auto-creates Google Drive folders when a new client is created.
 * Triggered by Supabase database webhook or directly via HTTP.
 * 
 * Deploy to Google Cloud Functions:
 * gcloud functions deploy onClientCreated \
 *   --runtime nodejs18 \
 *   --trigger-http \
 *   --allow-unauthenticated \
 *   --set-env-vars GOOGLE_SERVICE_ACCOUNT_KEY=...
 */

const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Root folder ID for client folders
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Initialize Google Drive API
 */
function initializeDrive() {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
}

/**
 * Create a folder in Google Drive
 */
async function createFolder(drive, name, parentId) {
    const response = await drive.files.create({
        resource: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId || ROOT_FOLDER_ID],
        },
        fields: 'id, name, webViewLink',
    });
    return response.data;
}

/**
 * Main HTTP handler for client creation
 */
exports.onClientCreated = async (req, res) => {
    try {
        // Handle CORS
        res.set('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            return res.status(204).send('');
        }

        const { clientId, clientName } = req.body;

        if (!clientId || !clientName) {
            return res.status(400).json({ error: 'clientId and clientName required' });
        }

        console.log(`Creating folders for client: ${clientName} (${clientId})`);

        // Check if folders already exist
        const { data: existing } = await supabase
            .from('client_folders')
            .select('id')
            .eq('client_id', clientId)
            .single();

        if (existing) {
            return res.json({ message: 'Folders already exist', clientId });
        }

        // Initialize Drive
        const drive = initializeDrive();

        // Create main client folder
        const mainFolder = await createFolder(drive, clientName, ROOT_FOLDER_ID);
        console.log(`Created main folder: ${mainFolder.id}`);

        // Create subfolders
        const subfolders = {};
        for (const folderName of ['Documents', 'Invoices', 'Projects', 'Contracts']) {
            const folder = await createFolder(drive, folderName, mainFolder.id);
            subfolders[folderName.toLowerCase()] = folder;
            console.log(`Created subfolder: ${folderName}`);
        }

        // Save to database
        const { error: dbError } = await supabase
            .from('client_folders')
            .insert({
                client_id: clientId,
                drive_folder_id: mainFolder.id,
                folder_url: mainFolder.webViewLink,
                documents_folder_id: subfolders.documents.id,
                invoices_folder_id: subfolders.invoices.id,
                projects_folder_id: subfolders.projects.id,
                contracts_folder_id: subfolders.contracts.id,
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: 'Failed to save folder info' });
        }

        res.json({
            success: true,
            clientId,
            folderId: mainFolder.id,
            folderUrl: mainFolder.webViewLink,
        });
    } catch (error) {
        console.error('Error creating client folders:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Supabase Database Webhook Handler
 * Called when a new record is inserted into clients table
 */
exports.onClientInsertWebhook = async (req, res) => {
    try {
        // Supabase webhook payload
        const { type, table, record } = req.body;

        if (type !== 'INSERT' || table !== 'clients') {
            return res.status(200).json({ message: 'Ignored' });
        }

        const { id: clientId, name: clientName } = record;

        console.log(`Webhook: New client created - ${clientName}`);

        // Call the main handler
        req.body = { clientId, clientName };
        return exports.onClientCreated(req, res);
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
};
