// Check what's in the users table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('🔍 Checking database schema...\n');

    // Try to get users
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (error) {
        console.log('❌ Error:', error.message);
        console.log('\nFull error:', JSON.stringify(error, null, 2));

        if (error.message.includes('does not exist')) {
            console.log('\n⚠️  The users table does not exist!');
            console.log('You need to run the schema.sql in your Supabase SQL Editor.');
        }
    } else {
        console.log('✅ Users table exists');
        if (data && data.length > 0) {
            console.log('\nColumns found:', Object.keys(data[0]).join(', '));
            console.log('\nSample data:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('\n📭 Table is empty - no users found');
        }
    }

    // Try to query table info via pg_catalog (won't work with RLS but worth trying)
    console.log('\n🔍 Trying to get column info...');

    // Alternative: Try inserting a minimal record to see what columns work
    console.log('\n🧪 Testing column availability...');

    const testCols = ['id', 'email', 'password_hash', 'full_name', 'role', 'is_active', 'created_at'];
    for (const col of testCols) {
        const { error } = await supabase
            .from('users')
            .select(col)
            .limit(1);

        if (error) {
            console.log(`  ❌ ${col}: ${error.message.includes('column') ? 'NOT FOUND' : error.message}`);
        } else {
            console.log(`  ✅ ${col}: exists`);
        }
    }
}

checkSchema()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
