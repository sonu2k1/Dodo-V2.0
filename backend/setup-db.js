// Add missing columns and seed users
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAndSeed() {
    console.log('🔧 Setting up database and seeding users...\n');

    // First, try to add missing columns using SQL RPC
    // Since we can't run raw SQL via supabase-js, we'll work with what exists

    // The Supabase users table might be different. Let's check if we can use
    // their auth system and just store extra data

    // Actually, let's try to see what columns exist by trying to insert
    const passwordHash = await bcrypt.hash('Demo@123', 12);
    console.log('✅ Generated password hash');

    // Check if users exist and what we can update
    const { data: existingUsers, error: listError } = await supabase
        .from('users')
        .select('*');

    if (listError) {
        console.log('Error listing users:', listError.message);
    } else {
        console.log(`Found ${existingUsers?.length || 0} existing users`);
        if (existingUsers && existingUsers.length > 0) {
            console.log('Existing columns:', Object.keys(existingUsers[0]).join(', '));
        }
    }

    // Let's try insert with only the columns that exist
    const users = [
        {
            email: 'admin@kuava.in',
            role: 'super_admin',
            is_active: true
        },
        {
            email: 'employee@kuava.in',
            role: 'employee',
            is_active: true
        },
        {
            email: 'client@example.com',
            role: 'client',
            is_active: true
        }
    ];

    for (const user of users) {
        // Check if exists
        const { data: existing } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', user.email)
            .single();

        if (existing) {
            console.log(`ℹ️  ${user.email} already exists`);
        } else {
            const { data, error } = await supabase
                .from('users')
                .insert(user)
                .select();

            if (error) {
                console.log(`❌ Failed to create ${user.email}:`, error.message);
            } else {
                console.log(`✅ Created ${user.email}`);
            }
        }
    }

    console.log('\n⚠️  IMPORTANT: Your database schema is incomplete!');
    console.log('The users table is missing required columns: password_hash, full_name');
    console.log('\nTo fix this, please run the following SQL in Supabase SQL Editor:\n');
    console.log(`
-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Then update users with passwords
UPDATE users SET 
    password_hash = '${passwordHash}',
    full_name = 'Admin User'
WHERE email = 'admin@kuava.in';

UPDATE users SET 
    password_hash = '${passwordHash}',
    full_name = 'John Employee'
WHERE email = 'employee@kuava.in';

UPDATE users SET 
    password_hash = '${passwordHash}',
    full_name = 'ABC Corp Client'  
WHERE email = 'client@example.com';
`);
}

setupAndSeed()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
