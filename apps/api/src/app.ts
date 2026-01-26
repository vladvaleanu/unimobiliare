/**
 * Unimobiliare API
 *
 * Express application entry point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { loadEnv, getEnv } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import { apiRoutes } from './routes/index.js';
import { logger } from './utils/index.js';
import { getPrismaClient, disconnectPrisma } from '@unimobiliare/database';

// Load and validate environment variables
loadEnv();

const app = express();
const env = getEnv();

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS
app.use(
    cors({
        origin: env.NODE_ENV === 'production'
            ? [env.APP_URL]
            : ['http://localhost:3001', 'http://localhost:3002'],
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Compression
app.use(compression());

// Request logging
app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

// API routes
app.use('/api/v1', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Server Startup
// ─────────────────────────────────────────────────────────────────────────────

const PORT = env.PORT;

async function start() {
    try {
        // Test database connection
        const prisma = getPrismaClient();
        await prisma.$connect();
        logger.info('✅ Database connected');

        // Start server
        app.listen(PORT, () => {
            logger.info(`🚀 API server running on port ${PORT}`);
            logger.info(`📝 Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown() {
    logger.info('Shutting down...');
    await disconnectPrisma();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
start();

export { app };
