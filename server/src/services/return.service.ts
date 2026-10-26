import { ReturnRequest, IReturnRequest, IReturnItem } from '../models/ReturnRequest';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { NotificationService } from './notification.service';
import { logger } from '../utils/logger';
import { ReturnReason, EthiopianPaymentProvider } from '@shopnest/shared';
import { Types } from 'mongoose';

export class ReturnService {
  /**
   * Customers submit a return / refund request for an eligible delivered order
   */
  static async createReturnRequest(
    userId: string,
    data: {
      orderId: string;
      reason: ReturnReason;
      customerNote?: string;
      images?: string[];
      items?: { product: string; quantity: number }[];
    }
  ): Promise<IReturnRequest> {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Verify order ownership
    if (order.user && order.user.toString() !== userId) {
      throw new AppError('You are only authorized to request returns for your own orders', 403);
    }

    // Policy: Returns are only valid for delivered orders
    if (order.orderStatus !== 'delivered') {
      throw new AppError(
        'Return and refund requests can only be submitted for delivered orders.',
        400
      );
    }

    // Policy: 7-day return window from delivery / last status update
    const deliveryDate = order.updatedAt || order.createdAt;
    const daysSinceDelivery = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      throw new AppError(
        'The return window for this order has expired. ShopNest policy allows returns within 7 calendar days of delivery.',
        400
      );
    }

    // Check for an existing non-rejected return on this order
    const existing = await ReturnRequest.findOne({
      order: order._id,
      status: { $in: ['pending', 'approved', 'refunded'] },
    });
    if (existing) {
      throw new AppError(
        'A return request is already currently active or has been completed for this order.',
        400
      );
    }

    // Map order items to return items
    let returnItems: IReturnItem[] = [];
    if (data.items && data.items.length > 0) {
      for (const reqItem of data.items) {
        const orderItem = order.items.find(
          (oi) => (oi.product._id ? oi.product._id.toString() : oi.product.toString()) === reqItem.product
        );
        if (!orderItem) {
          throw new AppError(`Item "${reqItem.product}" was not found in the specified order`, 400);
        }
        if (reqItem.quantity > orderItem.quantity) {
          throw new AppError(
            `Return quantity (${reqItem.quantity}) cannot exceed purchased quantity (${orderItem.quantity})`,
            400
          );
        }
        returnItems.push({
          product: new Types.ObjectId(reqItem.product),
          title: orderItem.title,
          quantity: reqItem.quantity,
          unitPrice: orderItem.price,
        });
      }
    } else {
      // Default: Return all order items
      returnItems = order.items.map((oi) => ({
        product: oi.product._id ? oi.product._id : oi.product,
        title: oi.title,
        quantity: oi.quantity,
        unitPrice: oi.price,
      }));
    }

    const returnRequest = await ReturnRequest.create({
      order: order._id,
      orderNumber: order.orderNumber,
      user: new Types.ObjectId(userId),
      items: returnItems,
      reason: data.reason,
      customerNote: data.customerNote,
      images: data.images || [],
      status: 'pending',
      processedAt: null,
    });

    // Notify Customer and Admin via Telegram / SMS
    try {
      const customer = await User.findById(userId);
      await NotificationService.sendOrderNotification('return_requested', order, customer);
    } catch (notifErr: any) {
      logger.warn(`Failed to dispatch return notification: ${notifErr.message}`);
    }

    return returnRequest;
  }

  /**
   * Retrieves all return requests submitted by the authenticated customer
   */
  static async getUserReturns(userId: string): Promise<IReturnRequest[]> {
    return ReturnRequest.find({ user: new Types.ObjectId(userId) })
      .populate('order', 'orderNumber totalAmount paymentStatus orderStatus createdAt')
      .sort({ createdAt: -1 });
  }

  /**
   * Retrieves detail of a single return request
   */
  static async getReturnById(returnId: string, userId: string, isAdmin = false): Promise<IReturnRequest> {
    const returnReq = await ReturnRequest.findById(returnId)
      .populate('order', 'orderNumber totalAmount paymentStatus paymentMethod orderStatus shippingAddress createdAt')
      .populate('user', 'name email phone');

    if (!returnReq) {
      throw new AppError('Return request not found', 404);
    }

    if (!isAdmin && returnReq.user && returnReq.user._id.toString() !== userId) {
      throw new AppError('Unauthorized access to this return request', 403);
    }

    return returnReq;
  }

  /**
   * Admin: List all customer return requests with optional status filtering
   */
  static async getAllReturns(filter?: { status?: string }): Promise<IReturnRequest[]> {
    const query: Record<string, any> = {};
    if (filter?.status && filter.status !== 'all') {
      query.status = filter.status;
    }

    return ReturnRequest.find(query)
      .populate('order', 'orderNumber totalAmount paymentStatus paymentMethod orderStatus createdAt')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
  }

  /**
   * Admin: Moderate return request (approve or reject)
   */
  static async moderateReturn(
    returnId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string,
    rejectionReason?: string
  ): Promise<IReturnRequest> {
    const returnReq = await ReturnRequest.findById(returnId);
    if (!returnReq) {
      throw new AppError('Return request not found', 404);
    }

    if (returnReq.status === 'refunded') {
      throw new AppError('Cannot alter moderation status of an already completed refund', 400);
    }

    returnReq.status = status;
    if (adminNotes) returnReq.adminNotes = adminNotes;
    if (status === 'rejected') {
      returnReq.rejectionReason = rejectionReason || 'Return request rejected based on store return policy.';
    }

    await returnReq.save();

    // Dispatch notification
    try {
      const order = await Order.findById(returnReq.order);
      const user = await User.findById(returnReq.user);
      if (order) {
        const notifEvent = status === 'approved' ? 'return_approved' : 'return_rejected';
        await NotificationService.sendOrderNotification(notifEvent, order, user);
      }
    } catch (notifErr: any) {
      logger.warn(`Failed to dispatch return moderation notification: ${notifErr.message}`);
    }

    return returnReq;
  }

  /**
   * Admin: Process confirmed refund.
   * CRITICAL REQUIREMENT: Never mark a refund as completed until it is actually confirmed
   * with a provider transaction reference (Telebirr / CBE Birr / Chapa).
   */
  static async processRefund(
    returnId: string,
    data: {
      refundAmount: number;
      refundMethod: EthiopianPaymentProvider;
      refundReference: string;
      adminNotes?: string;
    }
  ): Promise<IReturnRequest> {
    const returnReq = await ReturnRequest.findById(returnId);
    if (!returnReq) {
      throw new AppError('Return request not found', 404);
    }

    if (returnReq.status !== 'approved') {
      throw new AppError(
        'Return request must be approved by store admin before processing a refund.',
        400
      );
    }

    if (!data.refundReference || !data.refundReference.trim()) {
      throw new AppError(
        'A verified payment provider transaction reference (e.g. Telebirr/CBE Birr Tx ID) is mandatory to complete a refund.',
        400
      );
    }

    const order = await Order.findById(returnReq.order);
    if (!order) {
      throw new AppError('Associated order not found', 404);
    }

    if (data.refundAmount > order.totalAmount) {
      throw new AppError(
        `Refund amount (ETB ${data.refundAmount}) cannot exceed original order total (ETB ${order.totalAmount})`,
        400
      );
    }

    // Set refund details and confirm completion
    returnReq.status = 'refunded';
    returnReq.refundAmount = data.refundAmount;
    returnReq.refundMethod = data.refundMethod;
    returnReq.refundReference = data.refundReference.trim();
    returnReq.processedAt = new Date();
    if (data.adminNotes) {
      returnReq.adminNotes = data.adminNotes;
    }

    await returnReq.save();

    // Mark parent order paymentStatus as refunded
    order.paymentStatus = 'refunded';
    await order.save();

    // Notify customer that refund was processed
    try {
      const user = await User.findById(returnReq.user);
      await NotificationService.sendOrderNotification('refund_processed', order, user);
    } catch (notifErr: any) {
      logger.warn(`Failed to dispatch refund notification: ${notifErr.message}`);
    }

    return returnReq;
  }
}
