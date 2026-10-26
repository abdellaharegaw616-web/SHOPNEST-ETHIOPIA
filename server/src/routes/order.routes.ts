import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

router.post('/', optionalAuthenticate, validate(createOrderSchema), createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', optionalAuthenticate, getOrderById);
router.patch('/:id/status', authenticate, authorize('admin'), validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/cancel', authenticate, cancelOrder);

export default router;

