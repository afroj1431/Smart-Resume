import express from 'express';
import {
  getAnalytics,
  getUsers,
  getAllJobs,
  getAuditLogs,
  deleteUser
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/jobs', getAllJobs);
router.get('/audit-logs', getAuditLogs);
router.delete('/users/:id', deleteUser);

export default router;

