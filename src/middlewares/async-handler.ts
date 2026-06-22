import { RequestHandler } from 'express';

// Bọc controller async: lỗi tự rơi về errorHandler qua next(err).
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
