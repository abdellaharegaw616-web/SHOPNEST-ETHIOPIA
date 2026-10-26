import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  mergeCart,
  clearCart,
} from '../controllers/cart.controller';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from '../validators/catalog.validator';

const router = Router();

router.get('/', getCart);
router.post('/items', validate(addToCartSchema), addToCart);
router.put('/items/:itemId', validate(updateCartItemSchema), updateCartItem);
router.patch('/items/:itemId', validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.post('/merge', validate(mergeCartSchema), mergeCart);
router.delete('/', clearCart);

export default router;
