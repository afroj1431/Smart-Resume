import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false // Optional for job seekers
  },
  candidateName: {
    type: String,
    required: false, // Optional - can be extracted from file name
    trim: true
  },
  candidateEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  candidatePhone: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  parsedText: {
    type: String,
    required: true
  },
  extractedSkills: {
    type: [String],
    default: []
  },
  extractedEducation: {
    type: [String],
    default: []
  },
  extractedExperience: {
    type: String,
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'parsed', 'scored', 'error'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
resumeSchema.index({ jobId: 1, createdAt: -1 });

export default mongoose.model('Resume', resumeSchema);

