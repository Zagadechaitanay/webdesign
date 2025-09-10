import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { getMaintenance, setMaintenance, onChange } from './lib/systemState.js';

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
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again later.'
  },
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
// Maintenance middleware: block non-admin requests when enabled
app.use(async (req, res, next) => {
  try {
    if (!getMaintenance()) return next();
    // Allow health, maintenance status, auth, and public endpoints during maintenance
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
    // Allow authenticated admins to continue (toggle it off)
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        const jwt = (await import('jsonwebtoken')).default;
        const User = (await import('./models/User.js')).default;
        const getJWTSecret = () => {
          const JWT_SECRET = process.env.JWT_SECRET;
          if (!JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is required');
          }
          return JWT_SECRET;
        };
        const decoded = jwt.verify(token, getJWTSecret());
        const user = await User.findById(decoded.userId).select('userType');
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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_management_db';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample schema for testing (can be removed if not needed)
const ItemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model('Item', ItemSchema);

// Mount user routes
import userRoutes from './routes/userRoutes.js';
app.use('/api/users', userRoutes);

// Mount project routes
import projectRoutes from './routes/projectRoutes.js';
app.use('/api/projects', projectRoutes);

// Mount subject routes
import subjectRoutes from './routes/subjectRoutes.js';
app.use('/api/subjects', subjectRoutes);

// Mount dashboard routes
import dashboardRoutes from './routes/dashboardRoutes.js';
app.use('/api/dashboard', dashboardRoutes);

// Mount material routes
import materialRoutes from './routes/materialRoutes.js';
app.use('/api/materials', materialRoutes);
// Serve uploaded files
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Mount notice routes
import noticeRoutes from './routes/noticeRoutes.js';
app.use('/api/notices', noticeRoutes);

app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Initialize WebSocket server
import notificationService from './websocket.js';
notificationService.initialize(server);

// Error handling middleware (must be last)
import { notFound, errorHandler } from './middleware/errorHandler.js';

app.use(notFound);
app.use(errorHandler);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 