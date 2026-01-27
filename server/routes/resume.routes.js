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
router.post('/upload', logAction('resume_uploaded'), upload.single('resume'), (req, res, next) => {
  try {
    // Log after Multer processes the request - Multer parses multipart/form-data
    console.log('=== AFTER MULTER ===');
    console.log('req.body keys:', Object.keys(req.body));
    console.log('req.body.jobDescription exists:', !!req.body.jobDescription);
    console.log('req.body.jobDescription length:', req.body.jobDescription?.length || 0);
    console.log('req.body.jobDescription preview:', req.body.jobDescription?.substring(0, 100) || 'MISSING');
    console.log('req.file:', req.file ? { name: req.file.originalname, size: req.file.size } : 'MISSING');
    next();
  } catch (error) {
    console.error('Error in upload middleware:', error);
    next(error);
  }
}, uploadResume);
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

