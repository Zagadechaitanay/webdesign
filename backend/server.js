import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { getMaintenance, setMaintenance, onChange } from './lib/systemState.js';
import { db } from './lib/firebase.js';
import { loadState } from './lib/systemState.js';

// Ensure .env is loaded from the backend directory explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath, override: true });

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting - more lenient in development
const isDevelopment = process.env.NODE_ENV !== 'production';

// General rate limiter (higher limit in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Much higher limit in development
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for public endpoints in development
    const publicPaths = ['/api/notices/public', '/api/dashboard/public-stats', '/api/system/maintenance', '/api/health'];
    return isDevelopment && publicPaths.includes(req.path);
  }
});

// Login rate limiter (more lenient in development)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 5,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general limiter only to non-public endpoints
app.use((req, res, next) => {
  const publicPaths = ['/api/notices/public', '/api/dashboard/public-stats', '/api/system/maintenance', '/api/health'];
  if (publicPaths.includes(req.path)) {
    // Use a more lenient limiter for public endpoints
    const publicLimiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: isDevelopment ? 200 : 50, // Higher limit for public endpoints
      standardHeaders: true,
      legacyHeaders: false,
    });
    return publicLimiter(req, res, next);
  }
  return limiter(req, res, next);
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Maintenance middleware
app.use(async (req, res, next) => {
  try {
    if (!getMaintenance()) return next();
    const allowedPaths = [
      '/api/system/maintenance',
      '/api/health',
      '/api/users/login',
      '/api/users/register',
      '/api/users/refresh',
      '/api/notices/public',
      '/api/dashboard/public-stats'
    ];
    if (allowedPaths.includes(req.path) || req.path.startsWith('/uploads/')) return next();
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        const jwt = (await import('jsonwebtoken')).default;
        const User = (await import('./models/FirebaseUser.js')).default;
        const getJWTSecret = () => {
          const JWT_SECRET = process.env.JWT_SECRET;
          if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
          return JWT_SECRET;
        };
        const decoded = jwt.verify(token, getJWTSecret());
        const user = await User.findById(decoded.userId);
        if (user && user.userType === 'admin') return next();
      }
    } catch {}
    return res.status(503).json({ maintenance: true, message: 'The website is under maintenance. Please try again later.' });
  } catch (e) { return next(); }
});

// System routes for maintenance toggle
import { authenticateToken, requireAdmin } from './middleware/auth.js';
app.get('/api/system/maintenance', async (req, res) => {
  try {
    await loadState();
    const maintenance = getMaintenance();
    res.json({ maintenance });
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    res.status(200).json({ maintenance: false });
  }
});
app.post('/api/system/maintenance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { maintenance } = req.body;
    const state = await setMaintenance(!!maintenance);
    res.json(state);
  } catch (error) {
    console.error('Error setting maintenance status:', error);
    res.status(500).json({ error: 'Failed to set maintenance status' });
  }
});

// Firebase is already initialized in firebase.js
console.log('Firebase connected!');

// Mount routes
import userRoutes from './routes/userRoutes.js';
app.use('/api/users', userRoutes);

import projectRoutes from './routes/projectRoutes.js';
app.use('/api/projects', projectRoutes);

import subjectRoutes from './routes/subjectRoutes.js';
app.use('/api/subjects', subjectRoutes);

import dashboardRoutes from './routes/dashboardRoutes.js';
app.use('/api/dashboard', dashboardRoutes);

import materialRoutes from './routes/materialRoutes.js';
app.use('/api/materials', materialRoutes);

const uploadsPath = path.join(__dirname, 'uploads');
// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsPath);
}
app.use('/uploads', express.static(uploadsPath, {
  // Add error handling for missing files
  fallthrough: false,
  setHeaders: (res, filePath) => {
    // Set appropriate content-type for PDFs
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

import noticeRoutes from './routes/noticeRoutes.js';
app.use('/api/notices', noticeRoutes);

import subscriptionRoutes from './routes/subscriptionRoutes.js';
app.use('/api/subscriptions', subscriptionRoutes);

import quizRoutes from './routes/quizRoutes.js';
app.use('/api/quizzes', quizRoutes);

import offerRoutes from './routes/offerRoutes.js';
app.use('/api/offers', offerRoutes);

import progressRoutes from './routes/progressRoutes.js';
app.use('/api/progress', progressRoutes);

import materialRequestRoutes from './routes/materialRequestRoutes.js';
app.use('/api/material-requests', materialRequestRoutes);

import courseRoutes from './routes/courseRoutes.js';
app.use('/api/courses', courseRoutes);

import enhancedDashboardRoutes from './routes/enhancedDashboardRoutes.js';
app.use('/api/dashboard', enhancedDashboardRoutes);

import notificationRoutes from './routes/notificationRoutes.js';
app.use('/api/notifications', notificationRoutes);

import paymentRoutes from './routes/paymentRoutes.js';
app.use('/api/payments', paymentRoutes);

import analyticsRoutes from './routes/analyticsRoutes.js';
app.use('/api/analytics', analyticsRoutes);

import contactRoutes from './routes/contactRoutes.js';
app.use('/api/contact', contactRoutes);

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Prepare WebSocket server (initialize after HTTP server starts listening)
import notificationService from './websocket.js';

// Error handling middleware (must be last)
import { notFound, errorHandler } from './middleware/errorHandler.js';
app.use(notFound);
app.use(errorHandler);

// ---- Port Handling with Auto-Fallback ----
const PORT = parseInt(process.env.PORT, 10) || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  try {
    notificationService.initialize(server);
  } catch (err) {
    console.error('Failed to initialize WebSocket server:', err);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = PORT + 1;
    console.warn(`⚠️ Port ${PORT} is already in use, trying ${fallbackPort}...`);
    server.listen(fallbackPort, () => {
      console.log(`✅ Server running on port ${fallbackPort}`);
      try {
        notificationService.initialize(server);
      } catch (wsErr) {
        console.error('Failed to initialize WebSocket server on fallback port:', wsErr);
      }
    });
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});
