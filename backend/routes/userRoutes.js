import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validate, userRegistrationSchema, userLoginSchema } from "../middleware/validation.js";
import FirebaseUser from "../models/FirebaseUser.js";
// Firebase is the sole data store now
import notificationService from "../websocket.js";

const getJWTSecret = () => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return JWT_SECRET;
};

// Rate limiting for auth routes (relaxed in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000,
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate(userRegistrationSchema), async (req, res) => {
  const { name, email, password, college, studentId, branch, semester, userType } = req.body;
  try {
    // Check for existing user by email or studentId
    const existingUser = await FirebaseUser.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email or student ID already exists." });
    }
    // Hash password and create in Firebase
    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await FirebaseUser.create({
      name,
      email,
      password: hashedPassword,
      college,
      studentId,
      branch,
      semester: semester || null,
      userType: userType || 'student'
    });
    // Notify admins in real-time
    try { await notificationService.notifyUserCreated(created); } catch {}
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: (created.id || created._id), userType: created.userType },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: (created.id || created._id),
        name: created.name,
        email: created.email,
        studentId: created.studentId,
        branch: created.branch,
        semester: created.semester,
        userType: created.userType
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login route: allow login by email or studentId and password
router.post("/login", authLimiter, validate(userLoginSchema), async (req, res) => {
  const { emailOrStudentId, password } = req.body;
  try {
    // Find user by email or studentId in Firebase
    const user = await FirebaseUser.findOne({ $or: [{ email: emailOrStudentId }, { studentId: emailOrStudentId }] });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Check password for Firebase user
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      message: "Login successful", 
      token,
      user: { 
        id: user.id,
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
      { userId: req.user.id, userType: req.user.userType },
      getJWTSecret(),
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
      id: req.user.id,
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
    const users = await FirebaseUser.find({});
    const usersWithoutPassword = users.map(user => user.toJSON());
    res.status(200).json(usersWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: Get all users (alternative endpoint)
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await FirebaseUser.find({});
    const usersWithoutPassword = users.map(user => user.toJSON());
    res.status(200).json(usersWithoutPassword);
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
    const user = await FirebaseUser.findOne({
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
    const user = await FirebaseUser.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    try { await notificationService.notifyUserDeleted(user.id.toString()); } catch {}
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router; 