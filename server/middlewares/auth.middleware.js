import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Optional auth - doesn't require token, but sets req.user if token is valid
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Invalid token - continue without user
        req.user = null;
      }
    }

    // If no user, create or get anonymous user
    if (!req.user) {
      try {
        let anonymousUser = await User.findOne({ email: 'anonymous@talentscan.ai' });
        if (!anonymousUser) {
          anonymousUser = await User.create({
            name: 'Anonymous User',
            email: 'anonymous@talentscan.ai',
            password: 'anonymous123456', // Must meet password requirements
            role: 'jobseeker'
          });
        }
        req.user = anonymousUser;
      } catch (userError) {
        console.error('Error creating/getting anonymous user:', userError);
        // Try to get any user as fallback
        const fallbackUser = await User.findOne().limit(1);
        if (fallbackUser) {
          req.user = fallbackUser;
        } else {
          return res.status(500).json({
            success: false,
            message: 'Unable to initialize user session. Please try again.'
          });
        }
      }
    }

    // Ensure req.user exists
    if (!req.user || !req.user._id) {
      return res.status(500).json({
        success: false,
        message: 'User session error. Please try again.'
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

