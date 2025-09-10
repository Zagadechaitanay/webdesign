import express from "express";
const router = express.Router();
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validate, materialCreateSchema } from "../middleware/validation.js";
import jsonDb from "../lib/jsonDatabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

async function ensureUploadsDir() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

// Get all materials for a subject
router.get("/subject/:subjectId", authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { type } = req.query;
    const all = await jsonDb.findMaterials({ subjectId });
    const materials = type ? all.filter(m => m.type === type) : all;
    // Sort newest first
    materials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(200).json(materials);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// Get materials by branch
router.get("/branch/:branch", authenticateToken, async (req, res) => {
  try {
    const { branch } = req.params;
    const { type } = req.query;
    const all = await jsonDb.findMaterials({ branch });
    const materials = type ? all.filter(m => m.type === type) : all;
    materials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(200).json(materials);
  } catch (err) {
    console.error("Error fetching materials by branch:", err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// Add new material (metadata)
router.post("/", authenticateToken, requireAdmin, validate(materialCreateSchema), async (req, res) => {
  try {
    const { 
      title, 
      type, 
      url, 
      description, 
      uploadedBy,
      subjectId, 
      subjectName,
      branch,
      semester,
      subjectCode,
      tags 
    } = req.body;
    
    // Validation is handled by middleware
    const material = await jsonDb.createMaterial({
      title,
      type,
      url,
      description: description || '',
      uploadedBy,
      subjectId,
      subjectName,
      branch: branch || '',
      semester: semester || '',
      subjectCode: subjectCode || '',
      tags: tags || []
    });
    res.status(201).json({ message: "Material added successfully", material });
  } catch (err) {
    console.error("Error adding material:", err);
    res.status(500).json({ error: "Failed to add material" });
  }
});

// Update material
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates._id;
    const material = await jsonDb.updateMaterial(id, { ...updates });
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(200).json({ message: "Material updated successfully", material });
  } catch (err) {
    console.error("Error updating material:", err);
    res.status(500).json({ error: "Failed to update material" });
  }
});

// Delete material
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await jsonDb.deleteMaterial(id);
    if (!ok) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({ error: "Failed to delete material" });
  }
});

// Increment download count
router.post("/:id/download", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const current = await jsonDb.findMaterials({ _id: id });
    const mat = current[0];
    if (!mat) {
      return res.status(404).json({ error: "Material not found" });
    }
    const updated = await jsonDb.updateMaterial(id, { downloads: (mat.downloads || 0) + 1 });
    res.status(200).json({ message: "Download count updated", downloads: updated.downloads });
  } catch (err) {
    console.error("Error updating download count:", err);
    res.status(500).json({ error: "Failed to update download count" });
  }
});

// Rate material
router.post("/:id/rate", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ 
        error: "Rating must be between 0 and 5" 
      });
    }
    const updated = await jsonDb.updateMaterial(id, { rating });
    if (!updated) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(200).json({ message: "Rating updated successfully", rating: updated.rating });
  } catch (err) {
    console.error("Error updating rating:", err);
    res.status(500).json({ error: "Failed to update rating" });
  }
});

// Base64 upload endpoint (saves to /uploads and returns public URL)
router.post('/upload-base64', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename, contentType, dataBase64 } = req.body;
    if (!filename || !dataBase64) {
      return res.status(400).json({ error: 'filename and dataBase64 are required' });
    }

    // File validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (contentType && !allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed types: PDF, images, videos, audio' });
    }
    
    // Check file size (approximate from base64)
    const fileSizeInBytes = (dataBase64.length * 3) / 4;
    if (fileSizeInBytes > maxSize) {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
    }
    await ensureUploadsDir();
    const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = path.join(uploadsDir, `${Date.now()}_${safeName}`);
    const buffer = Buffer.from(dataBase64, 'base64');
    await fs.writeFile(filePath, buffer);
    const urlPath = `/uploads/${path.basename(filePath)}`;
    res.status(201).json({ url: urlPath, contentType: contentType || 'application/octet-stream' });
  } catch (err) {
    console.error('Error saving uploaded file:', err);
    res.status(500).json({ error: 'Failed to save uploaded file' });
  }
});

export default router;
