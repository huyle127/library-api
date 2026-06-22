import { Role } from '../enums/role';

export interface User {
  id: string;
  username: string;
  password: string; // chuỗi bcrypt hash, KHÔNG phải mật khẩu gốc
  role: Role;
  createdAt: string;
}
