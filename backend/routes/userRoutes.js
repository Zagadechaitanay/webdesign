const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { name, email, password, college, studentId, branch } = req.body;
  if (!name || !email || !password || !college || !studentId || !branch) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    // Check for existing user by email or studentId
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email or student ID already exists." });
    }
    const newUser = new User({ name, email, password, college, studentId, branch });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
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

// Admin: Get all users
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

module.exports = router; 