import { asyncHandler } from '../middlewares/async-handler';
import { BookService } from '../services/book.service';
import { ok } from '../responses/api-response';
import { paginated } from '../responses/paginated-response';
import { HttpStatus } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';
import { ListBooksQuery } from '../dtos/book/list-books.query';
import { CreateBookDTO } from '../dtos/book/create-book.dto';
import { UpdateBookDTO } from '../dtos/book/update-book.dto';

export class BookController {
  constructor(private readonly bookService: BookService) {}

  getBooks = asyncHandler(async (req, res) => {
    const query = req.query as unknown as ListBooksQuery;
    const { data, total, page, limit } = await this.bookService.getList(query);
    res.status(HttpStatus.OK).json(paginated(data, total, page, limit, MESSAGES.BOOKS_FETCHED));
  });

  getBookById = asyncHandler(async (req, res) => {
    const book = await this.bookService.getById(req.params.id);
    res.status(HttpStatus.OK).json(ok(book, MESSAGES.BOOK_FETCHED));
  });

  createBook = asyncHandler(async (req, res) => {
    const created = await this.bookService.create(req.body as CreateBookDTO, req.user!.id);
    res.status(HttpStatus.CREATED).json(ok(created, MESSAGES.BOOK_CREATED));
  });

  updateBook = asyncHandler(async (req, res) => {
    const updated = await this.bookService.update(req.params.id, req.body as UpdateBookDTO, req.user!);
    res.status(HttpStatus.OK).json(ok(updated, MESSAGES.BOOK_UPDATED));
  });

  deleteBook = asyncHandler(async (req, res) => {
    await this.bookService.remove(req.params.id, req.user!);
    res.status(HttpStatus.NO_CONTENT).send();
  });
}
