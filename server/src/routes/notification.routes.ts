import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// User notification preferences
router.get('/preferences', authenticate, NotificationController.getPreferences);
router.put('/preferences', authenticate, NotificationController.updatePreferences);

// Test notification dispatch
router.post('/test', authenticate, NotificationController.sendTestNotification);

// Admin notification gateway status
router.get('/status', authenticate, authorize('admin'), NotificationController.getGatewayStatus);

export default router;
