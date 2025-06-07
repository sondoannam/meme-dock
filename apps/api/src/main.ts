import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initRoutes } from './routes';

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

// Routes
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok', service: 'meme-dock-api' });
});

// Initialize API routes
initRoutes(app);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
