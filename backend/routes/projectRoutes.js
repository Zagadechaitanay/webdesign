import express from "express";
const router = express.Router();
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { db, isFirebaseReady } from "../lib/firebase.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, '../database/projects.json');
const REQUESTS_PATH = path.resolve(__dirname, '../database/project_requests.json');

function readLocalProjects() {
  try {
    if (!fs.existsSync(DATA_PATH)) return [];
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch { return []; }
}

function writeLocalProjects(items) {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch {}
}

function readLocalRequests() {
  try {
    if (!fs.existsSync(REQUESTS_PATH)) return [];
    const raw = fs.readFileSync(REQUESTS_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch { return []; }
}

function writeLocalRequests(items) {
  try {
    const dir = path.dirname(REQUESTS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REQUESTS_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch {}
}

// Check if student can download (must have uploaded at least 1 project)
async function canStudentDownload(studentId) {
  try {
    if (isFirebaseReady && db) {
      const snap = await db.collection('projects')
        .where('studentId', '==', studentId)
        .where('status', '==', 'approved')
        .get();
      return snap.size >= 1;
    }
    const projects = readLocalProjects();
    const studentProjects = projects.filter(p => p.studentId === studentId && p.status === 'approved');
    return studentProjects.length >= 1;
  } catch { return false; }
}

// Create a new project (student or admin)
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const {
      title, description, category, techStack, studentId, studentName, 
      branch, semester, githubLink, demoLink, collaborators, mentor,
      timeline, difficulty, tags, isPublic, pdfUrl, imageUrls, videoUrl,
      projectType, teamMembers, isAdminProject, coverPhoto
    } = req.body;

    if (!title || !description || !category || !branch || !semester) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const user = req.user;
    const data = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title, description, category, techStack: techStack || [], 
      studentId: studentId || user.id, 
      studentName: studentName || user.name,
      branch, semester: parseInt(semester),
      githubLink, demoLink, collaborators: collaborators || [],
      mentor, timeline, difficulty, tags: tags || [],
      isPublic: isPublic !== false,
      pdfUrl, imageUrls: imageUrls || [], videoUrl,
      projectType: projectType || 'mini', teamMembers: teamMembers || [],
      isAdminProject: isAdminProject === true || user.userType === 'admin',
      coverPhoto: coverPhoto || null, // Cover photo URL
      status: user.userType === 'admin' ? 'approved' : 'pending',
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseReady && db) {
      const ref = db.collection('projects').doc(data.id);
      await ref.set(data);
    } else {
      const items = readLocalProjects();
      items.unshift(data);
      writeLocalProjects(items);
    }

    res.status(201).json({ message: "Project created successfully", project: data });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Get all projects (with optional filters)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { 
      category, branch, semester, status, difficulty, 
      studentId, isPublic, projectType, isAdminProject,
      page = 1, limit = 20 
    } = req.query;

    let projects = [];
    if (isFirebaseReady && db) {
      let query = db.collection('projects');
      if (status) query = query.where('status', '==', status);
      if (branch) query = query.where('branch', '==', branch);
      if (semester) query = query.where('semester', '==', parseInt(semester));
      if (category) query = query.where('category', '==', category);
      if (studentId) query = query.where('studentId', '==', studentId);
      if (isAdminProject !== undefined) query = query.where('isAdminProject', '==', isAdminProject === 'true');
      const snap = await query.orderBy('createdAt', 'desc').get();
      projects = [];
      snap.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
    } else {
      projects = readLocalProjects();
      if (status) projects = projects.filter(p => p.status === status);
      if (branch) projects = projects.filter(p => p.branch === branch);
      if (semester) projects = projects.filter(p => p.semester === parseInt(semester));
      if (category) projects = projects.filter(p => p.category === category);
      if (studentId) projects = projects.filter(p => p.studentId === studentId);
      if (isAdminProject !== undefined) projects = projects.filter(p => p.isAdminProject === (isAdminProject === 'true'));
      projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Filter by isPublic (only show approved public projects to students)
    if (req.user.userType !== 'admin') {
      projects = projects.filter(p => p.isPublic && p.status === 'approved');
    }

    const total = projects.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProjects = projects.slice(startIndex, endIndex);
    
    res.status(200).json({
      projects: paginatedProjects,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: paginatedProjects.length,
        totalProjects: total
      }
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get a specific project by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    let project;
    if (isFirebaseReady && db) {
      const doc = await db.collection('projects').doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: "Project not found" });
      project = { id: doc.id, ...doc.data() };
      // Increment view count
      await db.collection('projects').doc(req.params.id).update({ views: (project.views || 0) + 1 });
    } else {
      const projects = readLocalProjects();
      project = projects.find(p => p.id === req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });
      project.views = (project.views || 0) + 1;
      const idx = projects.findIndex(p => p.id === req.params.id);
      projects[idx] = project;
      writeLocalProjects(projects);
    }

    // Check if student can download
    if (req.user.userType === 'student' && !project.isAdminProject) {
      const canDownload = await canStudentDownload(req.user.id);
      project.canDownload = canDownload;
    } else {
      project.canDownload = true;
    }

    res.status(200).json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Check download permission
router.get("/:id/can-download", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType === 'admin') {
      return res.json({ canDownload: true });
    }
    const canDownload = await canStudentDownload(req.user.id);
    res.json({ canDownload });
  } catch (err) {
    res.status(500).json({ error: "Failed to check download permission" });
  }
});

// Update a project (admin or project owner)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    let project;
    if (isFirebaseReady && db) {
      const doc = await db.collection('projects').doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: "Project not found" });
      project = doc.data();
      
      // Check permission
      if (req.user.userType !== 'admin' && project.studentId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this project" });
      }

      const updates = { ...req.body, updatedAt: new Date().toISOString() };
      await db.collection('projects').doc(req.params.id).update(updates);
      project = { id: req.params.id, ...project, ...updates };
    } else {
      const projects = readLocalProjects();
      const idx = projects.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Project not found" });
      project = projects[idx];
      
      if (req.user.userType !== 'admin' && project.studentId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this project" });
      }

      projects[idx] = { ...project, ...req.body, updatedAt: new Date().toISOString() };
      writeLocalProjects(projects);
      project = projects[idx];
    }

    res.status(200).json({ message: "Project updated successfully", project });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Approve/Reject project (admin only)
router.post("/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, feedback } = req.body; // status: 'approved' | 'rejected'
    if (isFirebaseReady && db) {
      await db.collection('projects').doc(req.params.id).update({ 
        status, 
        adminFeedback: feedback,
        updatedAt: new Date().toISOString()
      });
    } else {
      const projects = readLocalProjects();
      const idx = projects.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Project not found" });
      projects[idx].status = status;
      projects[idx].adminFeedback = feedback;
      projects[idx].updatedAt = new Date().toISOString();
      writeLocalProjects(projects);
    }
    res.json({ message: `Project ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project status" });
  }
});

// Delete a project (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (isFirebaseReady && db) {
      await db.collection('projects').doc(req.params.id).delete();
    } else {
      const projects = readLocalProjects();
      const filtered = projects.filter(p => p.id !== req.params.id);
      writeLocalProjects(filtered);
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Like a project
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    if (isFirebaseReady && db) {
      const doc = await db.collection('projects').doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: "Project not found" });
      const current = doc.data();
      await db.collection('projects').doc(req.params.id).update({ likes: (current.likes || 0) + 1 });
      res.json({ likes: (current.likes || 0) + 1 });
    } else {
      const projects = readLocalProjects();
      const idx = projects.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Project not found" });
      projects[idx].likes = (projects[idx].likes || 0) + 1;
      writeLocalProjects(projects);
      res.json({ likes: projects[idx].likes });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to like project" });
  }
});

// PROJECT REQUESTS

// Submit project request
router.post("/requests", async (req, res) => {
  try {
    const { name, email, phone, branch, semester, projectIdea, description, requiredTools, deadline, notes } = req.body;
    if (!name || !email || !projectIdea) {
      return res.status(400).json({ error: "Name, email, and project idea are required" });
    }

    const data = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name, email, phone, branch, semester, projectIdea, description, requiredTools, deadline, notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseReady && db) {
      const ref = db.collection('project_requests').doc(data.id);
      await ref.set(data);
    } else {
      const items = readLocalRequests();
      items.unshift(data);
      writeLocalRequests(items);
    }

    res.status(201).json({ message: "Project request submitted successfully", request: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit project request" });
  }
});

// Get all project requests (admin only)
router.get("/requests/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    let requests = [];
    if (isFirebaseReady && db) {
      const snap = await db.collection('project_requests').orderBy('createdAt', 'desc').get();
      snap.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
    } else {
      requests = readLocalRequests();
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project requests" });
  }
});

// Update project request status (admin only)
router.put("/requests/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' | 'under_review' | 'rejected'
    if (isFirebaseReady && db) {
      await db.collection('project_requests').doc(req.params.id).update({ 
        status, 
        updatedAt: new Date().toISOString()
      });
    } else {
      const requests = readLocalRequests();
      const idx = requests.findIndex(r => r.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Request not found" });
      requests[idx].status = status;
      requests[idx].updatedAt = new Date().toISOString();
      writeLocalRequests(requests);
    }
    res.json({ message: "Request status updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update request status" });
  }
});

export default router;
