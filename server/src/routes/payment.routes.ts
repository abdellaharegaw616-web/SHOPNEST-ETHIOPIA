import { Router } from 'express';
import { getPaymentByOrderId, simulatePayment } from '../controllers/payment.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { simulatePaymentSchema } from '../validators/payment.validator';

const router = Router();

router.use(optionalAuthenticate);

router.get('/order/:orderId', getPaymentByOrderId);
router.post('/simulate', validate(simulatePaymentSchema), simulatePayment);
router.post('/:id/simulate', validate(simulatePaymentSchema), simulatePayment);

export default router;
