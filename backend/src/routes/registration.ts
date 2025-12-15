import express from 'express';
import {
  checkCoupon,
  searchSimilarNames,
  createRegistration,
  getAllRegistrations,
  deleteRegistration,
  getDeletedRegistrations
} from '../controllers/registrationController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/validateRole';
import { searchLimiter } from '../middleware/rateLimit';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/check-coupon/:couponNo', checkCoupon);
router.get('/search', searchLimiter, searchSimilarNames);
router.post('/', createRegistration);
router.get('/', getAllRegistrations);

// Admin-only routes
router.delete('/:couponNo', requireAdmin, deleteRegistration);
router.get('/deleted/all', requireAdmin, getDeletedRegistrations);

export default router;
