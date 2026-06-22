import { BookRepository } from '../repositories/book.repository';
import { AuthorRepository } from '../repositories/author.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { Book } from '../models/book';
import { BookView } from '../dtos/book/book-view.dto';
import { CreateBookDTO } from '../dtos/book/create-book.dto';
import { UpdateBookDTO } from '../dtos/book/update-book.dto';
import { ListBooksQuery } from '../dtos/book/list-books.query';
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors';
import { MESSAGES } from '../constants/messages';
import { PAGINATION } from '../constants/pagination';
import { SortOrder } from '../enums/sort-order';
import { Role, isAtLeast } from '../enums/role';

const clampPagination = (page?: unknown, limit?: unknown) => {
  let p = Number(page);
  if (!Number.isInteger(p) || p < PAGINATION.DEFAULT_PAGE) p = PAGINATION.DEFAULT_PAGE;
  let l = Number(limit);
  if (!Number.isInteger(l) || l < PAGINATION.MIN_LIMIT) l = PAGINATION.DEFAULT_LIMIT;
  if (l > PAGINATION.MAX_LIMIT) l = PAGINATION.MAX_LIMIT;
  return { page: p, limit: l };
};

export interface Actor {
  id: string;
  role: Role;
}

export class BookService {
  constructor(
    private readonly books: BookRepository,
    private readonly authors: AuthorRepository,
    private readonly categories: CategoryRepository,
  ) {}

  async getList(
    query: ListBooksQuery,
  ): Promise<{ data: BookView[]; total: number; page: number; limit: number }> {
    const { page, limit } = clampPagination(query.page, query.limit);
    const offset = (page - 1) * limit;

    let sortField: 'created_date' | 'published_date' | undefined;
    let sortOrder: 'ASC' | 'DESC' | undefined;
    if (query.sortCreatedDate) {
      sortField = 'created_date';
      sortOrder = query.sortCreatedDate === SortOrder.ASC ? 'ASC' : 'DESC';
    } else if (query.sortPublishedDate) {
      sortField = 'published_date';
      sortOrder = query.sortPublishedDate === SortOrder.ASC ? 'ASC' : 'DESC';
    }

    const { items, total } = await this.books.findList({
      authorId: query.authorId,
      categoryId: query.categoryId,
      sortField,
      sortOrder,
      limit,
      offset,
    });

    return { data: items, total, page, limit };
  }

  async getById(id: string): Promise<Book> {
    const book = await this.books.findById(id);
    if (!book) throw new NotFoundError(MESSAGES.BOOK_NOT_FOUND);
    return book;
  }

  async create(dto: CreateBookDTO, createdById: string): Promise<Book> {
    await this.assertAuthorExists(dto.authorId);
    if (!dto.categoryIds || dto.categoryIds.length === 0) {
      throw new BadRequestError(MESSAGES.VALIDATION_FAILED, [MESSAGES.CATEGORY_IDS_REQUIRED]);
    }
    await this.assertCategoriesExist(dto.categoryIds);
    return this.books.create(dto, createdById);
  }

  async update(id: string, dto: UpdateBookDTO, actor: Actor): Promise<Book> {
    const book = await this.getById(id); // ném NotFoundError nếu không có
    this.assertCanModify(book, actor); // ném ForbiddenError nếu không có quyền
    if (dto.authorId) {
      await this.assertAuthorExists(dto.authorId);
    }
    if (dto.categoryIds) {
      await this.assertCategoriesExist(dto.categoryIds);
    }
    const updated = await this.books.update(id, dto);
    if (!updated) throw new NotFoundError(MESSAGES.BOOK_NOT_FOUND);
    return updated;
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const book = await this.getById(id); // 404 nếu không có
    this.assertCanModify(book, actor); // 403 nếu không có quyền
    if (!(await this.books.remove(id))) throw new NotFoundError(MESSAGES.BOOK_NOT_FOUND);
  }

  // ----- private helpers -----

  private async assertAuthorExists(authorId: string): Promise<void> {
    if (!(await this.authors.findById(authorId)))
      throw new NotFoundError(MESSAGES.AUTHOR_NOT_FOUND);
  }

  private async assertCategoriesExist(categoryIds: string[]): Promise<void> {
    for (const id of categoryIds) {
      if (!(await this.categories.findById(id)))
        throw new NotFoundError(MESSAGES.CATEGORY_NOT_FOUND);
    }
  }

  // Sửa/xoá sách: chủ sách (created_by), HOẶC từ ADMIN trở lên (ADMIN/SUPER_ADMIN quản lý mọi nội dung).
  private assertCanModify(book: Book, actor: Actor): void {
    const isOwner = book.createdBy === actor.id;
    if (!isOwner && !isAtLeast(actor.role, Role.ADMIN)) {
      throw new ForbiddenError(MESSAGES.FORBIDDEN);
    }
  }
}
