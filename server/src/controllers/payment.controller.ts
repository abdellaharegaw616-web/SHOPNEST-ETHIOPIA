import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { ApiResponse } from '@shopnest/shared';

export const getPaymentByOrderId = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const role = req.user?.role;

    const payment = await PaymentService.getPaymentByOrderId(req.params.orderId, userId, role);

    res.status(200).json({
      success: true,
      data: payment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const simulatePayment = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentId, orderId, action, failureReason } = req.body;

    const result = await PaymentService.simulatePayment({
      paymentId: paymentId || req.params.id,
      orderId,
      action,
      failureReason,
    });

    res.status(200).json({
      success: true,
      message:
        action === 'success'
          ? 'Simulated development payment completed successfully'
          : 'Simulated development payment failed as expected',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
