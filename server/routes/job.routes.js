import express from 'express';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob
} from '../controllers/job.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { logAction } from '../middlewares/audit.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(logAction('job_created'), createJob)
  .get(getJobs);

router.route('/:id')
  .get(getJob)
  .put(logAction('job_updated'), updateJob)
  .delete(logAction('job_deleted'), deleteJob);

export default router;

