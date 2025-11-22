import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { authenticateToken, requireAdmin, authenticateTokenAllowExpired } from "../middleware/auth.js";
import { validate, userRegistrationSchema, userLoginSchema } from "../middleware/validation.js";
import FirebaseUser from "../models/FirebaseUser.js";
import { db, isFirebaseReady, admin } from "../lib/firebase.js";
// Firebase is the sole data store now
import notificationService from "../websocket.js";

// Lazy load nodemailer (only if needed and available)
const getNodemailer = () => {
  try {
    return require("nodemailer");
  } catch (err) {
    return null;
  }
};

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map(); // { email/phone: { otp, expiresAt } }

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email OTP - Simple free solution using console (for development)
// In production, you can integrate with free services like Resend, SendGrid free tier, etc.
const sendEmailOTP = async (email, otp) => {
  try {
    // Always use console logging for now (free and reliable)
    // Users can check the server console to get their OTP
    console.log('\n========================================');
    console.log('📧 EMAIL OTP VERIFICATION');
    console.log('========================================');
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires in: 10 minutes`);
    console.log('========================================\n');
    
    // Optional: Try to send via SMTP if configured (but don't fail if it doesn't work)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailerModule = getNodemailer();
        if (nodemailerModule) {
          const transporter = nodemailerModule.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          });

          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'DigiDiploma - Email Verification OTP',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">DigiDiploma Email Verification</h2>
                <p>Your OTP for email verification is:</p>
                <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            `
          });
          console.log(`✅ Email sent successfully to ${email}`);
        }
      } catch (emailError) {
        console.log(`⚠️ Email sending failed, but OTP is logged above`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in sendEmailOTP:', error);
    // Always return true - OTP is logged to console
    return true;
  }
};

// Send SMS OTP - Simple free solution using console (for development)
// In production, you can use free services like Twilio trial, AWS SNS, etc.
const sendSMSOTP = async (phone, otp) => {
  try {
    // Always use console logging for now (free and reliable)
    // Users can check the server console to get their OTP
    console.log('\n========================================');
    console.log('📱 PHONE OTP VERIFICATION');
    console.log('========================================');
    console.log(`Phone: ${phone}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires in: 10 minutes`);
    console.log('========================================\n');
    
    // Optional: Try to send via SMS service if configured (but don't fail if it doesn't work)
    // You can integrate free SMS services here if needed
    
    return true;
  } catch (error) {
    console.error('Error in sendSMSOTP:', error);
    // Always return true - OTP is logged to console
    return true;
  }
};

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
  const { name, email, password, college, studentId, branch, semester, userType, phone } = req.body;
  try {
    // Verify email OTP
    const emailOTPData = otpStore.get(`email:${email}`);
    if (!emailOTPData || !emailOTPData.verified) {
      return res.status(400).json({ error: "Email not verified. Please verify your email with OTP first." });
    }
    
    // Verify phone OTP (required if phone is provided)
    if (phone && phone.trim() !== '') {
      const phoneOTPData = otpStore.get(`phone:${phone}`);
      if (!phoneOTPData || !phoneOTPData.verified) {
        return res.status(400).json({ error: "Phone number not verified. Please verify your phone with OTP first." });
      }
    }
    
    // Check for existing user by email, studentId, or phone
    const existingUser = await FirebaseUser.findOne({ 
      $or: [
        { email }, 
        { studentId },
        ...(phone ? [{ phone }] : [])
      ] 
    });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email, enrollment number, or phone number already exists." });
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
      userType: userType || 'student',
      phone: phone || ''
    });
    
    // Clear OTPs after successful registration
    otpStore.delete(`email:${email}`);
    if (phone) otpStore.delete(`phone:${phone}`);
    
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
        userType: created.userType,
        phone: created.phone
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

// Refresh token endpoint - allows expired tokens
router.post("/refresh", authenticateTokenAllowExpired, async (req, res) => {
  try {
    const token = jwt.sign(
      { userId: req.user.id, userType: req.user.userType },
      getJWTSecret(),
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (err) {
    console.error("Error refreshing token:", err);
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

// Send Email OTP
router.post("/send-email-otp", authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  
  // Generate and store OTP first (before any async checks)
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(`email:${email}`, { otp, expiresAt, verified: false });
  
  // Check if email already exists (non-blocking - don't fail if check fails)
  const checkExisting = async () => {
    try {
      const existingUser = await FirebaseUser.findOne({ email });
      if (existingUser) {
        return true; // Email exists
      }
      return false; // Email doesn't exist
    } catch (checkError) {
      console.log("Note: Could not check existing email, proceeding anyway");
      return false; // Assume doesn't exist if check fails
    }
  };
  
  // Check in background (don't block OTP sending)
  checkExisting().then(exists => {
    if (exists) {
      console.log(`⚠️ Warning: Email ${email} already registered, but OTP was sent anyway`);
    }
  }).catch(() => {});
  
  try {
    // Send OTP (always succeeds - logs to console)
    await sendEmailOTP(email, otp);
    
    res.status(200).json({ 
      message: "OTP sent successfully",
      note: "Check the server console/terminal for your OTP code"
    });
  } catch (err) {
    console.error("Error sending email OTP:", err);
    // OTP is already stored, so return success anyway
    res.status(200).json({ 
      message: "OTP generated successfully",
      note: "Check the server console/terminal for your OTP code"
    });
  }
});

// Verify Email OTP
router.post("/verify-email-otp", authLimiter, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }
  
  try {
    const stored = otpStore.get(`email:${email}`);
    
    if (!stored) {
      return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    }
    
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`email:${email}`);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    
    // Mark as verified (store in a separate map or extend expiry)
    otpStore.set(`email:${email}`, { ...stored, verified: true });
    
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Error verifying email OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Send Phone OTP
router.post("/send-phone-otp", authLimiter, async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  
  // Basic phone validation (more lenient)
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return res.status(400).json({ error: "Invalid phone number format. Please use format: +91 9876543210 or 9876543210" });
  }
  
  // Generate and store OTP first (before any async checks)
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(`phone:${phone}`, { otp, expiresAt, verified: false });
  
  // Check if phone already exists (non-blocking - don't fail if check fails)
  const checkExisting = async () => {
    try {
      const existingUser = await FirebaseUser.findOne({ phone });
      if (existingUser) {
        return true; // Phone exists
      }
      return false; // Phone doesn't exist
    } catch (checkError) {
      console.log("Note: Could not check existing phone, proceeding anyway");
      return false; // Assume doesn't exist if check fails
    }
  };
  
  // Check in background (don't block OTP sending)
  checkExisting().then(exists => {
    if (exists) {
      console.log(`⚠️ Warning: Phone ${phone} already registered, but OTP was sent anyway`);
    }
  }).catch(() => {});
  
  try {
    // Send OTP (always succeeds - logs to console)
    await sendSMSOTP(phone, otp);
    
    res.status(200).json({ 
      message: "OTP sent successfully",
      note: "Check the server console/terminal for your OTP code"
    });
  } catch (err) {
    console.error("Error sending phone OTP:", err);
    // OTP is already stored, so return success anyway
    res.status(200).json({ 
      message: "OTP generated successfully",
      note: "Check the server console/terminal for your OTP code"
    });
  }
});

// Verify Phone OTP
router.post("/verify-phone-otp", authLimiter, async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone and OTP are required" });
  }
  
  try {
    const stored = otpStore.get(`phone:${phone}`);
    
    if (!stored) {
      return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    }
    
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`phone:${phone}`);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    
    // Mark as verified
    otpStore.set(`phone:${phone}`, { ...stored, verified: true });
    
    res.status(200).json({ message: "Phone verified successfully" });
  } catch (err) {
    console.error("Error verifying phone OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Forgot Password endpoint
router.post("/forgot-password", authLimiter, async (req, res) => {
  const { emailOrStudentId } = req.body;
  if (!emailOrStudentId) {
    return res.status(400).json({ error: "Email or Enrollment Number is required." });
  }
  try {
    const user = await FirebaseUser.findOne({
      $or: [
        { email: emailOrStudentId },
        { studentId: emailOrStudentId }
      ]
    });
    
    if (user && user.email) {
      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        getJWTSecret(),
        { expiresIn: '1h' }
      );
      
      // Store reset token (in production, use database)
      otpStore.set(`reset:${user.id}`, { token: resetToken, expiresAt: Date.now() + 60 * 60 * 1000 });
      
      // Send reset email
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const nodemailerModule = getNodemailer();
          if (nodemailerModule) {
            const transporter = nodemailerModule.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
              }
            });
            
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
            
            await transporter.sendMail({
              from: process.env.SMTP_USER,
              to: user.email,
              subject: 'DigiDiploma - Password Reset',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #6366f1;">Password Reset Request</h2>
                  <p>You requested to reset your password. Click the link below to reset it:</p>
                  <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                  <p>Or copy this link: ${resetLink}</p>
                  <p>This link will expire in 1 hour.</p>
                  <p>If you didn't request this, please ignore this email.</p>
                </div>
              `
            });
          }
        } catch (emailErr) {
          console.error('Error sending reset email:', emailErr);
        }
      }
    }
    
    // Always return success for security, even if user not found
    return res.status(200).json({ message: "If this account exists, a password reset link will be sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
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