const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const config = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration - Support multiple origins for Vercel deployments
const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:5173',
    'http://localhost:3000',
];

// Dynamic origin check for Vercel preview deployments
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin matches allowed list or Vercel preview pattern
        const isAllowed = allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||  // Allow all Vercel deployments
            origin.includes('vercel.app');

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Passport initialization
app.use(passport.initialize());

// Trust proxy (for production behind reverse proxy)
if (config.env === 'production') {
    app.set('trust proxy', 1);
}

// API routes
app.use(config.apiPrefix, routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;
