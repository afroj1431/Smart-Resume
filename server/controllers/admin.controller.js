import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import Resume from '../models/Resume.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Score from '../models/Score.model.js';

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const totalScores = await Score.countDocuments();

    const jobsByStatus = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const resumesByStatus = await Resume.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const avgScore = await Score.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$finalScore' }
        }
      }
    ]);

    const recentActivity = await AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalJobs,
          totalResumes,
          totalScores,
          averageScore: avgScore[0]?.avgScore || 0
        },
        jobsByStatus,
        resumesByStatus,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users },
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all jobs (admin view)
// @route   GET /api/admin/jobs
// @access  Private/Admin
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
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

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
export const getAuditLogs = async (req, res) => {
  try {
    const { limit = 100, action } = req.query;
    
    const query = {};
    if (action) {
      query.action = action;
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { logs },
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log action
    await AuditLog.create({
      action: 'user_deleted',
      userId: req.user._id,
      userRole: req.user.role,
      details: { deletedUserId: id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

