import { Request, Response, NextFunction } from 'express';
import { ShoppingAssistantService } from '../services/ai/shoppingAssistantService';
import { ApiResponse, ShoppingAssistantResponseDTO } from '@shopnest/shared';
import { ShoppingAssistantInput } from '../validators/ai.validator';

export class AIController {
  /**
   * Handle AI Shopping Assistant customer queries
   * POST /api/v1/ai/shopping-assistant
   */
  static async handleShoppingAssistant(
    req: Request<{}, {}, ShoppingAssistantInput>,
    res: Response<ApiResponse<ShoppingAssistantResponseDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ShoppingAssistantService.processCustomerQuery(req.body);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

