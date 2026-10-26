import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getInventoryLogs,
  getAllOrders,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/inventory', getInventoryLogs);
router.get('/orders', getAllOrders);

export default router;
