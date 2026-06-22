import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user.repository";
import { BookRepository } from "../repositories/book.repository";
import { authenticate } from "../middlewares/authenticate";
import { requireRole, requireSelfOrManagement } from "../middlewares/authorize";
import {
  validateBody,
  validateParams,
} from "../validation/validate.middleware";
import {
  createUserSchema,
  updateUserSchema,
  updateRoleSchema,
} from "../validation/schemas/user.schema";
import { idParamSchema } from "../validation/schemas/common.schema";
import { MANAGEMENT_ROLES } from "../enums/role";

const router = Router();
const userRepository = new UserRepository();
const bookRepository = new BookRepository();
const userService = new UserService(userRepository, bookRepository);
const userController = new UserController(userService);

router.get(
  "/",
  authenticate,
  requireRole(...MANAGEMENT_ROLES),
  userController.getUsers,
);

router.get(
  "/:id",
  authenticate,
  requireSelfOrManagement("id"),
  validateParams(idParamSchema),
  userController.getUserById,
);

router.post(
  "/",
  authenticate,
  requireRole(...MANAGEMENT_ROLES),
  validateBody(createUserSchema),
  userController.createUser,
);

router.put(
  "/:id",
  authenticate,
  validateParams(idParamSchema),
  validateBody(updateUserSchema, { partial: true }),
  userController.updateUser,
);

router.put(
  "/:id/role",
  authenticate,
  requireRole(...MANAGEMENT_ROLES),
  validateParams(idParamSchema),
  validateBody(updateRoleSchema),
  userController.updateUserRole,
);

router.delete(
  "/:id",
  authenticate,
  requireRole(...MANAGEMENT_ROLES),
  validateParams(idParamSchema),
  userController.deleteUser,
);

export default router;
