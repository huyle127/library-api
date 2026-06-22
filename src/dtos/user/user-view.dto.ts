import { Role } from '../../enums/role';
import { User } from '../../models/user';

// View an toàn để trả ra client: KHÔNG có password. Dùng chung cho auth lẫn CRUD users.
export interface UserView {
  id: string;
  username: string;
  role: Role;
  createdAt: string;
}

export const toUserView = (user: User): UserView => ({
  id: user.id,
  username: user.username,
  role: user.role,
  createdAt: user.createdAt,
});
