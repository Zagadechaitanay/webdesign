import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';

// Ensure .env is loaded from the backend directory explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath, override: true });

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

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

server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 