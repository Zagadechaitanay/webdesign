import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const Notice = mongoose.models.Notice || mongoose.model('Notice', new mongoose.Schema({
  title: String,
  content: String,
  type: String,
  priority: String,
  targetAudience: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
  isPinned: Boolean,
  views: Number,
  readBy: [Object],
  createdAt: Date
}));

async function updateNotices() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college_management_db');
    console.log('Connected to MongoDB');
    
    // Update existing notices to use correct types
    const result1 = await Notice.updateMany(
      { type: 'academic' },
      { $set: { type: 'important' } }
    );
    console.log(`Updated ${result1.modifiedCount} notices from 'academic' to 'important'`);
    
    const result2 = await Notice.updateMany(
      { targetAudience: 'final_year' },
      { $set: { targetAudience: 'students' } }
    );
    console.log(`Updated ${result2.modifiedCount} notices from 'final_year' to 'students'`);
    
    const notices = await Notice.find();
    console.log(`\nTotal notices: ${notices.length}`);
    notices.forEach(n => console.log(`- ${n.title} (${n.type}, ${n.priority}, ${n.targetAudience})`));
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateNotices();
