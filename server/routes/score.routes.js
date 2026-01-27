import express from 'express';
import {
  calculateResumeScore,
  getResumeScore
} from '../controllers/score.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { logAction } from '../middlewares/audit.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/:resumeId', logAction('score_calculated'), calculateResumeScore);
router.get('/:resumeId', getResumeScore);

export default router;

