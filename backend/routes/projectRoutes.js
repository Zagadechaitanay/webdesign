import express from "express";
const router = express.Router();
import Project from "../models/Project.js";

// Create a new project
router.post("/create", async (req, res) => {
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
router.get("/", async (req, res) => {
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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(filter);
    
    res.status(200).json({
      projects,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: projects.length,
        totalProjects: total
      }
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get a specific project by ID
router.get("/:id", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
router.post("/:id/milestones", async (req, res) => {
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
router.put("/:id/milestones/:milestoneId/complete", async (req, res) => {
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
router.post("/:id/feedback", async (req, res) => {
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
router.post("/:id/like", async (req, res) => {
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
router.get("/search/:query", async (req, res) => {
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
