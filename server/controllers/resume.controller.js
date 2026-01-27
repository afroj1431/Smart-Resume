import Resume from '../models/Resume.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { parsePDF, extractSkills, extractEducation, extractExperience, normalizeText } from '../services/resumeParser.service.js';

// @desc    Upload resume (Job Seeker - no jobId required)
// @route   POST /api/resumes/upload
// @access  Private
export const uploadResume = async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      hasUser: !!req.user,
      userId: req.user?._id
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    if (!req.user || !req.user._id) {
      console.error('No user found in request');
      return res.status(500).json({
        success: false,
        message: 'User session error. Please try again.'
      });
    }

    // For job seekers, jobId is optional
    const { jobId, candidateName, candidateEmail, candidatePhone } = req.body;

    // Parse PDF
    let parsedText;
    try {
      parsedText = await parsePDF(req.file.path);
      parsedText = normalizeText(parsedText);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to parse PDF'
      });
    }

    // Extract information
    const extractedSkills = extractSkills(parsedText);
    const extractedEducation = extractEducation(parsedText);
    const extractedExperience = extractExperience(parsedText);

    // Determine candidate name - use provided name, file name, or default
    let finalCandidateName = candidateName?.trim();
    if (!finalCandidateName || finalCandidateName === '') {
      // Try to extract from file name
      finalCandidateName = req.file.originalname
        .replace('.pdf', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .trim();
    }
    if (!finalCandidateName || finalCandidateName === '') {
      finalCandidateName = 'My Resume';
    }

    // Create resume record
    const resume = await Resume.create({
      jobId: jobId || null,
      candidateName: finalCandidateName,
      candidateEmail: candidateEmail?.trim() || null,
      candidatePhone: candidatePhone?.trim() || null,
      fileName: req.file.originalname,
      filePath: req.file.path,
      parsedText,
      extractedSkills,
      extractedEducation,
      extractedExperience,
      uploadedBy: req.user._id,
      status: 'parsed'
    });

    // Log action (optional - don't fail if logging fails)
    try {
      await AuditLog.create({
        action: 'resume_uploaded',
        userId: req.user._id,
        userRole: req.user?.role || 'jobseeker',
        details: { resumeId: resume._id, candidateName: resume.candidateName }
      });
    } catch (logError) {
      console.error('Audit log error:', logError);
      // Continue even if audit logging fails
    }

    res.status(201).json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get user's resumes
// @route   GET /api/resumes/my-resumes
// @access  Private
export const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { resumes },
      count: resumes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get resumes for a job
// @route   GET /api/resumes/job/:jobId
// @access  Private
export const getResumesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job access
    const Job = (await import('../models/Job.model.js')).default;
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

    const resumes = await Resume.find({ jobId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { resumes },
      count: resumes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('jobId')
      .populate('uploadedBy', 'name email');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check access - user can access their own resumes or if they created the job
    if (resume.uploadedBy._id.toString() !== req.user._id.toString()) {
      if (resume.jobId) {
        const job = resume.jobId;
        if (req.user.role === 'recruiter' && job.createdBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to access this resume'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resume'
        });
      }
    }

    res.json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('jobId');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check access
    if (resume.uploadedBy.toString() !== req.user._id.toString()) {
      if (resume.jobId) {
        const job = resume.jobId;
        if (req.user.role === 'recruiter' && job.createdBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this resume'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this resume'
        });
      }
    }

    // Delete file
    const fs = await import('fs/promises');
    try {
      await fs.unlink(resume.filePath);
    } catch (error) {
      console.error('File deletion error:', error);
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
