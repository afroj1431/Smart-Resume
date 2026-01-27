import { calculateScore } from '../services/scoring.service.js';
import Score from '../models/Score.model.js';
import Resume from '../models/Resume.model.js';
import AuditLog from '../models/AuditLog.model.js';

// @desc    Calculate score for resume (Job Seeker - no jobId required)
// @route   POST /api/score/:resumeId
// @access  Private
export const calculateResumeScore = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobId } = req.body; // Optional jobId for job-specific scoring

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check access
    if (resume.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // If jobId provided, use job-specific scoring
    // Otherwise, use general scoring
    let score;
    try {
      if (jobId) {
        score = await calculateScore(resumeId, jobId);
      } else {
        // General scoring without job requirements
        score = await calculateGeneralScore(resumeId);
      }
    } catch (scoreError) {
      console.error('Score calculation error:', scoreError);
      throw new Error(`Score calculation failed: ${scoreError.message}`);
    }

    // Log action
    try {
      await AuditLog.create({
        action: 'score_calculated',
        userId: req.user._id,
        userRole: req.user.role,
        details: { resumeId, scoreId: score._id, finalScore: score.finalScore }
      });
    } catch (logError) {
      console.error('Audit log error:', logError);
      // Don't fail the request if audit logging fails
    }

    res.json({
      success: true,
      data: { score }
    });
  } catch (error) {
    console.error('Calculate score error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// General scoring without job requirements
const calculateGeneralScore = async (resumeId) => {
  const resume = await Resume.findById(resumeId);
  
  if (!resume) {
    throw new Error('Resume not found');
  }
  
  // Calculate scores based on resume content quality
  const skills = resume.extractedSkills || [];
  const skillCount = skills.length;
  
  // Skill score: More skills = higher score (max 100)
  const skillScore = skillCount > 0 
    ? Math.min(100, Math.max(50, skillCount * 8)) 
    : 40;
  
  // Experience score: Has experience mentioned = higher score
  const experienceScore = resume.extractedExperience && resume.extractedExperience.trim() !== '' 
    ? 85 
    : 50;
  
  // Education score: Has education mentioned = higher score
  const education = resume.extractedEducation || [];
  const educationScore = education.length > 0 ? 90 : 50;
  
  const finalScore = Math.round(
    (skillScore * 0.60) +
    (experienceScore * 0.25) +
    (educationScore * 0.15)
  );

  const scoreData = {
    resumeId,
    jobId: null,
    skillScore,
    experienceScore,
    educationScore,
    finalScore,
    missingSkills: [],
    matchedSkills: skills,
    scoreBreakdown: {
      skillWeight: 60,
      experienceWeight: 25,
      educationWeight: 15
    }
  };

  let score = await Score.findOne({ resumeId });
  if (score) {
    Object.assign(score, scoreData);
    await score.save();
  } else {
    score = await Score.create(scoreData);
  }

  resume.status = 'scored';
  await resume.save();

  return score;
};

// @desc    Get score for resume
// @route   GET /api/score/:resumeId
// @access  Private
export const getResumeScore = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // First verify resume exists and user has access
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (resume.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const score = await Score.findOne({ resumeId })
      .populate({
        path: 'jobId',
        select: 'title description',
        strictPopulate: false // Allow null jobId
      });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score not found. Please calculate score first.'
      });
    }

    res.json({
      success: true,
      data: { score }
    });
  } catch (error) {
    console.error('Get score error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
