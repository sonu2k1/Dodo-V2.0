const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

// Admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Regular client with anon key (respects RLS)
const supabase = createClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

module.exports = {
    supabase,
    supabaseAdmin,
};
