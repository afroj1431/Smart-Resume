import express from 'express';
import { getRankings } from '../controllers/ranking.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/:jobId', getRankings);

export default router;

