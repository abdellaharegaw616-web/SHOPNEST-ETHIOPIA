import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { ApiResponse } from '@shopnest/shared';

export const getProductReviews = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user?._id ? req.user._id.toString() : undefined;
    const reviews = await ReviewService.getProductReviews(req.params.productId, currentUserId);
    res.status(200).json({
      success: true,
      data: reviews,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const checkReviewEligibility = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const result = await ReviewService.checkEligibility(userId, req.params.productId, req.user?.role);
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const reviews = await ReviewService.getAllReviews(status);
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
    const { productId, rating, comment, title, images } = req.body;

    const review = await ReviewService.createReview(
      userId,
      productId,
      rating,
      comment,
      title,
      images,
      req.user?.role
    );

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

export const updateReview = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const review = await ReviewService.updateReview(
      req.params.id,
      userId,
      req.body,
      req.user?.role
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    const review = await ReviewService.moderateReview(req.params.id, status, rejectionReason);

    res.status(200).json({
      success: true,
      message: `Review marked as ${status}`,
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
