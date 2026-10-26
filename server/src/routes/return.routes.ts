import { Router } from 'express';
import { ReturnController } from '../controllers/return.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createReturnSchema,
  moderateReturnSchema,
  processRefundSchema,
} from '../validators/return.validator';

const router = Router();

// Customer Endpoints (Authenticated)
router.post(
  '/',
  authenticate,
  validate(createReturnSchema),
  ReturnController.createReturn
);

router.get('/my-returns', authenticate, ReturnController.getMyReturns);

router.get('/:id', authenticate, ReturnController.getReturnById);

// Admin Moderation & Refund Endpoints (Admin Only)
router.get('/', authenticate, authorize('admin'), ReturnController.getAllReturns);

router.patch(
  '/:id/moderate',
  authenticate,
  authorize('admin'),
  validate(moderateReturnSchema),
  ReturnController.moderateReturn
);

router.post(
  '/:id/refund',
  authenticate,
  authorize('admin'),
  validate(processRefundSchema),
  ReturnController.processRefund
);

export const returnRoutes = router;
