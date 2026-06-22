import { asyncHandler } from '../middlewares/async-handler';
import { AuthorService } from '../services/author.service';
import { ok } from '../responses/api-response';
import { HttpStatus } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';

export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  getAuthors = asyncHandler(async (_req, res) => {
    res.status(HttpStatus.OK).json(ok(await this.authorService.getAll(), MESSAGES.AUTHORS_FETCHED));
  });

  getAuthorById = asyncHandler(async (req, res) => {
    res
      .status(HttpStatus.OK)
      .json(ok(await this.authorService.getById(req.params.id), MESSAGES.AUTHOR_FETCHED));
  });
}
