import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { Role, outranks } from '../enums/role';
import { UserView, toUserView } from '../dtos/user/user-view.dto';
import { CreateUserDTO } from '../dtos/user/create-user.dto';
import { UpdateUserDTO } from '../dtos/user/update-user.dto';
import { NotFoundError, ConflictError, ForbiddenError } from '../errors';
import { MESSAGES } from '../constants/messages';

const SALT_ROUNDS = 10;

// Người đang thực hiện hành động (lấy từ req.user). Tách interface cho gọn.
export interface Actor {
  id: string;
  role: Role;
}

// Chỉ cần phần countByOwner của book repo -> khai báo interface hẹp để inject linh hoạt,
// không phụ thuộc cứng vào cả BookRepository (dễ test, dễ thay thế).
export interface BookOwnershipRepo {
  countByOwner(userId: string): Promise<number>;
}

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly books: BookOwnershipRepo,
  ) {}

  async getAll(): Promise<UserView[]> {
    const users = await this.users.findAll();
    return users.map(toUserView); // bỏ password
  }

  async getById(id: string): Promise<UserView> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
    return toUserView(user);
  }

  // Tạo user kèm role. actor chỉ được tạo user có role THẤP HƠN mình.
  async create(dto: CreateUserDTO, actor: Actor): Promise<UserView> {
    this.assertCanAssignRole(actor, dto.role);

    if (await this.users.findByUsername(dto.username)) {
      throw new ConflictError(MESSAGES.USERNAME_TAKEN);
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.users.create({
      username: dto.username,
      password: passwordHash,
      role: dto.role,
    });
    return toUserView(user);
  }

  // Sửa hồ sơ (username/password). KHÔNG đụng tới role.
  // Cho phép: chính chủ, HOẶC người có cấp cao hơn hẳn target.
  async update(id: string, dto: UpdateUserDTO, actor: Actor): Promise<UserView> {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundError(MESSAGES.USER_NOT_FOUND);

    const isSelf = actor.id === id;
    if (!isSelf && !outranks(actor.role, existing.role)) {
      throw new ForbiddenError(MESSAGES.FORBIDDEN);
    }

    // Đổi username -> kiểm tra trùng (trừ chính nó).
    if (dto.username && dto.username !== existing.username) {
      if (await this.users.findByUsername(dto.username)) {
        throw new ConflictError(MESSAGES.USERNAME_TAKEN);
      }
    }

    const data: { username?: string; password?: string } = { username: dto.username };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    const updated = await this.users.update(id, data);
    if (!updated) throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
    return toUserView(updated);
  }

  // Đổi role của user khác. Đây là nơi duy nhất role bị thay đổi.
  async updateRole(id: string, newRole: Role, actor: Actor): Promise<UserView> {
    const target = await this.users.findById(id);
    if (!target) throw new NotFoundError(MESSAGES.USER_NOT_FOUND);

    // Phải cao hơn hẳn role HIỆN TẠI của target (chặn sửa người ngang/cao hơn, kể cả chính mình).
    if (!outranks(actor.role, target.role)) {
      throw new ForbiddenError(MESSAGES.ROLE_CHANGE_FORBIDDEN);
    }
    // Và không được cấp role >= cấp của chính mình (chặn tự nhân bản quyền lực lên trên).
    this.assertCanAssignRole(actor, newRole);

    const updated = await this.users.update(id, { role: newRole });
    if (!updated) throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
    return toUserView(updated);
  }

  // Xoá user: phải cao hơn hẳn target, và target không còn sách.
  async remove(id: string, actor: Actor): Promise<void> {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundError(MESSAGES.USER_NOT_FOUND);

    if (!outranks(actor.role, existing.role)) {
      throw new ForbiddenError(MESSAGES.FORBIDDEN);
    }

    const owned = await this.books.countByOwner(id);
    if (owned > 0) throw new ConflictError(MESSAGES.USER_HAS_BOOKS);

    await this.users.remove(id);
  }

  // actor chỉ được gán/ tạo role thấp hơn hẳn role của mình.
  private assertCanAssignRole(actor: Actor, target: Role): void {
    if (!outranks(actor.role, target)) {
      throw new ForbiddenError(MESSAGES.ROLE_CHANGE_FORBIDDEN);
    }
  }
}
