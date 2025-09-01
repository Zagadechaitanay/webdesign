import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, 
    required: true,
    unique: true 
  },
  branch: { 
    type: String, 
    required: true 
  },
  semester: { 
    type: Number, 
    required: true,
    min: 1,
    max: 6
  },
  credits: { 
    type: Number, 
    default: 4 
  },
  hours: { 
    type: Number, 
    default: 60 
  },
  type: { 
    type: String, 
    enum: ['Theory', 'Practical', 'Project', 'Elective'],
    default: 'Theory'
  },
  description: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index for branch and semester
subjectSchema.index({ branch: 1, semester: 1 });

// Update the updatedAt field before saving
subjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Subject", subjectSchema);
