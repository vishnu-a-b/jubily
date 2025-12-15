import express from 'express';
import {
  checkCoupon,
  searchSimilarNames,
  searchSimilarMobiles,
  createRegistration,
  getAllRegistrations,
  updateRegistration,
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
router.get('/search-mobile', searchLimiter, searchSimilarMobiles);
router.post('/', createRegistration);
router.get('/', getAllRegistrations);

// Admin-only routes
router.put('/:couponNo', requireAdmin, updateRegistration);
router.delete('/:couponNo', requireAdmin, deleteRegistration);
router.get('/deleted/all', requireAdmin, getDeletedRegistrations);

export default router;
