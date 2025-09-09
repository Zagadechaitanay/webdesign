import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String },
  studentId: { type: String, index: true },
  branch: { type: String },
  semester: { type: String },
  userType: { type: String, enum: ['student', 'admin'], default: 'student' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;


