import { pool } from '../db/pool';
import { Book } from '../models/book';
import { BookView } from '../dtos/book/book-view.dto';
import { CreateBookDTO } from '../dtos/book/create-book.dto';
import { UpdateBookDTO } from '../dtos/book/update-book.dto';

// ----- Kiểu cột thô trả về từ SQL (snake_case) -----
interface BookEntityRow {
  id: string;
  name: string;
  author_id: string;
  content: string;
  published_date: string;
  created_date: string;
  created_by: string;
  category_ids: string[];
}

interface BookViewRow {
  id: string;
  name: string;
  published_date: string;
  created_date: string;
  author: { id: string; name: string };
  categories: { id: string; name: string }[];
}

// SnakeCase sang camelCase -----
const toBook = (r: BookEntityRow): Book => ({
  id: r.id,
  name: r.name,
  authorId: r.author_id,
  categoryIds: r.category_ids,
  content: r.content,
  publishedDate: r.published_date,
  createdDate: r.created_date,
  createdBy: r.created_by,
});

const toView = (r: BookViewRow): BookView => ({
  id: r.id,
  name: r.name,
  author: r.author,
  categories: r.categories,
  createdDate: r.created_date,
  publishedDate: r.published_date,
});

// SELECT cho list: JOIN author + gom categories thành mảng object (thay cho include của Prisma).
const SELECT_VIEW = `
  SELECT
    b.id,
    b.name,
    b.published_date::text AS published_date,
    b.created_date::text   AS created_date,
    json_build_object('id', a.id, 'name', a.name) AS author,
    COALESCE(
      json_agg(json_build_object('id', c.id, 'name', c.name))
        FILTER (WHERE c.id IS NOT NULL),
      '[]'
    ) AS categories
  FROM books b
  JOIN authors a ON a.id = b.author_id
  LEFT JOIN book_categories bc ON bc.book_id = b.id
  LEFT JOIN categories c ON c.id = bc.category_id
`;

// SELECT cho detail: trả entity đầy đủ (có content) + categoryIds dạng mảng id.
const SELECT_ENTITY = `
  SELECT
    b.id,
    b.name,
    b.author_id,
    b.created_by,
    b.content,
    b.published_date::text AS published_date,
    b.created_date::text   AS created_date,
    COALESCE(
      array_agg(bc.category_id) FILTER (WHERE bc.category_id IS NOT NULL),
      '{}'
    ) AS category_ids
  FROM books b
  LEFT JOIN book_categories bc ON bc.book_id = b.id
`;

export interface ListFilters {
  authorId?: string;
  categoryId?: string;
  sortField?: 'created_date' | 'published_date';
  sortOrder?: 'ASC' | 'DESC';
  limit: number;
  offset: number;
}

export class BookRepository {
  // List có filter + sort + pagination, làm hết ở tầng SQL.
  async findList(f: ListFilters): Promise<{ items: BookView[]; total: number }> {
    const where: string[] = [];
    const vals: unknown[] = [];
    let i = 1;

    if (f.authorId) {
      where.push(`b.author_id = $${i++}`);
      vals.push(f.authorId);
    }
    if (f.categoryId) {
      where.push(
        `EXISTS (SELECT 1 FROM book_categories x WHERE x.book_id = b.id AND x.category_id = $${i++})`,
      );
      vals.push(f.categoryId);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalRes = await pool.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM books b ${whereSql}`,
      vals,
    );
    const total = totalRes.rows[0].count;

    // sortField/sortOrder lấy từ enum (whitelist) nên nối chuỗi an toàn.
    const orderSql = f.sortField
      ? `ORDER BY b.${f.sortField} ${f.sortOrder}`
      : 'ORDER BY b.created_date';

    const limitIdx = i++;
    const offsetIdx = i++;
    const { rows } = await pool.query<BookViewRow>(
      `${SELECT_VIEW} ${whereSql} GROUP BY b.id, a.id ${orderSql} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      [...vals, f.limit, f.offset],
    );
    return { items: rows.map(toView), total };
  }

  async findById(id: string): Promise<Book | undefined> {
    const { rows } = await pool.query<BookEntityRow>(
      `${SELECT_ENTITY} WHERE b.id = $1 GROUP BY b.id`,
      [id],
    );
    return rows[0] ? toBook(rows[0]) : undefined;
  }

  async create(dto: CreateBookDTO, createdBy: string): Promise<Book> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO books (name, author_id, content, published_date, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [dto.name, dto.authorId, dto.content, dto.publishedDate, createdBy],
      );
      const bookId = rows[0].id;
      for (const categoryId of dto.categoryIds) {
        await client.query(
          'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)',
          [bookId, categoryId],
        );
      }
      await client.query('COMMIT');
      return (await this.findById(bookId)) as Book;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: string, dto: UpdateBookDTO): Promise<Book | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const sets: string[] = [];
      const vals: unknown[] = [];
      let i = 1;
      if (dto.name !== undefined) {
        sets.push(`name = $${i++}`);
        vals.push(dto.name);
      }
      if (dto.authorId !== undefined) {
        sets.push(`author_id = $${i++}`);
        vals.push(dto.authorId);
      }
      if (dto.content !== undefined) {
        sets.push(`content = $${i++}`);
        vals.push(dto.content);
      }
      if (dto.publishedDate !== undefined) {
        sets.push(`published_date = $${i++}`);
        vals.push(dto.publishedDate);
      }

      let exists = true;
      if (sets.length > 0) {
        vals.push(id);
        const res = await client.query(
          `UPDATE books SET ${sets.join(', ')} WHERE id = $${i} RETURNING id`,
          vals,
        );
        exists = (res.rowCount ?? 0) > 0;
      } else {
        const res = await client.query('SELECT id FROM books WHERE id = $1', [id]);
        exists = (res.rowCount ?? 0) > 0;
      }

      if (!exists) {
        await client.query('ROLLBACK');
        return undefined;
      }

     
      if (dto.categoryIds !== undefined) {
        await client.query('DELETE FROM book_categories WHERE book_id = $1', [id]);
        for (const categoryId of dto.categoryIds) {
          await client.query(
            'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)',
            [id, categoryId],
          );
        }
      }

      await client.query('COMMIT');
      return this.findById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async remove(id: string): Promise<boolean> {
   
    const res = await pool.query('DELETE FROM books WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async countByOwner(userId: string): Promise<number> {
    const { rows } = await pool.query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM books WHERE created_by = $1',
      [userId],
    );
    return rows[0].count;
  }
}

export const bookRepository = new BookRepository();