import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'video', 'link', 'document', 'image', 'code'], required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  uploadedBy: { type: String, default: 'admin' },
  subjectId: { type: String, index: true },
  subjectName: { type: String, default: '' },
  subjectCode: { type: String, index: true },
  branch: { type: String, index: true },
  semester: { type: String, index: true },
  tags: { type: [String], default: [] },
  downloads: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
}, { timestamps: true });

const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);
export default Material;


