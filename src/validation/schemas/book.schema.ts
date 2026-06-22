import { Schema } from '../field-rule';
import { SortOrder } from '../../enums/sort-order';

export const createBookSchema: Schema = {
  name: { type: 'string', isRequired: true },
  authorId: { type: 'string', isRequired: true },
  categoryIds: { type: 'array', isRequired: true },
  content: { type: 'string', isRequired: true },
  publishedDate: { type: 'string', isRequired: true },
};

// update = mọi field optional (engine chạy với { partial: true })
export const updateBookSchema: Schema = {
  name: { type: 'string', isRequired: false },
  authorId: { type: 'string', isRequired: false },
  categoryIds: { type: 'array', isRequired: false },
  content: { type: 'string', isRequired: false },
  publishedDate: { type: 'string', isRequired: false },
};

export const bookQuerySchema: Schema = {
  categoryId: { type: 'string', isRequired: false },
  authorId: { type: 'string', isRequired: false },
  page: { type: 'number', isRequired: false },
  limit: { type: 'number', isRequired: false },
  sortCreatedDate: { type: 'string', isRequired: false, enumType: SortOrder },
  sortPublishedDate: { type: 'string', isRequired: false, enumType: SortOrder },
};
