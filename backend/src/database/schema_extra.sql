-- DoDo v2.0 Additional Schema (AI, Client Portal, Support)
-- Run this AFTER the main schema.sql

-- ============================================
-- AI SUGGESTIONS (Human-in-the-loop)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'subtasks', 'summary', 'email_summary'
    entity_type VARCHAR(50) NOT NULL, -- 'task', 'chat_room', 'email_thread'
    entity_id UUID NOT NULL,
    suggestion_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    selected_items JSONB, -- partial approval
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_entity ON ai_suggestions(entity_type, entity_id);
CREATE INDEX idx_ai_suggestions_created_by ON ai_suggestions(created_by);

-- ============================================
-- CLIENT FOLDERS (Google Drive)
-- ============================================

CREATE TABLE IF NOT EXISTS client_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drive_folder_id VARCHAR(255) NOT NULL,
    folder_url TEXT,
    documents_folder_id VARCHAR(255),
    invoices_folder_id VARCHAR(255),
    projects_folder_id VARCHAR(255),
    contracts_folder_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_folders_client ON client_folders(client_id);
CREATE UNIQUE INDEX idx_client_folders_drive ON client_folders(drive_folder_id);

-- ============================================
-- SUPPORT TICKETS (Client Portal)
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    subject VARCHAR(255) NOT NULL,
    priority task_priority DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_support_tickets_client ON support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- internal notes not visible to client
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- ============================================
-- GMAIL SYNC STATE
-- ============================================

CREATE TABLE IF NOT EXISTS gmail_sync_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    history_id VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- FILES (Drive integration)
-- ============================================

CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    drive_file_id VARCHAR(255),
    drive_url TEXT,
    entity_type VARCHAR(50), -- 'project', 'task', 'lead', 'invoice'
    entity_id UUID,
    folder_id UUID REFERENCES client_folders(id),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX idx_files_folder ON files(folder_id);
CREATE INDEX idx_files_drive ON files(drive_file_id);

-- ============================================
-- TRIGGER for support tickets
-- ============================================

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
