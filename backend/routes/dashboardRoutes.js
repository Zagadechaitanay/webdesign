import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";

const router = express.Router();

// Public route for landing page stats (no authentication required)
router.get('/public-stats', async (req, res) => {
  try {
    // Return sample stats for landing page
    const publicStats = {
      students: 1250,
      faculty: 45,
      courses: 120,
      materials: 850
    };
    
    res.json(publicStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public stats', error: error.message });
  }
});

// Get dashboard summary data
router.get("/summary", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get real data from MongoDB
    const users = await User.find({}, 'name email branch semester userType createdAt');
    const subjects = await Subject.find({}, 'branch semester createdAt');

    const students = users.filter(user => user.userType === "student");
    const admins = users.filter(user => user.userType === "admin");

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

    // Recent activity (sample data)
    const recentActivity = [
      { type: "New Student", count: students.length > 0 ? Math.min(5, students.length) : 0, date: "Today" },
      { type: "Subject Added", count: subjects.length > 0 ? Math.min(3, subjects.length) : 0, date: "Yesterday" },
      { type: "Project Submitted", count: 12, date: "2 days ago" },
      { type: "Notice Posted", count: 2, date: "3 days ago" },
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
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
