import { AuthorRepository } from '../repositories/author.repository';
import { Author } from '../models/author';
import { NotFoundError } from '../errors';
import { MESSAGES } from '../constants/messages';

export class AuthorService {
  constructor(private readonly authors: AuthorRepository) {}

  getAll(): Promise<Author[]> {
    return this.authors.findAll();
  }

  async getById(id: string): Promise<Author> {
    const author = await this.authors.findById(id);
    if (!author) throw new NotFoundError(MESSAGES.AUTHOR_NOT_FOUND);
    return author;
  }
}
