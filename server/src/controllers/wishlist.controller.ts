import { Request, Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { ApiResponse } from '@shopnest/shared';

export const getWishlist = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const wishlist = await WishlistService.getWishlist(userId);

    res.status(200).json({
      success: true,
      data: wishlist,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlistItem = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { productId } = req.body;

    const result = await WishlistService.toggleProduct(userId, productId);

    res.status(200).json({
      success: true,
      message:
        result.action === 'added'
          ? 'Product added to wishlist'
          : 'Product removed from wishlist',
      data: result.wishlist,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const clearWishlist = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const wishlist = await WishlistService.clearWishlist(userId);

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: wishlist,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
