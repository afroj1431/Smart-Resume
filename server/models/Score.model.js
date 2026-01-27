import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
    unique: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false // Optional for job seeker general scoring
  },
  skillScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  experienceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  educationScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  finalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  missingSkills: {
    type: [String],
    default: []
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  scoreBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster ranking queries
scoreSchema.index({ jobId: 1, finalScore: -1 });
scoreSchema.index({ resumeId: 1 });

export default mongoose.model('Score', scoreSchema);

