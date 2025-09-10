import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String },
  studentId: { type: String, unique: true, sparse: true },
  branch: { type: String },
  semester: { type: String },
  userType: { type: String, enum: ['student', 'admin'], default: 'student' },
}, { timestamps: true });

// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ branch: 1, semester: 1 });
userSchema.index({ userType: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;


