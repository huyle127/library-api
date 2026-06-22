import { pool } from '../db/pool';
import { Category } from '../models/category';

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    const { rows } = await pool.query<Category>('SELECT id, name FROM categories ORDER BY name');
    return rows;
  }

  async findById(id: string): Promise<Category | undefined> {
    const { rows } = await pool.query<Category>(
      'SELECT id, name FROM categories WHERE id = $1',
      [id],
    );
    return rows[0];
  }

  async create(name: string): Promise<Category> {
    const { rows } = await pool.query<Category>(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
      [name],
    );
    return rows[0];
  }

  async update(id: string, name: string): Promise<Category | undefined> {
    const { rows } = await pool.query<Category>(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name',
      [name, id],
    );
    return rows[0];
  }

  async remove(id: string): Promise<boolean> {
   
    const res = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}

export const categoryRepository = new CategoryRepository();
