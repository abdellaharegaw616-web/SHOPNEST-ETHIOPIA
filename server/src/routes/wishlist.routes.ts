import { Router } from 'express';
import {
  getWishlist,
  toggleWishlistItem,
  clearWishlist,
} from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { toggleWishlistSchema } from '../validators/catalog.validator';

const router = Router();

router.use(authenticate);
router.get('/', getWishlist);
router.post('/toggle', validate(toggleWishlistSchema), toggleWishlistItem);
router.delete('/', clearWishlist);

export default router;
