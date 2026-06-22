import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './pool';

// Đọc schema.sql và chạy 1 lần -> dựng toàn bộ bảng.
// Đây là "migration" viết tay (pg không có migration tự động như Prisma).
const run = async (): Promise<void> => {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Schema applied: users, authors, categories, books, book_categories.');
  await pool.end();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
