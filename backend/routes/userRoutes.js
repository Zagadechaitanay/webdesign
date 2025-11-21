import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validate, userRegistrationSchema, userLoginSchema } from "../middleware/validation.js";
import FirebaseUser from "../models/FirebaseUser.js";
import { db, isFirebaseReady, admin } from "../lib/firebase.js";
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
    console.log(`🔐 Login attempt for: ${emailOrStudentId}`);
    
    // Find user by email or studentId in Firebase
    const user = await FirebaseUser.findOne({ $or: [{ email: emailOrStudentId }, { studentId: emailOrStudentId }] });
    
    if (!user) {
      console.log(`❌ User not found: ${emailOrStudentId}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    console.log(`✅ User found: ${user.email || user.studentId} (ID: ${user.id})`);

    // Check password for Firebase user
    if (!user.password) {
      console.error('❌ User has no password stored');
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for user: ${user.email || user.studentId}`);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    console.log(`✅ Password valid for user: ${user.email || user.studentId}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    console.log(`✅ Login successful, token generated for user: ${user.id}`);

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
    console.error("❌ Login error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Failed to login user", details: err.message });
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

// Get current user profile (must be before /:id route)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("GET /profile route hit");
    const user = await FirebaseUser.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      college: user.college,
      branch: user.branch,
      semester: user.semester,
      userType: user.userType,
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update current user profile (must be before /:id route)
router.put("/profile", authenticateToken, async (req, res) => {
  console.log("PUT /profile route hit");
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, phone, address, bio, avatar, branch, semester } = req.body;
    const userId = req.user.id;
    
    const user = await FirebaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update allowed fields (email and studentId cannot be changed)
    const updates = {};
    if (name !== undefined && name !== null && name !== '') {
      updates.name = String(name).trim();
    }
    if (phone !== undefined) {
      updates.phone = phone !== null && phone !== '' ? String(phone).trim() : '';
    }
    if (address !== undefined) {
      updates.address = address !== null && address !== '' ? String(address).trim() : '';
    }
    if (bio !== undefined) {
      updates.bio = bio !== null && bio !== '' ? String(bio).trim() : '';
    }
    if (avatar !== undefined && avatar !== null && avatar !== '') {
      updates.avatar = String(avatar);
    }
    if (branch !== undefined && branch !== null && branch !== '') {
      updates.branch = String(branch).trim();
    }
    if (semester !== undefined && semester !== null && semester !== '') {
      // Convert semester to number if it's a string
      const semNum = typeof semester === 'string' ? parseInt(semester, 10) : semester;
      updates.semester = isNaN(semNum) ? null : semNum;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Update user in Firebase or JSON database
    console.log("isFirebaseReady:", isFirebaseReady);
    console.log("Updates to apply:", updates);
    
    try {
      if (isFirebaseReady && db) {
        console.log("Updating user in Firebase...");
        const updateData = {
          ...updates,
          updatedAt: new Date()
        };
        await db.collection('users').doc(userId).update(updateData);
        console.log("Firebase update successful");
      } else {
        console.log("Updating user in JSON database...");
        // Fallback to JSON database - convert Date to ISO string
        const jsonUpdateData = {
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await FirebaseUser._jsonUpdate(userId, jsonUpdateData);
        console.log("JSON update successful");
      }

      // Fetch updated user
      console.log("Fetching updated user...");
      const updatedUser = await FirebaseUser.findById(userId);
      if (!updatedUser) {
        console.error("User not found after update");
        return res.status(404).json({ error: "User not found after update" });
      }
      
      console.log("Profile updated successfully");
      res.json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          studentId: updatedUser.studentId,
          college: updatedUser.college,
          branch: updatedUser.branch,
          semester: updatedUser.semester,
          userType: updatedUser.userType,
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          bio: updatedUser.bio || '',
          avatar: updatedUser.avatar || ''
        }
      });
    } catch (updateError) {
      console.error("Update error occurred:", updateError);
      console.error("Error name:", updateError.name);
      console.error("Error message:", updateError.message);
      if (updateError.stack) {
        console.error("Error stack:", updateError.stack);
      }
      
      // If Firebase update fails, try JSON fallback
      if (isFirebaseReady) {
        console.log("Firebase update failed, trying JSON fallback...");
        try {
          const jsonUpdateData = {
            ...updates,
            updatedAt: new Date().toISOString()
          };
          await FirebaseUser._jsonUpdate(userId, jsonUpdateData);
          const updatedUser = await FirebaseUser.findById(userId);
          if (!updatedUser) {
            return res.status(404).json({ error: "User not found after update" });
          }
          res.json({
            message: "Profile updated successfully",
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              studentId: updatedUser.studentId,
              college: updatedUser.college,
              branch: updatedUser.branch,
              semester: updatedUser.semester,
              userType: updatedUser.userType,
              phone: updatedUser.phone || '',
              address: updatedUser.address || '',
              bio: updatedUser.bio || '',
              avatar: updatedUser.avatar || ''
            }
          });
        } catch (jsonError) {
          console.error("JSON fallback also failed:", jsonError);
          console.error("JSON error message:", jsonError.message);
          throw jsonError;
        }
      } else {
        // If we're already using JSON and it failed, throw the error
        throw updateError;
      }
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    console.error("Error details:", err.message);
    if (err.stack) {
      console.error("Stack trace:", err.stack);
    }
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
});

// Upload profile picture
router.post("/profile/avatar", authenticateToken, async (req, res) => {
  try {
    const { avatar } = req.body; // Base64 image or URL
    if (!avatar) {
      return res.status(400).json({ error: "Avatar data is required" });
    }

    // Validate base64 string size (max 2MB)
    if (avatar.length > 3 * 1024 * 1024) { // Approximate 2MB in base64
      return res.status(400).json({ error: "Image too large. Maximum size is 2MB" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const user = await FirebaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update avatar
    try {
      if (isFirebaseReady && db) {
        // Firestore can handle JavaScript Date objects directly
        const updateData = {
          avatar: avatar,
          updatedAt: new Date()
        };
        await db.collection('users').doc(userId).update(updateData);
      } else {
        await FirebaseUser._jsonUpdate(userId, { 
          avatar: avatar,
          updatedAt: new Date().toISOString()
        });
      }

      res.json({ message: "Avatar updated successfully", avatar });
    } catch (updateError) {
      console.error("Firebase update error:", updateError);
      console.error("Update error details:", updateError.message);
      if (updateError.stack) {
        console.error("Stack trace:", updateError.stack);
      }
      // If Firebase update fails, try JSON fallback
      if (isFirebaseReady) {
        try {
          await FirebaseUser._jsonUpdate(userId, { 
            avatar: avatar,
            updatedAt: new Date().toISOString()
          });
          res.json({ message: "Avatar updated successfully", avatar });
        } catch (jsonError) {
          console.error("JSON fallback error:", jsonError);
          throw jsonError;
        }
      } else {
        throw updateError;
      }
    }
  } catch (err) {
    console.error("Error updating avatar:", err);
    console.error("Error details:", err.message);
    if (err.stack) {
      console.error("Stack trace:", err.stack);
    }
    res.status(500).json({ error: "Failed to update avatar", details: err.message });
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