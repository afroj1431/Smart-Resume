import Resume from '../models/Resume.model.js';
import Score from '../models/Score.model.js';

// @desc    Get dashboard stats (User-specific)
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    // Get user's resumes
    const resumes = await Resume.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    
    // Get scores for user's resumes
    const resumeIds = resumes.map(r => r._id);
    const scores = await Score.find({ resumeId: { $in: resumeIds } }).sort({ calculatedAt: -1 });
    
    // Calculate stats
    const totalResumes = resumes.length;
    const latestScore = scores.length > 0 ? scores[0] : null;
    const averageScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.finalScore, 0) / scores.length
      : 0;
    
    // Get recent resumes with scores
    const recentResumes = resumes.slice(0, 5).map(resume => {
      const score = scores.find(s => s.resumeId.toString() === resume._id.toString());
      return {
        _id: resume._id,
        candidateName: resume.candidateName || resume.fileName,
        fileName: resume.fileName,
        extractedSkills: resume.extractedSkills,
        createdAt: resume.createdAt,
        score: score ? {
          finalScore: score.finalScore,
          skillScore: score.skillScore,
          experienceScore: score.experienceScore,
          educationScore: score.educationScore
        } : null
      };
    });

    // Score distribution
    const scoreDistribution = {
      excellent: scores.filter(s => s.finalScore >= 80).length,
      good: scores.filter(s => s.finalScore >= 60 && s.finalScore < 80).length,
      average: scores.filter(s => s.finalScore >= 40 && s.finalScore < 60).length,
      poor: scores.filter(s => s.finalScore < 40).length
    };

    res.json({
      success: true,
      data: {
        totalResumes,
        latestScore: latestScore ? {
          finalScore: latestScore.finalScore,
          skillScore: latestScore.skillScore,
          experienceScore: latestScore.experienceScore,
          educationScore: latestScore.educationScore,
          resumeId: latestScore.resumeId
        } : null,
        averageScore: Math.round(averageScore),
        recentResumes,
        scoreDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
