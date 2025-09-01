import express from "express";
const router = express.Router();
import Material from "../models/Material.js";

// Get all materials for a subject
router.get("/subject/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { type } = req.query;
    
    let filter = { subjectId, isActive: true };
    if (type) filter.type = type;
    
    const materials = await Material.find(filter)
      .sort({ createdAt: -1 });
    
    res.status(200).json(materials);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// Get materials by branch
router.get("/branch/:branch", async (req, res) => {
  try {
    const { branch } = req.params;
    const { type } = req.query;
    
    let filter = { isActive: true };
    if (type) filter.type = type;
    
    // This would need to be updated when we have proper subject-branch relationship
    const materials = await Material.find(filter)
      .sort({ createdAt: -1 });
    
    res.status(200).json(materials);
  } catch (err) {
    console.error("Error fetching materials by branch:", err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// Add new material
router.post("/", async (req, res) => {
  try {
    const { 
      title, 
      type, 
      url, 
      description, 
      uploadedBy, 
      subjectId, 
      subjectName, 
      tags 
    } = req.body;
    
    if (!title || !type || !url || !uploadedBy || !subjectId || !subjectName) {
      return res.status(400).json({ 
        error: "Title, type, url, uploadedBy, subjectId, and subjectName are required" 
      });
    }
    
    const newMaterial = new Material({
      title,
      type,
      url,
      description,
      uploadedBy,
      subjectId,
      subjectName,
      tags: tags || []
    });
    
    await newMaterial.save();
    res.status(201).json({ 
      message: "Material added successfully", 
      material: newMaterial 
    });
  } catch (err) {
    console.error("Error adding material:", err);
    res.status(500).json({ error: "Failed to add material" });
  }
});

// Update material
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove _id from updates if present
    delete updates._id;
    
    const material = await Material.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    res.status(200).json({ 
      message: "Material updated successfully", 
      material 
    });
  } catch (err) {
    console.error("Error updating material:", err);
    res.status(500).json({ error: "Failed to update material" });
  }
});

// Delete material
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndDelete(id);
    
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    res.status(200).json({ 
      message: "Material deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({ error: "Failed to delete material" });
  }
});

// Increment download count
router.post("/:id/download", async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    res.status(200).json({ 
      message: "Download count updated", 
      downloads: material.downloads 
    });
  } catch (err) {
    console.error("Error updating download count:", err);
    res.status(500).json({ error: "Failed to update download count" });
  }
});

// Rate material
router.post("/:id/rate", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ 
        error: "Rating must be between 0 and 5" 
      });
    }
    
    const material = await Material.findByIdAndUpdate(
      id,
      { rating },
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    res.status(200).json({ 
      message: "Rating updated successfully", 
      rating: material.rating 
    });
  } catch (err) {
    console.error("Error updating rating:", err);
    res.status(500).json({ error: "Failed to update rating" });
  }
});

export default router;
