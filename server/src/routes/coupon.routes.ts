import { Router } from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { validateCouponSchema, createCouponSchema } from '../validators/coupon.validator';

const router = Router();

// Public / Shopper endpoint to check & validate coupon in real-time
router.post('/validate', optionalAuthenticate, validate(validateCouponSchema), validateCoupon);

// Admin-only coupon management
router.get('/', authenticate, authorize('admin'), getCoupons);
router.post('/', authenticate, authorize('admin'), validate(createCouponSchema), createCoupon);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggleCoupon);
router.delete('/:id', authenticate, authorize('admin'), deleteCoupon);

export default router;
