import { Payment, IPayment, Order, IOrder } from '../models';
import { AppError } from '../middleware/errorHandler';

export interface SimulatePaymentParams {
  paymentId?: string;
  orderId?: string;
  action: 'success' | 'failure';
  failureReason?: string;
}

export interface SimulatePaymentResult {
  payment: IPayment;
  order: IOrder;
}

export class PaymentService {
  static async getPaymentByOrderId(orderId: string, userId?: string, role?: string): Promise<IPayment> {
    const filter: Record<string, unknown> = { order: orderId };
    if (userId && role !== 'admin') {
      filter.user = userId;
    }

    const payment = await Payment.findOne(filter).populate('order');
    if (!payment) {
      throw new AppError('Payment record not found for this order', 404);
    }
    return payment;
  }

  static async simulatePayment(params: SimulatePaymentParams): Promise<SimulatePaymentResult> {
    let payment: IPayment | null = null;

    if (params.paymentId) {
      payment = await Payment.findById(params.paymentId);
    } else if (params.orderId) {
      payment = await Payment.findOne({ order: params.orderId });
    }

    if (!payment) {
      throw new AppError('Payment record not found for simulation', 404);
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      throw new AppError('Associated order not found', 404);
    }

    if (params.action === 'success') {
      payment.status = 'completed';
      if (!payment.paymentMetadata) {
        payment.paymentMetadata = new Map();
      }
      payment.paymentMetadata.set('simulation', 'SUCCESSFUL_DEVELOPMENT_GATEWAY');
      payment.paymentMetadata.set('simulatedAt', new Date().toISOString());

      order.paymentStatus = 'completed';
      if (order.orderStatus === 'pending') {
        order.orderStatus = 'processing';
      }
      order.trackingHistory.push({
        status: order.orderStatus,
        notes: `Simulated development payment confirmed for ${order.paymentMethod.toUpperCase()}`,
        timestamp: new Date(),
      });
    } else {
      payment.status = 'failed';
      if (!payment.paymentMetadata) {
        payment.paymentMetadata = new Map();
      }
      payment.paymentMetadata.set('simulation', 'FAILED_DEVELOPMENT_GATEWAY');
      payment.paymentMetadata.set('failureReason', params.failureReason || 'Simulated transaction declined or cancelled');
      payment.paymentMetadata.set('simulatedAt', new Date().toISOString());

      order.paymentStatus = 'failed';
      order.trackingHistory.push({
        status: order.orderStatus,
        notes: `Simulated payment failed: ${params.failureReason || 'Transaction declined'}`,
        timestamp: new Date(),
      });
    }

    await payment.save();
    await order.save();

    return { payment, order };
  }
}
