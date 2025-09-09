import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      studentId,
      branch,
      semester: semester || null,
      userType: userType || 'student'
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        studentId: newUser.studentId,
        branch: newUser.branch,
        semester: newUser.semester,
        userType: newUser.userType
      }
    });
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
    // Try to find user by email first, then by studentId
    const user = await User.findOne({ $or: [{ email: emailOrStudentId }, { studentId: emailOrStudentId }] });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      message: "Login successful", 
      token,
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        studentId: user.studentId, 
        college: user.college, 
        branch: user.branch,
        semester: user.semester,
        userType: user.userType
      } 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login user" });
  }
});

// Refresh token endpoint
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const token = jwt.sign(
      { userId: req.user._id, userType: req.user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      studentId: req.user.studentId,
      branch: req.user.branch,
      semester: req.user.semester,
      userType: req.user.userType
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Get all users (admin only)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: Get all users (alternative endpoint)
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
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
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
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