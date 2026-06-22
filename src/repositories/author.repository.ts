import { pool } from '../db/pool';
import { Author } from '../models/author';

export class AuthorRepository {
  async findAll(): Promise<Author[]> {
    const { rows } = await pool.query<Author>('SELECT id, name FROM authors ORDER BY name');
    return rows;
  }

  async findById(id: string): Promise<Author | undefined> {
    const { rows } = await pool.query<Author>('SELECT id, name FROM authors WHERE id = $1', [id]);
    return rows[0];
  }
}

// Singleton tiện dùng / inject sẵn.
export const authorRepository = new AuthorRepository();
