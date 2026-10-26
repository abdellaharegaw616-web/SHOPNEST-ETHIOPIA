import { Router } from 'express';
import {
  getProductReviews,
  checkReviewEligibility,
  getAllReviews,
  createReview,
  updateReview,
  moderateReview,
  deleteReview,
} from '../controllers/review.controller';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createReviewSchema,
  updateReviewSchema,
  moderateReviewSchema,
} from '../validators/catalog.validator';

const router = Router();

// Public & Customer review retrieval
router.get('/product/:productId', optionalAuthenticate, getProductReviews);
router.get('/eligibility/:productId', authenticate, checkReviewEligibility);

// Customer review actions
router.post('/', authenticate, validate(createReviewSchema), createReview);
router.patch('/:id', authenticate, validate(updateReviewSchema), updateReview);
router.delete('/:id', authenticate, deleteReview);

// Admin review moderation
router.get('/', authenticate, authorize('admin'), getAllReviews);
router.patch('/:id/moderate', authenticate, authorize('admin'), validate(moderateReviewSchema), moderateReview);

export default router;
