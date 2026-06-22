import { Pool } from 'pg';
import { env } from '../config/env';

// Một Pool duy nhất cho cả app: tái dùng kết nối, không mở/đóng liên tục.
// Mọi repository import pool này để chạy query.
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});
