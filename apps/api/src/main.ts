import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initRoutes } from './routes';
import { defaultLimiter } from './middleware/rate-limit.middleware';

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
    code: 'RouteNotFound'
  });
});

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, you might want to perform graceful shutdown or notification
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

// Start the server
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ test ] File upload test page: http://${host}:${port}/upload-test`);
});
