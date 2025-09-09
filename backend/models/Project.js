import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: '' },
  techStack: { type: [String], default: [] },
  studentId: { type: String, index: true },
  studentName: { type: String, default: '' },
  branch: { type: String, index: true },
  semester: { type: Number, index: true },
  githubLink: { type: String, default: '' },
  demoLink: { type: String, default: '' },
  collaborators: { type: [String], default: [] },
  mentor: { type: String, default: '' },
  timeline: { type: String, default: '' },
  difficulty: { type: String, default: '' },
  tags: { type: [String], default: [] },
  isPublic: { type: Boolean, default: true },
  status: { type: String, default: 'in-progress' },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;


