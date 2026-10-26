import { Request, Response, NextFunction } from 'express';
import { CouponService } from '../services/coupon.service';
import { ApiResponse, ValidateCouponResultDTO } from '@shopnest/shared';

export const validateCoupon = async (
  req: Request,
  res: Response<ApiResponse<ValidateCouponResultDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, subtotal } = req.body;
    const result = await CouponService.validateCoupon(code, subtotal);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (
  _req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const coupons = await CouponService.getAllCoupons();
    res.status(200).json({
      success: true,
      data: coupons,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await CouponService.createCoupon(req.body);
    res.status(201).json({
      success: true,
      message: `Coupon "${coupon.code}" created successfully`,
      data: coupon,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCoupon = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await CouponService.toggleCouponActive(req.params.id);
    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" is now ${coupon.isActive ? 'active' : 'inactive'}`,
      data: coupon,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response<ApiResponse<unknown>>,
  next: NextFunction
): Promise<void> => {
  try {
    await CouponService.deleteCoupon(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
