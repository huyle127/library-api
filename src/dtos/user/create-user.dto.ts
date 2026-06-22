import { Role } from '../../enums/role';

export interface CreateUserDTO {
  username: string;
  password: string;
  role: Role;
}