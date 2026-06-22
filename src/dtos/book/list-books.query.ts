import { SortOrder } from '../../enums/sort-order';

export interface ListBooksQuery {
  categoryId?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  sortCreatedDate?: SortOrder;
  sortPublishedDate?: SortOrder;
}
