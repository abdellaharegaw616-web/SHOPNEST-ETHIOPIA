import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { validate } from '../middleware/validate';
import { shoppingAssistantSchema } from '../validators/ai.validator';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @openapi
 * /api/v1/ai/shopping-assistant:
 *   post:
 *     summary: Ask the bilingual ShopNest AI Shopping Assistant
 *     description: Intelligent product discovery, price comparisons, and recommendations in English and Amharic
 *     tags:
 *       - AI Shopping Assistant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Find a laptop under 40000 ETB"
 *               language:
 *                 type: string
 *                 enum: [en, am]
 *                 default: en
 *     responses:
 *       200:
 *         description: AI shopping assistant recommendations with verified product details
 *       400:
 *         description: Validation error (e.g. empty message or unsupported language)
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/shopping-assistant',
  aiLimiter,
  validate(shoppingAssistantSchema),
  AIController.handleShoppingAssistant
);

export default router;

