import { RequestHandler } from 'express';
import { Role, MANAGEMENT_ROLES } from '../enums/role';
import { ForbiddenError } from '../errors';
import { MESSAGES } from '../constants/messages';

// Gate theo role: chỉ cho các role được chỉ định.
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError(MESSAGES.FORBIDDEN));
    }
    next();
  };

// Gate "chính chủ hoặc người quản lý": id trên path trùng người đăng nhập,
// hoặc người đăng nhập thuộc nhóm quản lý (MANAGER/ADMIN/SUPER_ADMIN).
// Đây là check THÔ ở tầng route; phân quyền chi tiết theo thứ bậc nằm trong service.
export const requireSelfOrManagement =
  (paramName = 'id'): RequestHandler =>
  (req, _res, next) => {
    const isSelf = req.user?.id === req.params[paramName];
    const isManager = req.user ? MANAGEMENT_ROLES.includes(req.user.role) : false;
    if (!isSelf && !isManager) {
      return next(new ForbiddenError(MESSAGES.FORBIDDEN));
    }
    next();
  };
