import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import FirebaseCourse from '../models/FirebaseCourse.js';
import notificationService from '../websocket.js';

const router = express.Router();

// GET /api/courses - list courses (admin only for now)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { branch, semester } = req.query;
    const query = {};
    if (branch) query.branch = branch;
    if (semester) query.semester = isNaN(Number(semester)) ? semester : Number(semester);
    let courses = [];
    try {
      courses = await FirebaseCourse.find(query);
      console.log(`[GET /api/courses] Found ${courses.length} courses from ${process.env.FIREBASE_PROJECT_ID ? 'Firebase' : 'DB'} with query`, query);
    } catch (err) {
      console.error('Error fetching courses from Firebase:', err);
      try {
        courses = await FirebaseCourse.findLocal(query);
        console.log(`[GET /api/courses] Fallback to local DB, found ${courses.length} courses`);
      } catch (localErr) {
        console.error('Error fetching courses from local DB:', localErr);
        courses = [];
      }
    }
    const normalized = courses.map(c => {
      let obj;
      try {
        if (c && typeof c === 'object') {
          obj = {
            id: c.id,
            _id: c._id || c.id,
            title: c.title,
            description: c.description,
            branch: c.branch,
            semester: c.semester,
            subject: c.subject,
            poster: c.poster,
            lectures: Array.isArray(c.lectures) ? c.lectures : [],
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
          };
        } else {
          obj = {};
        }
      } catch (e) {
        console.error('Error normalizing course:', e, c);
        obj = {};
      }
      const id = obj.id || obj._id;
      return {
        ...obj,
        _id: id,
        id,
        createdAt: obj.createdAt ? (obj.createdAt instanceof Date ? obj.createdAt.toISOString() : new Date(obj.createdAt).toISOString()) : new Date().toISOString(),
        updatedAt: obj.updatedAt ? (obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : new Date(obj.updatedAt).toISOString()) : new Date().toISOString(),
      };
    });
    res.json({ courses: normalized });
  } catch (error) {
    console.error('Error listing courses:', error);
    res.status(500).json({ error: 'Failed to list courses', details: error.message });
  }
});

// POST /api/courses - launch new course (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, branch, semester, subject, poster, lectures, coverPhoto } = req.body;
    console.log('[POST /api/courses] Incoming body:', { title, description, branch, semester, subject, hasPoster: !!poster, lecturesCount: Array.isArray(lectures) ? lectures.length : 0 });
    if (!title || !description || !branch || (!semester && semester !== 0) || !subject) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Coerce semester to number if numeric string
    const parsedSemester = typeof semester === 'string' && /^\d+$/.test(semester) ? Number(semester) : semester;
    const course = await FirebaseCourse.create({
      title, description, branch, semester: parsedSemester, subject, poster: poster || null, coverPhoto: coverPhoto || null, lectures: lectures || [], createdBy: req.user?.id
    });
    console.log('[POST /api/courses] Created course:', { id: course.id, title: course.title, branch: course.branch, semester: course.semester, subject: course.subject });
    try {
      await notificationService.broadcast({
        type: 'course_launched',
        course
      });
    } catch {}
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course', details: error.message });
  }
});

export default router;


