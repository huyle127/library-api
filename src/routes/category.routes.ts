import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../services/category.service';
import { CategoryRepository } from '../repositories/category.repository';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/authorize';
import { validateBody, validateParams } from '../validation/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../validation/schemas/category.schema';
import { idParamSchema } from '../validation/schemas/common.schema';
import { MANAGEMENT_ROLES } from '../enums/role';

const router = Router();
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.get('/', categoryController.getCategories);

router.get('/:id', validateParams(idParamSchema), categoryController.getCategoryById);

router.post(
  '/',
  authenticate,
  requireRole(...MANAGEMENT_ROLES),
  validateBody(createCategorySchema),
  categoryController.createCategory,
);

router.put(
  '/:id',
  authenticate,
  requireRole(...MANAGEMENT_ROLES),
  validateParams(idParamSchema),
  validateBody(updateCategorySchema),
  categoryController.updateCategory,
);

router.delete(
  '/:id',
  authenticate,
  requireRole(...MANAGEMENT_ROLES),
  validateParams(idParamSchema),
  categoryController.deleteCategory,
);

export default router;
