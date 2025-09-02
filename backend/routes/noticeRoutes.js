import express from 'express';
import Notice from '../models/Notice.js';
import User from '../models/User.js';
import notificationService from '../websocket.js';

const router = express.Router();

// Get all notices (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, priority, targetAudience, isActive } = req.query;
    const query = {};

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const notices = await Notice.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
});

// Get notices for specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notices = await Notice.getActiveNoticesForUser(userId, user.branch, user.userType);
    
    // Add read status for each notice
    const noticesWithReadStatus = notices.map(notice => ({
      ...notice.toObject(),
      isRead: notice.isReadBy(userId)
    }));

    res.json(noticesWithReadStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user notices', error: error.message });
  }
});

// Get single notice by ID
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('readBy.user', 'name email');

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Increment view count
    notice.views += 1;
    await notice.save();

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notice', error: error.message });
  }
});

// Create new notice (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      targetBranch,
      isPinned,
      expiresAt,
      attachments,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // For now, we'll use a default admin user ID
    // In a real app, this would come from the authenticated user
    const createdBy = req.body.createdBy || '507f1f77bcf86cd799439011'; // Default admin ID

    const notice = new Notice({
      title,
      content,
      type: type || 'general',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      targetBranch: targetAudience === 'specific_branch' ? targetBranch : undefined,
      isPinned: isPinned || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      attachments: attachments || [],
      tags: tags || [],
      createdBy
    });

    await notice.save();
    await notice.populate('createdBy', 'name email');

    // Send real-time notification to all relevant users
    await notificationService.broadcastNotice(notice);

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notice', error: error.message });
  }
});

// Update notice (admin only)
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      targetBranch,
      isActive,
      isPinned,
      expiresAt,
      attachments,
      tags
    } = req.body;

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Update fields
    if (title) notice.title = title;
    if (content) notice.content = content;
    if (type) notice.type = type;
    if (priority) notice.priority = priority;
    if (targetAudience) notice.targetAudience = targetAudience;
    if (targetBranch) notice.targetBranch = targetBranch;
    if (isActive !== undefined) notice.isActive = isActive;
    if (isPinned !== undefined) notice.isPinned = isPinned;
    if (expiresAt) notice.expiresAt = new Date(expiresAt);
    if (attachments) notice.attachments = attachments;
    if (tags) notice.tags = tags;

    await notice.save();
    await notice.populate('createdBy', 'name email');

    // Send real-time notification about the update
    await notificationService.updateNotice(notice);

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notice', error: error.message });
  }
});

// Delete notice (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    
    // Send real-time notification about the deletion
    await notificationService.deleteNotice(req.params.id);
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notice', error: error.message });
  }
});

// Mark notice as read
router.post('/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    notice.markAsRead(userId);
    res.json({ message: 'Notice marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notice as read', error: error.message });
  }
});

// Get notice statistics (admin only)
router.get('/stats/overview', async (req, res) => {
  try {
    const totalNotices = await Notice.countDocuments();
    const activeNotices = await Notice.countDocuments({ isActive: true });
    const pinnedNotices = await Notice.countDocuments({ isPinned: true });
    const urgentNotices = await Notice.countDocuments({ priority: 'urgent', isActive: true });
    
    const noticesByType = await Notice.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const noticesByPriority = await Notice.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      totalNotices,
      activeNotices,
      pinnedNotices,
      urgentNotices,
      noticesByType,
      noticesByPriority
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notice statistics', error: error.message });
  }
});

export default router;