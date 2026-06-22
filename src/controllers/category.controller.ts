import { asyncHandler } from '../middlewares/async-handler';
import { CategoryService } from '../services/category.service';
import { ok } from '../responses/api-response';
import { HttpStatus } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';
import { CreateCategoryDTO } from '../dtos/category/create-category.dto';
import { UpdateCategoryDTO } from '../dtos/category/update-category.dto';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  getCategories = asyncHandler(async (_req, res) => {
    res
      .status(HttpStatus.OK)
      .json(ok(await this.categoryService.getAll(), MESSAGES.CATEGORIES_FETCHED));
  });

  getCategoryById = asyncHandler(async (req, res) => {
    res
      .status(HttpStatus.OK)
      .json(ok(await this.categoryService.getById(req.params.id), MESSAGES.CATEGORY_FETCHED));
  });

  createCategory = asyncHandler(async (req, res) => {
    const created = await this.categoryService.create(req.body as CreateCategoryDTO);
    res.status(HttpStatus.CREATED).json(ok(created, MESSAGES.CATEGORY_CREATED));
  });

  updateCategory = asyncHandler(async (req, res) => {
    const updated = await this.categoryService.update(req.params.id, req.body as UpdateCategoryDTO);
    res.status(HttpStatus.OK).json(ok(updated, MESSAGES.CATEGORY_UPDATED));
  });

  deleteCategory = asyncHandler(async (req, res) => {
    await this.categoryService.remove(req.params.id);
    res.status(HttpStatus.NO_CONTENT).send();
  });
}
