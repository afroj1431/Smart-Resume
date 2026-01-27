import AuditLog from '../models/AuditLog.model.js';

export const logAction = (action) => {
  return async (req, res, next) => {
    // Log after response is sent
    res.on('finish', async () => {
      try {
        if (req.user) {
          await AuditLog.create({
            action,
            userId: req.user._id,
            userRole: req.user.role,
            details: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          });
        }
      } catch (error) {
        console.error('Audit log error:', error);
      }
    });
    next();
  };
};

