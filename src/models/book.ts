export interface Book {
  id: string;
  name: string;
  authorId: string;
  categoryIds: string[];
  content: string;
  publishedDate: string;
  createdDate: string;
  createdBy: string;
}