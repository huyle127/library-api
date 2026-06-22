import { Schema } from '../field-rule';
import { Role } from '../../enums/role';

export const createUserSchema: Schema = {
  username: { type: 'string', isRequired: true },
  password: { type: 'string', isRequired: true },
  role: { type: 'string', isRequired: true, enumType: Role },
};

// Sửa hồ sơ: không còn role ở đây.
export const updateUserSchema: Schema = {
  username: { type: 'string', isRequired: false },
  password: { type: 'string', isRequired: false },
};

// Đổi role: chỉ field role, bắt buộc.
export const updateRoleSchema: Schema = {
  role: { type: 'string', isRequired: true, enumType: Role },
};
