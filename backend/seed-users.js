// Minimal seed script - only required columns
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedUsers() {
    console.log('🌱 Seeding demo users...\n');

    // First, let's check current table structure by checking if any user exists
    const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (checkError) {
        console.log('❌ Error checking users table:', checkError.message);
        console.log('Full error:', JSON.stringify(checkError, null, 2));
        return;
    }

    console.log('✅ Users table accessible');
    if (existing && existing.length > 0) {
        console.log('Sample user columns:', Object.keys(existing[0]).join(', '));
    }

    // Generate password hash for Demo@123
    const passwordHash = await bcrypt.hash('Demo@123', 12);
    console.log('\n📝 Generated password hash for Demo@123\n');

    // Try upsert with minimal fields based on what schema shows as required
    const users = [
        {
            email: 'admin@kuava.in',
            password_hash: passwordHash,
            role: 'super_admin',
            is_active: true
        },
        {
            email: 'employee@kuava.in',
            password_hash: passwordHash,
            role: 'employee',
            is_active: true
        },
        {
            email: 'client@example.com',
            password_hash: passwordHash,
            role: 'client',
            is_active: true
        }
    ];

    for (const user of users) {
        // Check if exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', user.email)
            .single();

        if (existingUser) {
            // Update password
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_hash: user.password_hash })
                .eq('email', user.email);

            if (updateError) {
                console.log(`❌ Failed to update ${user.email}:`, updateError.message);
            } else {
                console.log(`✅ Updated password for ${user.email}`);
            }
        } else {
            // Insert - try with full_name
            const userData = {
                ...user,
                full_name: user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
            };

            const { error: insertError } = await supabase
                .from('users')
                .insert(userData);

            if (insertError) {
                console.log(`❌ Failed to create ${user.email}:`, insertError.message);

                // Try without full_name
                const { error: retryError } = await supabase
                    .from('users')
                    .insert(user);

                if (retryError) {
                    console.log(`   Retry failed:`, retryError.message);
                } else {
                    console.log(`✅ Created ${user.email} (without full_name)`);
                }
            } else {
                console.log(`✅ Created ${user.email}`);
            }
        }
    }

    console.log('\n📋 Demo Login Credentials:');
    console.log('   Super Admin: admin@kuava.in / Demo@123');
    console.log('   Employee: employee@kuava.in / Demo@123');
    console.log('   Client: client@example.com / Demo@123');
}

seedUsers()
    .then(() => {
        console.log('\n✨ Seeding complete!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('🔥 Seeding failed:', err);
        process.exit(1);
    });
