import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
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
  targetBranch: {
    type: String,
    required: function() {
      return this.targetAudience === 'specific_branch';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
noticeSchema.index({ isActive: 1, createdAt: -1 });
noticeSchema.index({ type: 1, priority: 1 });
noticeSchema.index({ targetAudience: 1, targetBranch: 1 });
noticeSchema.index({ expiresAt: 1 });

// Virtual for checking if notice is expired
noticeSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Method to mark as read by user
noticeSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({ user: userId });
    this.save();
  }
};

// Method to get read status for user
noticeSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Static method to get active notices for user
noticeSchema.statics.getActiveNoticesForUser = function(userId, userBranch, userType) {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { targetAudience: 'all' },
      { targetAudience: userType },
      { targetAudience: 'specific_branch', targetBranch: userBranch }
    ],
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  }).sort({ isPinned: -1, priority: -1, createdAt: -1 });
};

export default mongoose.model('Notice', noticeSchema);
