import express from "express";
const router = express.Router();
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

// Create a new project
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const {
      title, description, category, techStack, studentId, studentName, 
      branch, semester, githubLink, demoLink, collaborators, mentor,
      timeline, difficulty, tags, isPublic
    } = req.body;

    if (!title || !description || !category || !studentId || !studentName || !branch || !semester) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const newProject = new Project({
      title, description, category, techStack, studentId, studentName,
      branch, semester, githubLink, demoLink, collaborators, mentor,
      timeline, difficulty, tags, isPublic
    });

    await newProject.save();
    res.status(201).json({ message: "Project created successfully", project: newProject });
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
      studentId, isPublic, page = 1, limit = 10 
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (studentId) filter.studentId = studentId;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    // Return sample project data for now
    const sampleProjects = [
      {
        _id: "proj1",
        title: "E-Learning Platform",
        description: "A comprehensive online learning management system",
        category: "Web Development",
        techStack: ["React", "Node.js", "MongoDB"],
        studentId: "STU001",
        studentName: "Test Student",
        branch: "Computer Engineering",
        semester: 3,
        githubLink: "https://github.com/example/elearning",
        demoLink: "https://elearning-demo.com",
        collaborators: ["John Doe", "Jane Smith"],
        mentor: "Dr. Smith",
        timeline: "3 months",
        difficulty: "Intermediate",
        tags: ["education", "web", "react"],
        isPublic: true,
        status: "completed",
        likes: 15,
        createdAt: new Date().toISOString()
      },
      {
        _id: "proj2",
        title: "Mobile Banking App",
        description: "Secure mobile banking application with biometric authentication",
        category: "Mobile Development",
        techStack: ["React Native", "Firebase", "Node.js"],
        studentId: "STU002",
        studentName: "Another Student",
        branch: "Computer Engineering",
        semester: 4,
        githubLink: "https://github.com/example/banking",
        demoLink: "https://banking-demo.com",
        collaborators: ["Alice Johnson"],
        mentor: "Dr. Brown",
        timeline: "4 months",
        difficulty: "Advanced",
        tags: ["mobile", "security", "fintech"],
        isPublic: true,
        status: "in-progress",
        likes: 8,
        createdAt: new Date().toISOString()
      }
    ];

    // Filter projects based on query parameters
    let filteredProjects = sampleProjects;
    
    if (isPublic === 'true') {
      filteredProjects = filteredProjects.filter(p => p.isPublic);
    }
    
    if (studentId) {
      filteredProjects = filteredProjects.filter(p => p.studentId === studentId);
    }

    const total = filteredProjects.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
    
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
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Increment view count
    await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    
    res.status(200).json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Update a project
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        project[key] = req.body[key];
      }
    });

    await project.save();
    res.status(200).json({ message: "Project updated successfully", project });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete a project
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Add a milestone to a project
router.post("/:id/milestones", authenticateToken, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    
    if (!title || !deadline) {
      return res.status(400).json({ error: "Title and deadline are required for milestone" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    project.milestones.push({ title, description, deadline });
    await project.save();

    res.status(200).json({ message: "Milestone added successfully", project });
  } catch (err) {
    console.error("Error adding milestone:", err);
    res.status(500).json({ error: "Failed to add milestone" });
  }
});

// Mark milestone as completed
router.put("/:id/milestones/:milestoneId/complete", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    milestone.completed = true;
    milestone.completedDate = new Date();
    await project.save();

    res.status(200).json({ message: "Milestone marked as completed", project });
  } catch (err) {
    console.error("Error completing milestone:", err);
    res.status(500).json({ error: "Failed to complete milestone" });
  }
});

// Add feedback to a project
router.post("/:id/feedback", authenticateToken, async (req, res) => {
  try {
    const { fromUser, message, rating } = req.body;
    
    if (!fromUser || !message || !rating) {
      return res.status(400).json({ error: "All feedback fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    project.feedback.push({ fromUser, message, rating });
    await project.save();

    res.status(200).json({ message: "Feedback added successfully", project });
  } catch (err) {
    console.error("Error adding feedback:", err);
    res.status(500).json({ error: "Failed to add feedback" });
  }
});

// Like a project
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ message: "Project liked", likes: project.likes });
  } catch (err) {
    console.error("Error liking project:", err);
    res.status(500).json({ error: "Failed to like project" });
  }
});

// Search projects
router.get("/search/:query", authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const { category, branch, semester } = req.query;

    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { techStack: { $in: [new RegExp(query, 'i')] } }
      ],
      isPublic: true
    };

    if (category) searchFilter.category = category;
    if (branch) searchFilter.branch = branch;
    if (semester) searchFilter.semester = parseInt(semester);

    const projects = await Project.find(searchFilter)
      .sort({ likes: -1, views: -1 })
      .limit(20);

    res.status(200).json({ projects, count: projects.length });
  } catch (err) {
    console.error("Error searching projects:", err);
    res.status(500).json({ error: "Failed to search projects" });
  }
});

export default router;
