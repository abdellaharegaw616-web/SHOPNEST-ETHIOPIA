import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { ApiResponse } from '@shopnest/shared';

export const getCart = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    const guestSessionId = req.headers['x-guest-session-id'] as string;
    const couponCode = req.query.couponCode as string;
    const city = req.query.city as string;

    const cart = await CartService.getCart(userId, guestSessionId, couponCode, city);
    res.status(200).json({
      success: true,
      data: cart,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    const guestSessionId = req.headers['x-guest-session-id'] as string;
    const { productId, quantity, selectedAttributes } = req.body;

    const cart = await CartService.addToCart(
      userId,
      guestSessionId,
      productId,
      quantity,
      selectedAttributes
    );

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    const guestSessionId = req.headers['x-guest-session-id'] as string;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await CartService.updateCartItemQuantity(
      itemId,
      quantity,
      userId,
      guestSessionId
    );

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    const guestSessionId = req.headers['x-guest-session-id'] as string;

    const cart = await CartService.removeFromCart(req.params.itemId, userId, guestSessionId);
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const mergeCart = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to merge cart into customer account',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const guestSessionId = (req.body.guestSessionId || req.headers['x-guest-session-id']) as string;
    const guestItems = req.body.items;

    const cart = await CartService.mergeCart(userId, guestSessionId, guestItems);
    res.status(200).json({
      success: true,
      message: 'Guest cart merged successfully',
      data: cart,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id.toString();
    const guestSessionId = req.headers['x-guest-session-id'] as string;

    await CartService.clearCart(userId, guestSessionId);
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
