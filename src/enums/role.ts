export enum Role {
  USER = 'USER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Thứ bậc quyền: số càng lớn quyền càng cao. Mọi quyết định quản lý dựa trên thứ bậc này.
export const roleRank: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.MANAGER]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPER_ADMIN]: 4,
};

// actor có cao hơn HẲN target không (bằng cấp thì không tính là quản lý được).
export const outranks = (actor: Role, target: Role): boolean =>
  roleRank[actor] > roleRank[target];

// role có >= ngưỡng tối thiểu không (vd cần ADMIN trở lên để quản lý nội dung).
export const isAtLeast = (role: Role, min: Role): boolean => roleRank[role] >= roleRank[min];

// Các role có khả năng quản lý người khác (>= MANAGER). Dùng để gác route.
export const MANAGEMENT_ROLES: Role[] = [Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN];
