import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['general', 'important', 'urgent', 'announcement', 'maintenance'], 
    default: 'general' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  targetAudience: { 
    type: String, 
    enum: ['all', 'students', 'admins', 'specific_branch'], 
    default: 'all' 
  },
  targetBranch: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date },
  readBy: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  attachments: [{ type: String }],
  tags: [{ type: String }]
}, { timestamps: true });

// Add indexes for better performance
noticeSchema.index({ targetAudience: 1, isActive: 1 });
noticeSchema.index({ targetBranch: 1, isActive: 1 });
noticeSchema.index({ isPinned: -1, createdAt: -1 });
noticeSchema.index({ createdBy: 1 });
noticeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

noticeSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(entry => entry.user.toString() === userId.toString());
};

noticeSchema.methods.markAsRead = function(userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push({ user: userId, readAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
export default Notice;


