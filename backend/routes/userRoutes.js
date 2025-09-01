import express from "express";
const router = express.Router();
import User from "../models/User.js";

router.post("/register", async (req, res) => {
  const { name, email, password, college, studentId, branch, semester, userType } = req.body;
  if (!name || !email || !password || !college || !studentId || !branch) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    // Check for existing user by email or studentId
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email or student ID already exists." });
    }
    const newUser = new User({ 
      name, 
      email, 
      password, 
      college, 
      studentId, 
      branch,
      semester: semester || null,
      userType: userType || 'student'
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login route: allow login by email or studentId and password
router.post("/login", async (req, res) => {
  const { emailOrStudentId, password } = req.body;
  if (!emailOrStudentId || !password) {
    return res.status(400).json({ error: "Email/Student ID and password are required." });
  }
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrStudentId },
        { studentId: emailOrStudentId }
      ],
      password
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    res.status(200).json({ message: "Login successful", user: { name: user.name, email: user.email, studentId: user.studentId, college: user.college, branch: user.branch } });
  } catch (err) {
    res.status(500).json({ error: "Failed to login user" });
  }
});

// Get all users (root level)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: Get all users (alternative endpoint)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Forgot Password endpoint
router.post("/forgot-password", async (req, res) => {
  const { emailOrStudentId } = req.body;
  if (!emailOrStudentId) {
    return res.status(400).json({ error: "Email or Student ID is required." });
  }
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrStudentId },
        { studentId: emailOrStudentId }
      ]
    });
    // Always return success for security, even if user not found
    return res.status(200).json({ message: "If this account exists, a password reset link will be sent." });
  } catch (err) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Delete user endpoint
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router; 