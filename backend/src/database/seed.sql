-- DoDo v2.0 Seed Data - Demo Users and Sample Data
-- Run this AFTER schema.sql and schema_extra.sql

-- ============================================
-- DEMO USERS
-- ============================================

-- Password for all demo users: Demo@123
-- bcrypt hash of 'Demo@123' (cost factor 10)
-- Note: In production, generate these properly

INSERT INTO users (id, email, password_hash, full_name, role, is_active, email_verified) VALUES
-- Super Admin
('11111111-1111-1111-1111-111111111111', 
 'admin@kuava.in', 
 '$2a$12$990ohPwNIDPGcoiMGKchveg7trf5ZO02RrKX9ObDHkps.fbIOMP8m',
 'Admin User', 
 'super_admin', 
 true, 
 true),

-- Employee
('22222222-2222-2222-2222-222222222222', 
 'employee@kuava.in', 
 '$2a$12$990ohPwNIDPGcoiMGKchveg7trf5ZO02RrKX9ObDHkps.fbIOMP8m',
 'John Employee', 
 'employee', 
 true, 
 true),

-- Client
('33333333-3333-3333-3333-333333333333', 
 'client@example.com', 
 '$2a$12$990ohPwNIDPGcoiMGKchveg7trf5ZO02RrKX9ObDHkps.fbIOMP8m',
 'ABC Corp Client', 
 'client', 
 true, 
 true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- DEMO PROJECT
-- ============================================

INSERT INTO projects (id, name, description, client_id, manager_id, status, budget, start_date, end_date, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Website Redesign',
 'Complete redesign of company website with modern UI',
 '33333333-3333-3333-3333-333333333333',
 '11111111-1111-1111-1111-111111111111',
 'active',
 150000.00,
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '90 days',
 '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Add project members
INSERT INTO project_members (project_id, user_id, role) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'manager'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'developer')
ON CONFLICT DO NOTHING;

-- ============================================
-- DEMO TASKS
-- ============================================

INSERT INTO tasks (id, project_id, assigned_to, title, description, priority, status, due_date, estimated_hours, created_by) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '22222222-2222-2222-2222-222222222222',
 'Design homepage mockup',
 'Create initial design mockup for the homepage',
 'high',
 'in_progress',
 CURRENT_DATE + INTERVAL '7 days',
 8,
 '11111111-1111-1111-1111-111111111111'),
 
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '22222222-2222-2222-2222-222222222222',
 'Setup project structure',
 'Initialize React project with all dependencies',
 'medium',
 'completed',
 CURRENT_DATE - INTERVAL '2 days',
 4,
 '11111111-1111-1111-1111-111111111111'),
 
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 NULL,
 'Client review meeting',
 'Present initial designs to client for feedback',
 'high',
 'todo',
 CURRENT_DATE + INTERVAL '14 days',
 2,
 '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- ============================================
-- DEMO LEADS
-- ============================================

INSERT INTO leads (id, company_name, contact_name, email, phone, source, status, estimated_value, assigned_to, created_by) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccc01',
 'Tech Solutions Inc',
 'Rahul Sharma',
 'rahul@techsolutions.in',
 '+91 98765 43210',
 'website',
 'qualified',
 250000.00,
 '11111111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111'),
 
('cccccccc-cccc-cccc-cccc-cccccccccc02',
 'StartupXYZ',
 'Priya Patel',
 'priya@startupxyz.com',
 '+91 87654 32109',
 'referral',
 'proposal',
 180000.00,
 '22222222-2222-2222-2222-222222222222',
 '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- ============================================
-- DEMO CHAT ROOM
-- ============================================

INSERT INTO chat_rooms (id, name, project_id, is_group, created_by) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd',
 'Website Redesign Team',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 true,
 '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

INSERT INTO chat_room_members (room_id, user_id) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- ============================================
-- INFO
-- ============================================

-- Demo Login Credentials:
-- 
-- Super Admin:
--   Email: admin@kuava.in
--   Password: Demo@123
--
-- Employee:
--   Email: employee@kuava.in
--   Password: Demo@123
--
-- Client:
--   Email: client@example.com
--   Password: Demo@123
--
-- NOTE: The password hash above is a placeholder.
-- You need to generate a real bcrypt hash for 'Demo@123'
-- Or update the auth service to use a known hash.
