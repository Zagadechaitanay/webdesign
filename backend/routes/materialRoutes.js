import express from "express";
const router = express.Router();
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validate, materialCreateSchema } from "../middleware/validation.js";
import FirebaseMaterial from "../models/FirebaseMaterial.js";
import notificationService from "../websocket.js";
import { db, isFirebaseReady } from "../lib/firebase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

const normalizeMaterial = (material) => {
  if (!material) return null;
  return {
    ...material,
    _id: material.id || material._id,
    id: material.id || material._id
  };
};

async function ensureUploadsDir() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

// Get all materials (admin view)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let all = [];
    
    if (isFirebaseReady && db) {
      try {
        const snapshot = await db.collection('materials')
          .orderBy('createdAt', 'desc')
          .get();
        
        snapshot.forEach(doc => {
          const material = new FirebaseMaterial({ id: doc.id, ...doc.data() });
          // Normalize ID for frontend (include both id and _id)
          const materialObj = { ...material, _id: material.id, id: material.id };
          all.push(materialObj);
        });
      } catch (err) {
        console.log(`Error fetching all materials: ${err.message}`);
        all = [];
      }
    } else {
      console.log('Firebase not ready, returning empty materials array');
      all = [];
    }
    
    // Normalize IDs for all materials
    const normalizedMaterials = all.map(m => ({
      ...m,
      _id: m.id || m._id,
      id: m.id || m._id
    }));
    
    res.status(200).json(normalizedMaterials);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(200).json([]);
  }
});

// Get all materials for a subject (by subjectId or subjectCode)
router.get("/subject/:subjectId", authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { type } = req.query;
    
    // Try to find by subjectCode first (since frontend sends codes like "CS302")
    let all = [];
    
    // Check if Firebase is ready before attempting queries
    if (isFirebaseReady && db) {
      // First try finding by subjectCode
      try {
        const snapshot = await db.collection('materials')
          .where('subjectCode', '==', subjectId)
          .get();
        
        snapshot.forEach(doc => {
          const material = new FirebaseMaterial({ id: doc.id, ...doc.data() });
          // Normalize ID for frontend
          all.push({ ...material, _id: material.id, id: material.id });
        });
      } catch (err) {
        console.log(`Error querying by subjectCode: ${err.message}`);
        // If that fails, try finding by subjectId
        try {
          const found = await FirebaseMaterial.find({ subjectId });
          all = found.map(m => ({ ...m, _id: m.id, id: m.id }));
        } catch (err2) {
          console.log(`Error querying by subjectId: ${err2.message}`);
          // If both fail, return empty array (no materials found)
          console.log(`No materials found for subject: ${subjectId}`);
          all = [];
        }
      }
    } else {
      // Firebase not ready, try JSON fallback
      console.log('Firebase not ready, trying JSON fallback for materials');
      try {
        const found = await FirebaseMaterial.find({ subjectId });
        all = found.map(m => ({ ...m, _id: m.id, id: m.id }));
      } catch (err) {
        console.log(`No materials found for subject: ${subjectId}`);
        all = [];
      }
    }
    
    // Sort by createdAt descending (client-side to avoid index issues)
    all.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    const materials = type ? all.filter(m => m.type === type) : all;
    // Ensure all materials have both _id and id
    const normalizedMaterials = materials.map(m => ({
      ...m,
      _id: m.id || m._id,
      id: m.id || m._id
    }));
    res.status(200).json(normalizedMaterials);
  } catch (err) {
    console.error("Error fetching materials:", err);
    // Return empty array instead of error to prevent frontend crashes
    res.status(200).json([]);
  }
});

// Get materials by branch
router.get("/branch/:branch", authenticateToken, async (req, res) => {
  try {
    const { branch } = req.params;
    const { type } = req.query;
    const all = await FirebaseMaterial.find({ branch });
    const materials = type ? all.filter(m => m.type === type) : all;
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
      resourceType,
      tags,
      coverPhoto
    } = req.body;
    
    console.log('📥 Creating material with resourceType:', resourceType, 'for subject:', subjectCode);
    
    const material = await FirebaseMaterial.create({
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
      resourceType: resourceType || 'notes',
      tags: tags || [],
      coverPhoto: coverPhoto || null
    });
    
    console.log('✅ Material created with resourceType:', material.resourceType);
    try { await notificationService.notifyMaterialUploaded(material); } catch {}
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
    const material = await FirebaseMaterial.findByIdAndUpdate(id, { ...updates });
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    try { await notificationService.notifyMaterialUpdated(material); } catch {}
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
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: "Material ID is required" });
    }
    
    console.log(`🗑️ Deleting material with ID: ${id}`);
    
    // Find the material first to get the file path
    const material = await FirebaseMaterial.findById(id);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    // Delete the associated file if it exists
    if (material.url && material.url.startsWith('/uploads/')) {
      try {
        const fileName = path.basename(material.url);
        const filePath = path.join(uploadsDir, fileName);
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(`✅ Deleted file: ${filePath}`);
      } catch (fileError) {
        // File doesn't exist or can't be deleted - log but don't fail
        console.log(`⚠️ Could not delete file for material ${id}:`, fileError.message);
      }
    }
    
    // Delete the material record
    const deleted = await FirebaseMaterial.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    try { await notificationService.notifyMaterialDeleted(id); } catch {}
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({ error: "Failed to delete material", details: err.message });
  }
});

// Increment download count
router.post("/:id/download", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMaterial = await FirebaseMaterial.incrementDownloads(id);
    if (!updatedMaterial) {
      return res.status(404).json({ error: "Material not found" });
    }
    const normalized = normalizeMaterial(updatedMaterial);
    try { await notificationService.notifyMaterialStatsUpdated(normalized); } catch (notifyError) {
      console.error("Failed to broadcast download update:", notifyError);
    }
    res.status(200).json({ message: "Download count updated", material: normalized });
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
    const updatedMaterial = await FirebaseMaterial.updateRating(id, rating);
    if (!updatedMaterial) {
      return res.status(404).json({ error: "Material not found" });
    }
    const normalized = normalizeMaterial(updatedMaterial);
    try { await notificationService.notifyMaterialStatsUpdated(normalized); } catch (notifyError) {
      console.error("Failed to broadcast rating update:", notifyError);
    }
    res.status(200).json({ message: "Rating updated successfully", material: normalized });
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
    const timestamp = Date.now();
    const filePath = path.join(uploadsDir, `${timestamp}_${safeName}`);
    const buffer = Buffer.from(dataBase64, 'base64');
    
    console.log(`📁 Saving file to: ${filePath}`);
    console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
    
    await fs.writeFile(filePath, buffer);
    
    // Verify file was created
    try {
      await fs.access(filePath);
      console.log(`✅ File saved successfully: ${filePath}`);
    } catch (verifyError) {
      console.error(`❌ File verification failed: ${verifyError.message}`);
      throw new Error('File was not saved correctly');
    }
    
    const urlPath = `/uploads/${path.basename(filePath)}`;
    console.log(`🔗 File URL: ${urlPath}`);
    
    const uploaded = { title: safeName, url: urlPath, type: contentType || 'application/octet-stream', downloads: 0, createdAt: new Date().toISOString() };
    try { await notificationService.notifyMaterialUploaded(uploaded); } catch {}
    res.status(201).json({ url: urlPath, contentType: contentType || 'application/octet-stream' });
  } catch (err) {
    console.error('Error saving uploaded file:', err);
    res.status(500).json({ error: 'Failed to save uploaded file' });
  }
});

export default router;
