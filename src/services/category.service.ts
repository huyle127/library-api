import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../models/category';
import { CreateCategoryDTO } from '../dtos/category/create-category.dto';
import { UpdateCategoryDTO } from '../dtos/category/update-category.dto';
import { NotFoundError } from '../errors';
import { MESSAGES } from '../constants/messages';

export class CategoryService {
  constructor(private readonly categories: CategoryRepository) {}

  getAll(): Promise<Category[]> {
    return this.categories.findAll();
  }

  async getById(id: string): Promise<Category> {
    const category = await this.categories.findById(id);
    if (!category) throw new NotFoundError(MESSAGES.CATEGORY_NOT_FOUND);
    return category;
  }

  create(dto: CreateCategoryDTO): Promise<Category> {
    return this.categories.create(dto.name);
  }

  async update(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    await this.getById(id); // 404 nếu không có
    const updated = await this.categories.update(id, dto.name);
    if (!updated) throw new NotFoundError(MESSAGES.CATEGORY_NOT_FOUND);
    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!(await this.categories.remove(id))) throw new NotFoundError(MESSAGES.CATEGORY_NOT_FOUND);
  }
}
