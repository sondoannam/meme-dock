import express, { Router } from 'express';
import { adminAuth } from '../middleware/auth.middleware';

const router: Router = express.Router();

// GET /api/auth/status - Check authentication status (public route)
router.get('/status', (req, res) => {
  res.status(200).json({ authenticated: false, message: 'Not authenticated' });
});

// GET /api/auth/admin - Check admin status (protected route)
router.get('/admin', adminAuth, (req, res) => {
  res.status(200).json({
    authenticated: true,
    isAdmin: true,
    userId: req.userId,
    message: 'User is authenticated and has admin privileges',
  });
});

export default router;
