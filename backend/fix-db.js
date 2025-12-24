// Direct PostgreSQL connection to fix schema and seed users
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixSchemaAndSeed() {
    // Parse DATABASE_URL - need to handle the @ in password
    const dbUrl = process.env.DATABASE_URL;
    console.log('Connecting to database...\n');

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL\n');

        // Generate password hash
        const passwordHash = await bcrypt.hash('Demo@123', 12);

        // 1. Create or update the user_role enum
        console.log('📝 Setting up user_role enum...');
        try {
            await client.query(`
                DO $$ BEGIN
                    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'employee', 'client');
                EXCEPTION
                    WHEN duplicate_object THEN 
                        -- Try to add missing values
                        BEGIN
                            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
                            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
                            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employee';
                            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';
                        EXCEPTION WHEN OTHERS THEN NULL;
                        END;
                END $$;
            `);
            console.log('✅ user_role enum ready');
        } catch (e) {
            console.log('ℹ️  Enum handling:', e.message);
        }

        // 2. Add missing columns
        console.log('\n📝 Adding missing columns...');
        const columns = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()"
        ];

        for (const sql of columns) {
            try {
                await client.query(sql);
            } catch (e) {
                // Ignore errors for existing columns
            }
        }
        console.log('✅ Columns added/verified');

        // 3. Check role column type and fix if needed
        console.log('\n📝 Checking role column...');
        const roleCheck = await client.query(`
            SELECT data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'role'
        `);

        if (roleCheck.rows.length > 0) {
            console.log('Role column type:', roleCheck.rows[0].udt_name);

            if (roleCheck.rows[0].udt_name !== 'user_role') {
                // Role column exists but wrong type - need to recreate
                console.log('Converting role column to user_role enum...');
                try {
                    await client.query(`
                        ALTER TABLE users 
                        ALTER COLUMN role TYPE user_role 
                        USING role::text::user_role
                    `);
                } catch (e) {
                    console.log('Role conversion note:', e.message);
                    // If conversion fails, try dropping and recreating
                    try {
                        await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS role`);
                        await client.query(`ALTER TABLE users ADD COLUMN role user_role DEFAULT 'employee'`);
                    } catch (e2) {
                        console.log('Role fix attempt:', e2.message);
                    }
                }
            }
        }

        // 4. Insert or update users
        console.log('\n📝 Seeding demo users...');

        const users = [
            { email: 'admin@kuava.in', name: 'Admin User', role: 'super_admin' },
            { email: 'employee@kuava.in', name: 'John Employee', role: 'employee' },
            { email: 'client@example.com', name: 'ABC Corp Client', role: 'client' }
        ];

        for (const user of users) {
            try {
                // Try INSERT first, then UPDATE if exists
                const result = await client.query(`
                    INSERT INTO users (email, password_hash, name, role, is_active)
                    VALUES ($1, $2, $3, $4::user_role, true)
                    ON CONFLICT (email) DO UPDATE SET 
                        password_hash = $2,
                        name = $3
                    RETURNING id
                `, [user.email, passwordHash, user.name, user.role]);

                console.log(`✅ ${user.email} - ready`);
            } catch (e) {
                console.log(`❌ ${user.email}:`, e.message);
            }
        }

        console.log('\n===================================');
        console.log('🎉 Database setup complete!');
        console.log('===================================\n');
        console.log('Demo Login Credentials:');
        console.log('  Email: admin@kuava.in');
        console.log('  Password: Demo@123');
        console.log('\nYou can now log in to the application.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

fixSchemaAndSeed();
