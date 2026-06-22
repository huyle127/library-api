import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { BookService } from '../services/book.service';
import { BookRepository } from '../repositories/book.repository';
import { AuthorRepository } from '../repositories/author.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { validateBody, validateQuery, validateParams } from '../validation/validate.middleware';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../validation/schemas/book.schema';
import { idParamSchema } from '../validation/schemas/common.schema';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const bookRepository = new BookRepository();
const authorRepository = new AuthorRepository();
const categoryRepository = new CategoryRepository();
const bookService = new BookService(
  bookRepository,
  authorRepository,
  categoryRepository,
);
const bookController = new BookController(bookService);

router.get('/', validateQuery(bookQuerySchema), bookController.getBooks);
router.get('/:id', validateParams(idParamSchema), bookController.getBookById);
router.post('/', authenticate, validateBody(createBookSchema), bookController.createBook);
router.put(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  validateBody(updateBookSchema, { partial: true }),
  bookController.updateBook,
);
router.delete('/:id', authenticate, validateParams(idParamSchema), bookController.deleteBook);

export default router;
