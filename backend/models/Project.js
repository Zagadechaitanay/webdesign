import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Web Development', 'Mobile App', 'IoT', 'AI/ML', 'Hardware', 'Data Science', 'Robotics', 'Other']
  },
  techStack: [{ type: String }], // Array of technologies used
  studentId: { type: String, required: true }, // Reference to user's studentId
  studentName: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'Planning',
    enum: ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold']
  },
  githubLink: { type: String },
  demoLink: { type: String },
  collaborators: [{ 
    name: String,
    studentId: String,
    role: String // e.g., 'Frontend Developer', 'Backend Developer', 'Designer'
  }],
  mentor: {
    name: String,
    email: String,
    department: String
  },
  timeline: {
    startDate: { type: Date, default: Date.now },
    expectedEndDate: Date,
    actualEndDate: Date
  },
  milestones: [{
    title: String,
    description: String,
    deadline: Date,
    completed: { type: Boolean, default: false },
    completedDate: Date
  }],
  tags: [{ type: String }], // For searchability
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true }, // Whether other students can view
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['Documentation', 'Tutorial', 'Video', 'Article', 'Other'] }
  }],
  feedback: [{
    fromUser: String, // studentId or faculty
    message: String,
    rating: { type: Number, min: 1, max: 5 },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for better search performance
projectSchema.index({ studentId: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ branch: 1, semester: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ tags: 1 });

export default mongoose.model("Project", projectSchema);
