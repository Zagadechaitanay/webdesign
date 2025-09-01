import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  userType: { type: String, default: 'student', enum: ['student', 'admin'] },
  semester: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema); 