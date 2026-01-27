import Score from '../models/Score.model.js';
import Resume from '../models/Resume.model.js';
import Job from '../models/Job.model.js';

// @desc    Get rankings for a job
// @route   GET /api/rankings/:jobId
// @access  Private
export const getRankings = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { minScore, maxScore, skills } = req.query;

    // Verify job access
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check access
    if (req.user.role === 'recruiter' && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this job'
      });
    }

    // Build query
    let query = { jobId };

    if (minScore || maxScore) {
      query.finalScore = {};
      if (minScore) query.finalScore.$gte = parseInt(minScore);
      if (maxScore) query.finalScore.$lte = parseInt(maxScore);
    }

    // Get scores with filters
    let scores = await Score.find(query)
      .populate({
        path: 'resumeId',
        populate: {
          path: 'uploadedBy',
          select: 'name email'
        }
      })
      .sort({ finalScore: -1 });

    // Filter by skills if provided
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      scores = scores.filter(score => {
        return skillArray.some(skill => 
          score.matchedSkills.some(ms => 
            ms.toLowerCase().includes(skill.toLowerCase())
          )
        );
      });
    }

    // Format response
    const rankings = scores.map(score => ({
      resume: score.resumeId,
      score: {
        finalScore: score.finalScore,
        skillScore: score.skillScore,
        experienceScore: score.experienceScore,
        educationScore: score.educationScore,
        matchedSkills: score.matchedSkills,
        missingSkills: score.missingSkills
      },
      rank: scores.indexOf(score) + 1
    }));

    res.json({
      success: true,
      data: {
        rankings,
        job: {
          id: job._id,
          title: job.title,
          skills: job.skills
        }
      },
      count: rankings.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

