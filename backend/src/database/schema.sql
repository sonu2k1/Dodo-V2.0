-- DoDo v2.0 PostgreSQL Database Schema
-- Compatible with Supabase

-- ============================================
-- EXTENSIONS & TYPES
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'employee', 'client');

-- Project status
CREATE TYPE project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'cancelled');

-- Task enums
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'completed', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Lead enums
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE lead_source AS ENUM ('website', 'referral', 'social_media', 'cold_call', 'email', 'other');

-- Chat enums
CREATE TYPE message_type AS ENUM ('text', 'file', 'image', 'system');

-- Approval enums
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');
CREATE TYPE approval_type AS ENUM ('task', 'project_milestone', 'invoice', 'document', 'deliverable');

-- Invoice status
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');

-- ============================================
-- 1. USERS
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'employee',
    google_id VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================
-- 2. PROJECTS
-- ============================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status project_status DEFAULT 'draft',
    budget DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Project team members (many-to-many)
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- ============================================
-- 3. TASKS (with dependencies)
-- ============================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'backlog',
    due_date DATE,
    estimated_hours DECIMAL(6, 2),
    actual_hours DECIMAL(6, 2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);

-- Task dependencies (many-to-many self-reference)
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

CREATE INDEX idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends ON task_dependencies(depends_on_task_id);

-- Task tags
CREATE TABLE task_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_tags_task ON task_tags(task_id);
CREATE INDEX idx_task_tags_name ON task_tags(tag_name);

-- ============================================
-- 4. LEADS (CRM)
-- ============================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    source lead_source DEFAULT 'other',
    status lead_status DEFAULT 'new',
    estimated_value DECIMAL(12, 2),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    converted_to_project_id UUID REFERENCES projects(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_source ON leads(source);

-- Lead activities
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);

-- ============================================
-- 5. TIME TRACKING
-- ============================================

CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(8, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_dates ON time_entries(start_time, end_time);
CREATE INDEX idx_time_entries_billable ON time_entries(is_billable);

-- ============================================
-- 6. CHAT MESSAGES
-- ============================================

CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    is_group BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_rooms_project ON chat_rooms(project_id);

CREATE TABLE chat_room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    UNIQUE(room_id, user_id)
);

CREATE INDEX idx_chat_members_room ON chat_room_members(room_id);
CREATE INDEX idx_chat_members_user ON chat_room_members(user_id);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    file_url TEXT,
    is_edited BOOLEAN DEFAULT false,
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- ============================================
-- 7. APPROVALS
-- ============================================

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_type approval_type NOT NULL,
    reference_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requested_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID NOT NULL REFERENCES users(id),
    status approval_status DEFAULT 'pending',
    comments TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approvals_type ON approvals(approval_type);
CREATE INDEX idx_approvals_reference ON approvals(reference_id);
CREATE INDEX idx_approvals_requested_by ON approvals(requested_by);
CREATE INDEX idx_approvals_assigned_to ON approvals(assigned_to);
CREATE INDEX idx_approvals_status ON approvals(status);

-- ============================================
-- 8. INVOICES
-- ============================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES users(id),
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status invoice_status DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_dates ON invoices(issue_date, due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================
-- 9. AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- 10. RBAC - Permissions
-- ============================================

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- ============================================
-- 11. REFRESH TOKENS (JWT)
-- ============================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Default Permissions
-- ============================================

INSERT INTO permissions (name, description, resource, action) VALUES
-- User permissions
('users:read', 'View users', 'users', 'read'),
('users:create', 'Create users', 'users', 'create'),
('users:update', 'Update users', 'users', 'update'),
('users:delete', 'Delete users', 'users', 'delete'),
-- Project permissions
('projects:read', 'View projects', 'projects', 'read'),
('projects:create', 'Create projects', 'projects', 'create'),
('projects:update', 'Update projects', 'projects', 'update'),
('projects:delete', 'Delete projects', 'projects', 'delete'),
-- Task permissions
('tasks:read', 'View tasks', 'tasks', 'read'),
('tasks:create', 'Create tasks', 'tasks', 'create'),
('tasks:update', 'Update tasks', 'tasks', 'update'),
('tasks:delete', 'Delete tasks', 'tasks', 'delete'),
-- Lead permissions
('leads:read', 'View leads', 'leads', 'read'),
('leads:create', 'Create leads', 'leads', 'create'),
('leads:update', 'Update leads', 'leads', 'update'),
('leads:delete', 'Delete leads', 'leads', 'delete'),
-- Invoice permissions
('invoices:read', 'View invoices', 'invoices', 'read'),
('invoices:create', 'Create invoices', 'invoices', 'create'),
('invoices:update', 'Update invoices', 'invoices', 'update'),
('invoices:delete', 'Delete invoices', 'invoices', 'delete'),
-- Audit log permissions
('audit_logs:read', 'View audit logs', 'audit_logs', 'read');

-- Assign all permissions to super_admin
INSERT INTO role_permissions (role, permission_id)
SELECT 'super_admin', id FROM permissions;

-- Assign most permissions to admin (except audit logs delete and users delete)
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions 
WHERE name NOT IN ('users:delete', 'audit_logs:delete');

-- Assign limited permissions to employee
INSERT INTO role_permissions (role, permission_id)
SELECT 'employee', id FROM permissions 
WHERE name IN (
    'projects:read', 
    'tasks:read', 'tasks:create', 'tasks:update',
    'leads:read', 'leads:create', 'leads:update',
    'invoices:read'
);

-- Assign minimal permissions to client
INSERT INTO role_permissions (role, permission_id)
SELECT 'client', id FROM permissions 
WHERE name IN ('projects:read', 'tasks:read', 'invoices:read');
