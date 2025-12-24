require('dotenv').config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Database
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'dodo-v2',
  },

  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Session
  inactivityTimeoutHours: parseInt(process.env.INACTIVITY_TIMEOUT_HOURS, 10) || 24,
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && config.env !== 'test') {
  console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;
