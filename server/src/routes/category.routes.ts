import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/catalog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCategorySchema } from '../validators/catalog.validator';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorize('admin'), validate(createCategorySchema), createCategory);

export default router;
