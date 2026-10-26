import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/catalog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/catalog.validator';

const router = Router();

router.get('/', getProducts);
router.get('/:slug/related', getRelatedProducts);
router.get('/:slug', getProductBySlug);
router.post('/', authenticate, authorize('admin'), validate(createProductSchema), createProduct);
router.put('/:id', authenticate, authorize('admin'), validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
