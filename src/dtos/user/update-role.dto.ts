import { Role } from '../../enums/role';

// Payload đổi role (chỉ người quản lý cấp trên mới gọi được).
export interface UpdateRoleDTO {
  role: Role;
}
