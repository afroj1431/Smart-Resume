import Job from '../models/Job.model.js';
import AuditLog from '../models/AuditLog.model.js';

// @desc    Create job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res) => {
  try {
    const { title, description, skills, experienceLevel } = req.body;

    if (!title || !description || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and experience level'
      });
    }

    const job = await Job.create({
      title,
      description,
      skills: skills || [],
      experienceLevel,
      createdBy: req.user._id
    });

    // Log action
    await AuditLog.create({
      action: 'job_created',
      userId: req.user._id,
      userRole: req.user.role,
      details: { jobId: job._id, jobTitle: job.title }
    });

    res.status(201).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res) => {
  try {
    const query = {};
    
    // Recruiters can only see their own jobs, admins see all
    if (req.user.role === 'recruiter') {
      query.createdBy = req.user._id;
    }

    const jobs = await Job.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { jobs },
      count: jobs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check access
    if (req.user.role === 'recruiter' && job.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this job'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

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
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Log action
    await AuditLog.create({
      action: 'job_updated',
      userId: req.user._id,
      userRole: req.user.role,
      details: { jobId: job._id }
    });

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

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
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    // Log action
    await AuditLog.create({
      action: 'job_deleted',
      userId: req.user._id,
      userRole: req.user.role,
      details: { jobId: job._id }
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

