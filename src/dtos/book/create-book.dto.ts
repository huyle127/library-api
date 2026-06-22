import { Book } from '../../models/book';

export type CreateBookDTO = Omit<Book, 'id' | 'createdDate' | 'createBy'>;
