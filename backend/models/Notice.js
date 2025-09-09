import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['academic', 'general'], default: 'general' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  targetAudience: { type: String, enum: ['all', 'students', 'final_year'], default: 'all' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiryDate: { type: Date },
  readBy: { type: [String], default: [] },
  branch: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

noticeSchema.methods.isReadBy = function(userId) {
  return this.readBy.includes(userId);
};

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
export default Notice;


