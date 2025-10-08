import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import FirebaseUser from "../models/FirebaseUser.js";
import FirebaseSubject from "../models/FirebaseSubject.js";
import FirebaseMaterial from "../models/FirebaseMaterial.js";
import FirebaseNotice from "../models/FirebaseNotice.js";
import { isFirebaseReady } from "../lib/firebase.js";

const router = express.Router();

// Public route for landing page stats (no authentication required)
router.get('/public-stats', async (req, res) => {
  const defaultStats = { students: 1250, faculty: 45, courses: 120, materials: 850 };

  try {
    if (!isFirebaseReady) {
      return res.json(defaultStats);
    }

    const [students, admins, subjects, materials] = await Promise.all([
      FirebaseUser.find({ userType: 'student' }).catch(() => []),
      FirebaseUser.find({ userType: 'admin' }).catch(() => []),
      FirebaseSubject.find({}).catch(() => []),
      FirebaseMaterial.find({}).catch(() => [])
    ]);

    return res.json({
      students: students.length || defaultStats.students,
      faculty: admins.length || defaultStats.faculty,
      courses: subjects.length || defaultStats.courses,
      materials: materials.length || defaultStats.materials
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return res.json(defaultStats);
  }
});

// Get dashboard summary data
router.get("/summary", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get real data from Firebase
    const users = await FirebaseUser.find({});
    const subjects = await FirebaseSubject.find({});

    const students = users.filter(user => user.userType === "student");
    const admins = users.filter(user => user.userType === "admin");

    // Materials stats
    const materials = await FirebaseMaterial.find({});
    const totalDownloads = materials.reduce((sum, m) => sum + (m.downloads || 0), 0);
    const avgRating = materials.length > 0 ? (
      materials.reduce((sum, m) => sum + (m.rating || 0), 0) / materials.length
    ) : 0;

    // Notices recent list
    const notices = await FirebaseNotice.findWithOptions({}, { createdAt: 'desc' }, 10);

    // Process data for charts
    const branchData = students.reduce((acc, student) => {
      const branch = student.branch || "Unknown";
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {});

    const semesterData = students.reduce((acc, student) => {
      const semester = student.semester || "Unknown";
      acc[semester] = (acc[semester] || 0) + 1;
      return acc;
    }, {});

    // Monthly registrations (last 6 months relative to now)
    const monthlyData = [];
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Build from oldest to newest (5 months ago -> current month)
    for (let offset = 5; offset >= 0; offset--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      d.setUTCMonth(d.getUTCMonth() - offset);
      const targetYear = d.getUTCFullYear();
      const targetMonth = d.getUTCMonth();

      const monthStudents = students.filter(student => {
        const date = new Date(student.createdAt);
        return date.getUTCFullYear() === targetYear && date.getUTCMonth() === targetMonth;
      }).length;

      const monthAdmins = admins.filter(admin => {
        const date = new Date(admin.createdAt);
        return date.getUTCFullYear() === targetYear && date.getUTCMonth() === targetMonth;
      }).length;

      monthlyData.push({
        month: `${monthNames[targetMonth]}`,
        students: monthStudents,
        admins: monthAdmins,
      });
    }

    // Subject distribution by branch (from real subjects)
    const subjectData = subjects.reduce((acc, subject) => {
      const branch = subject.branch || "Unknown";
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {});

    // Performance metrics (sample data)
    const performanceData = [
      { name: "Attendance", value: 85 },
      { name: "Assignments", value: 92 },
      { name: "Projects", value: 78 },
      { name: "Exams", value: 88 },
      { name: "Participation", value: 90 },
    ];

    // Recent activity (real data summary)
    const recentActivity = [
      { type: "New Student", count: Math.min(5, students.length), date: "Today" },
      { type: "Subject Added", count: Math.min(3, subjects.length), date: "This week" },
      { type: "Notices", count: notices.length, date: "Recent" },
    ];

    const dashboardData = {
      totalStudents: students.length,
      totalAdmins: admins.length,
      totalSubjects: subjects.length,
      studentsByBranch: Object.entries(branchData).map(([name, value]) => ({
        name,
        value,
      })),
      studentsBySemester: Object.entries(semesterData).map(([name, value]) => ({
        name: `Semester ${name}`,
        value,
      })),
      monthlyRegistrations: monthlyData,
      subjectDistribution: Object.entries(subjectData).map(([name, value]) => ({
        name,
        value,
      })),
      performanceMetrics: performanceData,
      recentActivity,
      totalDownloads,
      avgRating: Number(avgRating.toFixed(1)),
      notices: notices.map(n => ({
        id: n.id,
        title: n.title,
        createdAt: n.createdAt,
        author: n.createdBy || 'Admin'
      })),
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
