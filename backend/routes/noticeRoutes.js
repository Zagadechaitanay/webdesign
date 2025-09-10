import express from 'express';
import notificationService from '../websocket.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate, noticeCreateSchema } from '../middleware/validation.js';
import Notice from '../models/Notice.js';

const router = express.Router();

// Public route for landing page notices (no authentication required)
router.get('/public', async (req, res) => {
  try {
    // Return sample public notices for landing page
    const publicNotices = [
      {
        _id: "public1",
        title: "Welcome to Digital Gurukul",
        content: "Welcome to our comprehensive learning management system. Explore courses, projects, and connect with fellow students.",
        type: "general",
        priority: "medium",
        targetAudience: "all",
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: "public2", 
        title: "New Course Materials Available",
        content: "Check out the latest course materials and resources uploaded by our faculty members.",
        type: "academic",
        priority: "medium",
        targetAudience: "students",
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json(publicNotices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public notices', error: error.message });
  }
});

// Get all notices (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
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

// Get notices for specific user (real data)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Load user details for targeting
    const User = (await import('../models/User.js')).default;
    const Notice = (await import('../models/Notice.js')).default;
    const user = await User.findById(userId).select('userType branch');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build audience filter
    const audienceFilter = [{ targetAudience: 'all' }];
    if (user.userType === 'student') audienceFilter.push({ targetAudience: 'students' });
    if (user.userType === 'admin') audienceFilter.push({ targetAudience: 'admins' });
    if (user.branch) audienceFilter.push({ targetAudience: 'specific_branch', targetBranch: user.branch });

    const notices = await Notice.find({
      isActive: true,
      $or: audienceFilter
    })
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    // Compute isRead per user
    const mapped = notices.map(n => ({
      ...n,
      isRead: Array.isArray(n.readBy)
        ? n.readBy.some((entry) => (entry.user?.toString?.() || entry.user) === userId)
        : false
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user notices', error: error.message });
  }
});

// Get single notice by ID
router.get('/:id', authenticateToken, async (req, res) => {
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
router.post('/', authenticateToken, requireAdmin, validate(noticeCreateSchema), async (req, res) => {
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

    // Validation is handled by middleware

    // Use the authenticated user's ID
    const createdBy = req.user._id;

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
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
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
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
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
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await notice.markAsRead(userId);
    res.json({ message: 'Notice marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notice as read', error: error.message });
  }
});

// Get notice statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
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