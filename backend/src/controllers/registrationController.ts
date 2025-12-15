import { Response } from 'express';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { isCouponAvailable, validateCouponFormat, validateMobileFormat } from '../utils/validateCoupon';
import cache from '../utils/cache';

export async function checkCoupon(req: AuthRequest, res: Response) {
  try {
    const { couponNo } = req.params;

    if (!couponNo || !validateCouponFormat(couponNo)) {
      return res.status(400).json({ error: 'Invalid coupon number format' });
    }

    const result = await isCouponAvailable(couponNo);

    return res.json(result);
  } catch (error) {
    console.error('Check coupon error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function searchSimilarNames(req: AuthRequest, res: Response) {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.json([]);
    }

    const searchQuery = query.trim();

    // Check cache first
    const cacheKey = `search:${searchQuery.toLowerCase()}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Search for similar names using text search and regex
    const results = await Registration.find({
      deletedAt: null,
      name: { $regex: searchQuery, $options: 'i' }
    })
      .select('name mobileNo couponNo')
      .limit(10)
      .lean();

    // Cache the results
    cache.set(cacheKey, results);

    return res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createRegistration(req: AuthRequest, res: Response) {
  try {
    const { couponNo, name, mobileNo } = req.body;

    // Validate required fields
    if (!couponNo || !name || !mobileNo) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate formats
    if (!validateCouponFormat(couponNo)) {
      return res.status(400).json({ error: 'Invalid coupon number format (alphanumeric only)' });
    }

    if (!validateMobileFormat(mobileNo)) {
      return res.status(400).json({ error: 'Invalid mobile number format (10 digits required)' });
    }

    if (name.trim().length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    // Check coupon availability one more time (defense in depth)
    const couponCheck = await isCouponAvailable(couponNo);
    if (!couponCheck.available) {
      return res.status(409).json({
        error: 'Coupon number already registered',
        existingRegistration: couponCheck.existingRegistration
      });
    }

    // Create registration
    const registration = new Registration({
      couponNo: couponNo.trim(),
      name: name.trim(),
      mobileNo: mobileNo.trim()
    });

    await registration.save();

    // Clear search cache when new registration is added
    cache.flushAll();

    return res.status(201).json({
      success: true,
      registration: {
        couponNo: registration.couponNo,
        name: registration.name,
        mobileNo: registration.mobileNo,
        createdAt: registration.createdAt
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Coupon number already registered'
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllRegistrations(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      Registration.find({ deletedAt: null })
        .select('couponNo name mobileNo createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Registration.countDocuments({ deletedAt: null })
    ]);

    return res.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteRegistration(req: AuthRequest, res: Response) {
  try {
    const { couponNo } = req.params;

    if (!couponNo) {
      return res.status(400).json({ error: 'Coupon number required' });
    }

    const registration = await Registration.findOne({
      couponNo,
      deletedAt: null
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Soft delete
    registration.deletedAt = new Date();
    registration.deletedBy = req.user?.username;
    await registration.save();

    // Clear search cache
    cache.flushAll();

    return res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Delete registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDeletedRegistrations(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      Registration.find({ deletedAt: { $ne: null } })
        .select('couponNo name mobileNo createdAt deletedAt deletedBy')
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Registration.countDocuments({ deletedAt: { $ne: null } })
    ]);

    return res.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get deleted registrations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
