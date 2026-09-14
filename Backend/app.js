import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { initDb } from './config/db.js';
import aiService from './services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function requestLogger(req, res, next) {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 400 ? '⚠️ ' : '✓ ';
    console.log(`${level}[${req.method} ${req.path}] ${status} ${duration}ms`);
    return originalSend.call(this, data);
  };

  next();
}

export async function createApp() {
  await initDb();

  const app = express();

  app.use(requestLogger);

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: origin not allowed'));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (_req, res) => {
    try {
      const ai = aiService.getStatus();
      res.json({
        status: 'ok',
        service: 'TripAI Engine',
        timestamp: new Date().toISOString(),
        ai: {
          configured: ai.configured,
          mode: ai.forceLocal || ai.circuitOpen ? 'local_fallback' : 'gemini',
          circuitOpen: ai.circuitOpen,
          reason: ai.reason || null,
          retryAfterSec: ai.retryAfterSec || 0,
        },
      });
    } catch (error) {
      res.json({
        status: 'ok',
        service: 'TripAI Engine',
        timestamp: new Date().toISOString(),
        ai: {
          configured: false,
          mode: 'error',
          circuitOpen: false,
          reason: error.message,
          retryAfterSec: 0,
        },
      });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/share', shareRoutes);

  if (process.env.NODE_ENV === 'production') {
    const frontendBuild = path.resolve(__dirname, '..', 'Frontend', 'app', 'build');
    if (fs.existsSync(frontendBuild)) {
      app.use(express.static(frontendBuild));
      app.get(/^\/(?!api).*/, (_req, res) => {
        res.sendFile(path.join(frontendBuild, 'index.html'));
      });
    }
  }

  app.use(errorHandler);

  return app;
}

export default createApp;
