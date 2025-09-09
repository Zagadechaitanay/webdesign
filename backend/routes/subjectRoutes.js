import express from "express";
const router = express.Router();
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import Subject from "../models/Subject.js";

// Get all subjects
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { branch, semester } = req.query;
    let filter = {};
    
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    
    const subjects = await Subject.find(filter).sort({ semester: 1, name: 1 });
    res.status(200).json(subjects);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Get subjects by branch and semester
router.get("/branch/:branch", authenticateToken, async (req, res) => {
  try {
    const { branch } = req.params;
    const { semester } = req.query;
    
    // For now, return sample data since we don't have subjects in JSON database yet
    const sampleSubjects = {
      "1": [
        {
          _id: "sub1",
          name: "Mathematics I",
          code: "MATH101",
          credits: 4,
          semester: 1,
          branch: branch,
          description: "Basic mathematics concepts"
        },
        {
          _id: "sub2", 
          name: "Physics I",
          code: "PHY101",
          credits: 4,
          semester: 1,
          branch: branch,
          description: "Basic physics concepts"
        }
      ],
      "2": [
        {
          _id: "sub3",
          name: "Mathematics II", 
          code: "MATH102",
          credits: 4,
          semester: 2,
          branch: branch,
          description: "Advanced mathematics concepts"
        },
        {
          _id: "sub4",
          name: "Chemistry",
          code: "CHEM101", 
          credits: 3,
          semester: 2,
          branch: branch,
          description: "Basic chemistry concepts"
        }
      ],
      "3": [
        {
          _id: "sub5",
          name: "Data Structures",
          code: "CS301",
          credits: 4,
          semester: 3,
          branch: branch,
          description: "Data structures and algorithms"
        },
        {
          _id: "sub6",
          name: "Database Systems",
          code: "CS302",
          credits: 4,
          semester: 3,
          branch: branch,
          description: "Database design and management"
        }
      ]
    };
    
    if (semester) {
      const semSubjects = sampleSubjects[semester] || [];
      res.status(200).json({ [semester]: semSubjects });
    } else {
      res.status(200).json(sampleSubjects);
    }
  } catch (err) {
    console.error("Error fetching subjects by branch:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Add new subject
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, code, branch, semester, credits, hours, type, description } = req.body;
    
    if (!name || !code || !branch || !semester) {
      return res.status(400).json({ error: "Name, code, branch, and semester are required" });
    }
    
    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(409).json({ error: "Subject with this code already exists" });
    }
    
    const newSubject = new Subject({
      name,
      code,
      branch,
      semester: parseInt(semester),
      credits: credits || 4,
      hours: hours || 60,
      type: type || 'Theory',
      description
    });
    
    await newSubject.save();
    res.status(201).json({ message: "Subject added successfully", subject: newSubject });
  } catch (err) {
    console.error("Error adding subject:", err);
    res.status(500).json({ error: "Failed to add subject" });
  }
});

// Update subject
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove _id from updates if present
    delete updates._id;
    
    const subject = await Subject.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    
    res.status(200).json({ message: "Subject updated successfully", subject });
  } catch (err) {
    console.error("Error updating subject:", err);
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// Delete subject
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("Error deleting subject:", err);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

// Bulk import subjects (for MSBTE K-Scheme)
router.post("/bulk-import", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { subjects } = req.body;
    
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ error: "Subjects must be an array" });
    }
    
    const results = [];
    const errors = [];
    
    for (const subjectData of subjects) {
      try {
        const { name, code, branch, semester, credits, hours, type, description } = subjectData;
        
        // Check if subject already exists
        const existingSubject = await Subject.findOne({ code });
        if (existingSubject) {
          errors.push({ code, error: "Subject code already exists" });
          continue;
        }
        
        const newSubject = new Subject({
          name,
          code,
          branch,
          semester: parseInt(semester),
          credits: credits || 4,
          hours: hours || 60,
          type: type || 'Theory',
          description
        });
        
        await newSubject.save();
        results.push(newSubject);
      } catch (error) {
        errors.push({ code: subjectData.code, error: error.message });
      }
    }
    
    res.status(200).json({
      message: `Imported ${results.length} subjects successfully`,
      imported: results.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (err) {
    console.error("Error bulk importing subjects:", err);
    res.status(500).json({ error: "Failed to import subjects" });
  }
});

// Get available branches
router.get("/branches", authenticateToken, async (req, res) => {
  try {
    const branches = await Subject.distinct("branch");
    res.status(200).json(branches);
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

// Get semesters for a branch
router.get("/branches/:branch/semesters", authenticateToken, async (req, res) => {
  try {
    const { branch } = req.params;
    const semesters = await Subject.distinct("semester", { branch });
    res.status(200).json(semesters.sort());
  } catch (err) {
    console.error("Error fetching semesters:", err);
    res.status(500).json({ error: "Failed to fetch semesters" });
  }
});

export default router;
