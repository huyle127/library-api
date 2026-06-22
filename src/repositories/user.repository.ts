import { pool } from "../db/pool";
import { User } from "../models/user";
import { Role } from "../enums/role";

// Cột thô từ DB (snake_case)
interface UserRow {
  id: string;
  username: string;
  password: string;
  role: Role;
  created_at: string;
}

const toUser = (r: UserRow): User => ({
  id: r.id,
  username: r.username,
  password: r.password,
  role: r.role,
  createdAt: r.created_at,
});

// created_at là DATE 
const SELECT = `SELECT id, username, password, role, created_at::text AS created_at FROM users`;
const RETURNING = `RETURNING id, username, password, role, created_at::text AS created_at`;

export interface CreateUserData {
  username: string;
  password: string;
  role: Role;
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  role?: Role;
}

export class UserRepository {
  async findAll(): Promise<User[]> {
    const { rows } = await pool.query<UserRow>(`${SELECT} ORDER BY created_at`);
    return rows.map(toUser);
  }

  async findById(id: string): Promise<User | undefined> {
    const { rows } = await pool.query<UserRow>(`${SELECT} WHERE id = $1`, [id]);
    return rows[0] ? toUser(rows[0]) : undefined;
  }

  // Dùng cho login (tìm để compare) và register (check trùng).
  async findByUsername(username: string): Promise<User | undefined> {
    const { rows } = await pool.query<UserRow>(
      `${SELECT} WHERE username = $1`,
      [username],
    );
    return rows[0] ? toUser(rows[0]) : undefined;
  }

  async create(data: CreateUserData): Promise<User> {
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ${RETURNING}`,
      [data.username, data.password, data.role],
    );
    return toUser(rows[0]);
  }

  async update(id: string, data: UpdateUserData): Promise<User | undefined> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (data.username !== undefined) {
      sets.push(`username = $${i++}`);
      vals.push(data.username);
    }
    if (data.password !== undefined) {
      sets.push(`password = $${i++}`);
      vals.push(data.password);
    }
    if (data.role !== undefined) {
      sets.push(`role = $${i++}`);
      vals.push(data.role);
    }
    if (sets.length === 0) return this.findById(id); // không có field nào để sửa

    vals.push(id);
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $${i} ${RETURNING}`,
      vals,
    );
    return rows[0] ? toUser(rows[0]) : undefined;
  }

  async remove(id: string): Promise<boolean> {
    const res = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }
}


export const userRepository = new UserRepository();
