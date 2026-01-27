import express from 'express';
import {
  uploadResume,
  getMyResumes,
  getResumesByJob,
  getResume,
  deleteResume
} from '../controllers/resume.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../utils/upload.js';
import { logAction } from '../middlewares/audit.middleware.js';

const router = express.Router();

// Test route (no auth) to verify router is working
router.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ success: true, message: 'Resume routes are working', path: '/api/resumes/test' });
});

// Apply protect middleware to all routes (handles anonymous users)
router.use(protect);

// Upload route must come before /:id route to avoid route conflicts
router.post('/upload', async (req, res, next) => {
  console.log('=== UPLOAD ROUTE HIT ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Has user:', !!req.user);
  next();
}, logAction('resume_uploaded'), upload.single('resume'), uploadResume);
router.get('/my-resumes', getMyResumes);
router.get('/job/:jobId', getResumesByJob);
// Dynamic routes must come last
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

// Catch-all for debugging - should never be hit if routes are correct
router.use((req, res, next) => {
  console.log('=== UNMATCHED ROUTE IN RESUMES ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Original URL:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found in resumes router`
  });
});

export default router;

