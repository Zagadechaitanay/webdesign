import express from 'express';
import notificationService from '../websocket.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate, noticeCreateSchema } from '../middleware/validation.js';
import FirebaseNotice from '../models/FirebaseNotice.js';

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

    const all = await FirebaseNotice.find(query);
    // Manual pagination since Firestore queries differ
    const start = (page - 1) * limit;
    const end = start + Number(limit);
    const notices = all.slice(start, end);
    const total = all.length;

    res.json({ notices, totalPages: Math.ceil(total / limit), currentPage: Number(page), total });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
});

// Get notices for specific user (real data)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Load user details for targeting
    const FirebaseUser = (await import('../models/FirebaseUser.js')).default;
    const user = await FirebaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build audience filter
    const audienceFilter = [{ targetAudience: 'all' }];
    if (user.userType === 'student') audienceFilter.push({ targetAudience: 'students' });
    if (user.userType === 'admin') audienceFilter.push({ targetAudience: 'admins' });
    if (user.branch) audienceFilter.push({ targetAudience: 'specific_branch', targetBranch: user.branch });

    // Filter client-side to simulate $or
    const all = await FirebaseNotice.find({ isActive: true });
    const notices = all.filter(n => {
      return audienceFilter.some(f => {
        if (f.targetAudience === 'specific_branch') {
          return n.targetAudience === 'specific_branch' && n.targetBranch === f.targetBranch;
        }
        return n.targetAudience === f.targetAudience;
      });
    });

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
    const notice = await FirebaseNotice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Increment view count
    notice.views = (notice.views || 0) + 1;
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
    const createdBy = req.user.id;

    const notice = await FirebaseNotice.create({
      title,
      content,
      type: type || 'general',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      targetBranch: targetAudience === 'specific_branch' ? targetBranch : null,
      isPinned: isPinned || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      attachments: attachments || [],
      tags: tags || [],
      createdBy
    });

    // Send real-time notification to all relevant users and admins activity
    await notificationService.broadcastNotice(notice);
    try { await notificationService.notifyNoticePublished(notice); } catch {}

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

    const notice = await FirebaseNotice.findById(req.params.id);
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

    // Send real-time notification about the update
    await notificationService.updateNotice(notice);
    try { await notificationService.notifyNoticePublished(notice); } catch {}

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notice', error: error.message });
  }
});

// Delete notice (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const notice = await FirebaseNotice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await FirebaseNotice.findByIdAndDelete(req.params.id);
    
    // Send real-time notification about the deletion
    await notificationService.deleteNotice(req.params.id);
    try { await notificationService.notifyNoticePublished({ _id: req.params.id, deleted: true, title: notice.title }); } catch {}
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notice', error: error.message });
  }
});

// Mark notice as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const notice = await FirebaseNotice.findById(req.params.id);
    
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
    const all = await FirebaseNotice.find({});
    const totalNotices = all.length;
    const activeNotices = all.filter(n => n.isActive).length;
    const pinnedNotices = all.filter(n => n.isPinned).length;
    const urgentNotices = all.filter(n => n.priority === 'urgent' && n.isActive).length;
    const noticesByType = Object.entries(all.reduce((acc, n) => { acc[n.type] = (acc[n.type] || 0) + 1; return acc; }, {})).map(([type, count]) => ({ type, count }));
    const noticesByPriority = Object.entries(all.reduce((acc, n) => { acc[n.priority] = (acc[n.priority] || 0) + 1; return acc; }, {})).map(([priority, count]) => ({ priority, count }));

    res.json({ totalNotices, activeNotices, pinnedNotices, urgentNotices, noticesByType, noticesByPriority });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notice statistics', error: error.message });
  }
});

export default router;