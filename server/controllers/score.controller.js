import { calculateScore, calculateScoreFromJobDescription } from '../services/scoring.service.js';
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

    // Job Description is REQUIRED for ATS analysis
    // If jobId provided, use job-specific scoring
    // If jobDescription exists, use job description scoring
    // Otherwise, reject the request
    
    console.log('=== calculateResumeScore START ===');
    console.log('Request details:', {
      resumeId,
      jobId,
      hasJobDescription: !!resume.jobDescription,
      jobDescriptionType: typeof resume.jobDescription,
      jobDescriptionLength: resume.jobDescription?.length || 0,
      jobDescriptionPreview: resume.jobDescription?.substring(0, 100) || 'NULL'
    });

    const MIN_JOB_DESCRIPTION_LENGTH = 30;
    let score;
    try {
      if (jobId) {
        console.log('Using jobId-based scoring');
        score = await calculateScore(resumeId, jobId);
      } else if (resume.jobDescription) {
        // Validate job description before using it
        const jobDescType = typeof resume.jobDescription;
        const jobDescTrimmed = jobDescType === 'string' ? resume.jobDescription.trim() : '';
        
        console.log('Validating job description:', {
          type: jobDescType,
          length: jobDescTrimmed.length,
          minRequired: MIN_JOB_DESCRIPTION_LENGTH,
          isValid: jobDescTrimmed.length >= MIN_JOB_DESCRIPTION_LENGTH
        });

        if (jobDescType !== 'string') {
          console.error('Invalid job description type:', jobDescType);
          return res.status(400).json({
            success: false,
            message: `Invalid job description format. Expected string, got ${jobDescType}.`
          });
        }

        if (jobDescTrimmed.length < MIN_JOB_DESCRIPTION_LENGTH) {
          console.warn('Job description too short:', {
            length: jobDescTrimmed.length,
            minRequired: MIN_JOB_DESCRIPTION_LENGTH
          });
          return res.status(400).json({
            success: false,
            message: `Job Description must be at least ${MIN_JOB_DESCRIPTION_LENGTH} characters. Current length: ${jobDescTrimmed.length}.`
          });
        }

        // Use job description text for scoring
        console.log('Calling calculateScoreFromJobDescription');
        score = await calculateScoreFromJobDescription(resumeId, jobDescTrimmed);
        console.log('Score calculated successfully:', {
          scoreId: score._id,
          finalScore: score.finalScore
        });
      } else {
        // Job description is REQUIRED - reject request
        console.error('Job description missing from resume');
        return res.status(400).json({
          success: false,
          message: 'Job Description is required for ATS analysis. Please provide a job description to analyze resume compatibility.'
        });
      }
    } catch (scoreError) {
      console.error('=== Score calculation error ===');
      console.error('Error details:', {
        message: scoreError.message,
        stack: scoreError.stack,
        resumeId,
        hasJobDescription: !!resume.jobDescription
      });
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

    console.log('=== calculateResumeScore SUCCESS ===');
    console.log('Response:', {
      scoreId: score._id,
      finalScore: score.finalScore,
      skillScore: score.skillScore,
      experienceScore: score.experienceScore,
      educationScore: score.educationScore
    });

    res.json({
      success: true,
      data: { score }
    });
  } catch (error) {
    console.error('=== Calculate score error ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      resumeId: req.params.resumeId
    });
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
