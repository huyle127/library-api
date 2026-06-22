import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcrypt';
import { pool } from './pool';

interface SeedUser {
  id: string;
  username: string;
  password: string; // plaintext trong JSON; seed sẽ bcrypt trước khi lưu
  role: 'USER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
}
interface SeedAuthor {
  id: string;
  name: string;
}
interface SeedCategory {
  id: string;
  name: string;
}
interface SeedBook {
  id: string;
  name: string;
  authorId: string;
  categoryIds: string[];
  content: string;
  publishedDate: string;
  createdDate: string;
  createdBy: string;
}

const load = <T>(file: string): T =>
  JSON.parse(readFileSync(join(__dirname, '..', 'data', file), 'utf8')) as T;

const SALT_ROUNDS = 10;

// Id trong JSON là "1","2"... còn DB sinh uuid mới.
// Nên ta insert rồi RETURNING id để map id-cũ sang id-mới, giữ đúng quan hệ.
const run = async (): Promise<void> => {
  const users = load<SeedUser[]>('users.json');
  const authors = load<SeedAuthor[]>('authors.json');
  const categories = load<SeedCategory[]>('categories.json');
  const books = load<SeedBook[]>('books.json');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'TRUNCATE book_categories, books, categories, authors, users CASCADE',
    );

    const userIdMap = new Map<string, string>();
    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
      const { rows } = await client.query<{ id: string }>(
        'INSERT INTO users (username, password, role, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
        [u.username, passwordHash, u.role, u.createdAt],
      );
      userIdMap.set(u.id, rows[0].id);
    }

    const authorIdMap = new Map<string, string>();
    for (const a of authors) {
      const { rows } = await client.query<{ id: string }>(
        'INSERT INTO authors (name) VALUES ($1) RETURNING id',
        [a.name],
      );
      authorIdMap.set(a.id, rows[0].id);
    }

    const categoryIdMap = new Map<string, string>();
    for (const c of categories) {
      const { rows } = await client.query<{ id: string }>(
        'INSERT INTO categories (name) VALUES ($1) RETURNING id',
        [c.name],
      );
      categoryIdMap.set(c.id, rows[0].id);
    }

    for (const b of books) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO books (name, author_id, created_by, content, published_date, created_date)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          b.name,
          authorIdMap.get(b.authorId),
          userIdMap.get(b.createdBy),
          b.content,
          b.publishedDate,
          b.createdDate,
        ],
      );
      const newBookId = rows[0].id;
      for (const oldCatId of b.categoryIds) {
        await client.query(
          'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)',
          [newBookId, categoryIdMap.get(oldCatId)],
        );
      }
    }

    await client.query('COMMIT');
    console.log(
      `Seeded ${users.length} users, ${authors.length} authors, ${categories.length} categories, ${books.length} books.`,
    );
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  await pool.end();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
