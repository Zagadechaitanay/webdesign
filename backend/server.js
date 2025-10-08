import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { getMaintenance, setMaintenance, onChange } from './lib/systemState.js';
import { db } from './lib/firebase.js';

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

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
app.get('/api/system/maintenance', (req, res) => {
  res.json({ maintenance: getMaintenance() });
});
app.post('/api/system/maintenance', authenticateToken, requireAdmin, async (req, res) => {
  const { maintenance } = req.body;
  const state = await setMaintenance(!!maintenance);
  res.json(state);
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
app.use('/uploads', express.static(uploadsPath));

import noticeRoutes from './routes/noticeRoutes.js';
app.use('/api/notices', noticeRoutes);

// Sample items endpoint using Firebase
app.post('/api/items', async (req, res) => {
  try {
    const itemRef = db.collection('items').doc();
    const item = {
      id: itemRef.id,
      name: req.body.name,
      createdAt: new Date()
    };
    await itemRef.set(item);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
