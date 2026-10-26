import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { ApiResponse } from '@shopnest/shared';

export const getProductReviews = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await ReviewService.getProductReviews(req.params.productId);
    res.status(200).json({
      success: true,
      data: reviews,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (
  _req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await ReviewService.getAllReviews();
    res.status(200).json({
      success: true,
      data: reviews,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { productId, rating, comment } = req.body;

    const review = await ReviewService.createReview(userId, productId, rating, comment);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const role = req.user?.role;
    await ReviewService.deleteReview(req.params.id, userId, role);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
