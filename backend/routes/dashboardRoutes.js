import express from "express";
import User from "../models/User.js";
import Subject from "../models/Subject.js";

const router = express.Router();

// Get dashboard summary data
router.get("/summary", async (req, res) => {
  try {
    // Get real data from database
    const users = await User.find({});
    const subjects = await Subject.find({});

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

    // Monthly registrations (last 6 months)
    const monthlyData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    for (let i = 0; i < 6; i++) {
      const monthStudents = students.filter(student => {
        const date = new Date(student.createdAt);
        return date.getMonth() === i;
      }).length;
      const monthAdmins = admins.filter(admin => {
        const date = new Date(admin.createdAt);
        return date.getMonth() === i;
      }).length;
      monthlyData.push({
        month: months[i],
        students: monthStudents,
        admins: monthAdmins,
      });
    }

    // Subject distribution by branch
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
