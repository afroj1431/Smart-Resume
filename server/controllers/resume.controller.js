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

    // For job seekers, jobId is optional, but jobDescription is REQUIRED for ATS analysis
    // Multer parses multipart/form-data and puts text fields in req.body
    const jobDescription = req.body.jobDescription;
    const jobId = req.body.jobId;
    const candidateName = req.body.candidateName;
    const candidateEmail = req.body.candidateEmail;
    const candidatePhone = req.body.candidatePhone;

    // Debug logging
    console.log('=== IN UPLOAD CONTROLLER ===');
    console.log('req.body keys:', Object.keys(req.body));
    console.log('jobDescription type:', typeof jobDescription);
    try {
      console.log('jobDescription value:', jobDescription && typeof jobDescription === 'string' ? `${jobDescription.substring(0, 100)}...` : 'MISSING');
    } catch (e) {
      console.log('jobDescription value: ERROR reading value');
    }
    console.log('jobDescription length:', jobDescription?.length || 0);

    // Validate job description is provided with minimum length threshold
    const MIN_JOB_DESCRIPTION_LENGTH = 30;
    const trimmedJobDescription = typeof jobDescription === 'string' ? jobDescription.trim() : null;
    
    if (!trimmedJobDescription || trimmedJobDescription.length < MIN_JOB_DESCRIPTION_LENGTH) {
      console.error('Job description validation failed:', {
        exists: !!jobDescription,
        type: typeof jobDescription,
        length: jobDescription?.length || 0,
        trimmedLength: trimmedJobDescription?.length || 0,
        minRequired: MIN_JOB_DESCRIPTION_LENGTH
      });
      return res.status(400).json({
        success: false,
        message: `Job Description is required for ATS analysis. Please provide at least ${MIN_JOB_DESCRIPTION_LENGTH} characters of job description from the job posting.`
      });
    }

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

    // Create resume record - use the already validated and trimmed job description
    const resumeData = {
      jobId: jobId || null,
      jobDescription: trimmedJobDescription, // Save the validated and trimmed job description
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
    };

    console.log('Creating resume with jobDescription:', {
      hasJobDescription: !!resumeData.jobDescription,
      jobDescriptionLength: resumeData.jobDescription?.length || 0,
      jobDescriptionPreview: resumeData.jobDescription?.substring(0, 100) || 'NULL'
    });

    const resume = await Resume.create(resumeData);
    
    // Verify jobDescription was saved by fetching it back immediately
    const savedResume = await Resume.findById(resume._id).lean();
    console.log('Resume saved - verification:', {
      resumeId: resume._id,
      hasJobDescription: !!savedResume?.jobDescription,
      jobDescriptionLength: savedResume?.jobDescription?.length || 0,
      jobDescriptionInDB: savedResume?.jobDescription ? 'YES' : 'NO',
      jobDescriptionPreview: savedResume?.jobDescription?.substring(0, 50) || 'NULL'
    });
    
    if (!savedResume?.jobDescription || savedResume.jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH) {
      console.error('CRITICAL ERROR: jobDescription was not saved correctly to database!');
      return res.status(500).json({
        success: false,
        message: 'Failed to save job description. Please try again.'
      });
    }

    // Fetch the complete resume object to return (not lean)
    const responseResume = await Resume.findById(resume._id);
    console.log('Sending response with resume:', {
      resumeId: responseResume._id,
      hasJobDescription: !!responseResume.jobDescription,
      jobDescriptionLength: responseResume.jobDescription?.length || 0
    });

    // Log action (optional - don't fail if logging fails)
    try {
      await AuditLog.create({
        action: 'resume_uploaded',
        userId: req.user._id,
        userRole: req.user?.role || 'jobseeker',
        details: { resumeId: responseResume._id, candidateName: responseResume.candidateName }
      });
    } catch (logError) {
      console.error('Audit log error:', logError);
      // Continue even if audit logging fails
    }

    res.status(201).json({
      success: true,
      data: { resume: responseResume }
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
    
    // Debug logging
    console.log('Retrieved resume:', {
      resumeId: resume._id,
      hasJobDescription: !!resume.jobDescription,
      jobDescriptionLength: resume.jobDescription?.length || 0,
      jobDescriptionPreview: resume.jobDescription?.substring(0, 50) || 'NULL'
    });

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
