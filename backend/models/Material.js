import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'link', 'document', 'image', 'code'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
materialSchema.index({ subjectId: 1, type: 1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ tags: 1 });

const Material = mongoose.model("Material", materialSchema);

export default Material;
