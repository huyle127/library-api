import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { Role } from '../enums/role';
import { RegisterDTO } from '../dtos/auth/register.dto';
import { LoginDTO } from '../dtos/auth/login.dto';
import { AuthResponse } from '../dtos/auth/auth-response.dto';
import { UserView, toUserView } from '../dtos/user/user-view.dto';
import { ConflictError, UnauthorizedError } from '../errors';
import { MESSAGES } from '../constants/messages';
import { env } from '../config/env';

const SALT_ROUNDS = 10;

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register(dto: RegisterDTO): Promise<UserView> {
    const existing = await this.users.findByUsername(dto.username);
    if (existing) {
      throw new ConflictError(MESSAGES.USERNAME_TAKEN);
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.users.create({
      username: dto.username,
      password: passwordHash,
      role: Role.USER, 
    });

    return toUserView(user);
  }

  // Tìm user -> bcrypt.compare -> ký JWT.
  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await this.users.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS);
    }

    const matched = await bcrypt.compare(dto.password, user.password);
    if (!matched) {
      throw new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS);
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return { token, user: toUserView(user) };
  }
}
