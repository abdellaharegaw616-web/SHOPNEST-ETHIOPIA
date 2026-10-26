import { Request, Response, NextFunction } from 'express';
import { ReturnService } from '../services/return.service';

export class ReturnController {
  static async createReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?._id?.toString();
      const returnRequest = await ReturnService.createReturnRequest(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Return request submitted successfully. Our team will review your request shortly.',
        data: returnRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyReturns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?._id?.toString();
      const returns = await ReturnService.getUserReturns(userId);
      res.status(200).json({
        success: true,
        count: returns.length,
        data: returns,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReturnById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?._id?.toString();
      const returnRequest = await ReturnService.getReturnById(
        req.params.id,
        userId,
        user?.role === 'admin'
      );
      res.status(200).json({
        success: true,
        data: returnRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllReturns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const returns = await ReturnService.getAllReturns(req.query as any);
      res.status(200).json({
        success: true,
        count: returns.length,
        data: returns,
      });
    } catch (error) {
      next(error);
    }
  }

  static async moderateReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, adminNotes, rejectionReason } = req.body;
      const updated = await ReturnService.moderateReturn(
        req.params.id,
        status,
        adminNotes,
        rejectionReason
      );
      res.status(200).json({
        success: true,
        message: `Return request status updated to "${status}"`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async processRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refunded = await ReturnService.processRefund(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: `Refund of ETB ${refunded.refundAmount} successfully recorded and processed.`,
        data: refunded,
      });
    } catch (error) {
      next(error);
    }
  }
}
