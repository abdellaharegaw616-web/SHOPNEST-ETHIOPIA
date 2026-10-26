import { Router } from 'express';
import {
  getProductReviews,
  getAllReviews,
  createReview,
  deleteReview,
} from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../validators/catalog.validator';

const router = Router();

router.get('/', authenticate, authorize('admin'), getAllReviews);
router.get('/product/:productId', getProductReviews);
router.post('/', authenticate, validate(createReviewSchema), createReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
