import express from 'express';
import { login, logout, checkAuth } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = express.Router();

router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/check', authenticateToken, checkAuth);

export default router;
