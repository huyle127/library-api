import { asyncHandler } from '../middlewares/async-handler';
import { UserService } from '../services/user.service';
import { ok } from '../responses/api-response';
import { HttpStatus } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';
import { CreateUserDTO } from '../dtos/user/create-user.dto';
import { UpdateUserDTO } from '../dtos/user/update-user.dto';
import { UpdateRoleDTO } from '../dtos/user/update-role.dto';

export class UserController {
  constructor(private readonly userService: UserService) {}

  // Dùng arrow-property để giữ đúng `this` khi truyền thẳng làm route handler.
  getUsers = asyncHandler(async (_req, res) => {
    res.status(HttpStatus.OK).json(ok(await this.userService.getAll(), MESSAGES.USERS_FETCHED));
  });

  getUserById = asyncHandler(async (req, res) => {
    res
      .status(HttpStatus.OK)
      .json(ok(await this.userService.getById(req.params.id), MESSAGES.USER_FETCHED));
  });

  createUser = asyncHandler(async (req, res) => {
    const created = await this.userService.create(req.body as CreateUserDTO, req.user!);
    res.status(HttpStatus.CREATED).json(ok(created, MESSAGES.USER_CREATED));
  });

  updateUser = asyncHandler(async (req, res) => {
    const updated = await this.userService.update(
      req.params.id,
      req.body as UpdateUserDTO,
      req.user!,
    );
    res.status(HttpStatus.OK).json(ok(updated, MESSAGES.USER_UPDATED));
  });

  updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body as UpdateRoleDTO;
    const updated = await this.userService.updateRole(req.params.id, role, req.user!);
    res.status(HttpStatus.OK).json(ok(updated, MESSAGES.USER_ROLE_UPDATED));
  });

  deleteUser = asyncHandler(async (req, res) => {
    await this.userService.remove(req.params.id, req.user!);
    res.status(HttpStatus.NO_CONTENT).send();
  });
}
