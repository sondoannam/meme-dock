import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initRoutes } from './routes';
import { defaultLimiter } from './middleware/rate-limit.middleware';
import logger, { requestLogger } from './utils/logger';

// Load environment variables
dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001; // Using 3001 as default to avoid conflicts with other services

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Apply rate limiting to all API routes
app.use('/api', defaultLimiter);

// Apply request logging middleware
app.use(requestLogger);

// Routes
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok', service: 'meme-dock-api' });
});

// Route for serving the file upload test HTML page
app.get('/upload-test', (req, res) => {
  res.sendFile(__dirname + '/assets/file-upload-test.html');
});

// Initialize API routes
initRoutes(app);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'RouteNotFound',
  });
});

// Global error handlers for uncaught exceptions
// Winston will handle these through the exception/rejection handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  // In production, you might want to perform graceful shutdown or notification
});

process.on('unhandledRejection', (reason: Error | unknown, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

// Start the server
app.listen(port, host, () => {
  logger.info(`Server started successfully`, {
    url: `http://${host}:${port}`,
    testPage: `http://${host}:${port}/upload-test`,
    environment: process.env.NODE_ENV || 'development',
  });
});
