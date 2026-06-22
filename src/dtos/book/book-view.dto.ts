export interface BookView {
  id: string;
  name: string;
  author: { id: string; name: string } | null;
  categories: { id: string; name: string }[];
  createdDate: string;
  publishedDate: string;
}
