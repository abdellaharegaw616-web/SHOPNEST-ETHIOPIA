import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '@shopnest/shared';

export const createOrder = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const idempotencyKey = (req.headers['idempotency-key'] || req.body.idempotencyKey) as string | undefined;

    const {
      shippingAddress,
      paymentMethod,
      couponCode,
      deliveryInstructions,
      notes,
      customerName,
      customerEmail,
      customerPhone,
      saveAddressToProfile,
      items,
    } = req.body;

    const order = await OrderService.createOrder({
      userId,
      shippingAddress,
      paymentMethod,
      couponCode,
      deliveryInstructions: deliveryInstructions || notes,
      idempotencyKey,
      customerName,
      customerEmail,
      customerPhone,
      saveAddressToProfile,
      items,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const orders = await OrderService.getUserOrders(userId);

    res.status(200).json({
      success: true,
      data: orders,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const role = req.user?.role;
    const order = await OrderService.getOrderById(req.params.id, userId, role);

    res.status(200).json({
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const order = await OrderService.updateOrderStatus(req.params.id, status, notes);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const role = req.user?.role;
    const { reason } = req.body;
    const order = await OrderService.cancelOrder(req.params.id, userId, role, reason);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and reserved inventory restored',
      data: order,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

