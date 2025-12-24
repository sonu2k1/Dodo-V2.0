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

// CORS configuration
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
