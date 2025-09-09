import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, index: true },
  branch: { type: String, required: true, index: true },
  semester: { type: Number, required: true, index: true },
  credits: { type: Number, default: 0 },
  hours: { type: Number, default: 0 },
  type: { type: String, enum: ['Theory', 'Practical', 'Project', 'Elective'], default: 'Theory' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default Subject;


