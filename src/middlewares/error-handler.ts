import { ErrorRequestHandler } from 'express';
import { HttpStatus } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';

// NƠI DUY NHẤT dịch lỗi -> response. Đọc err.statusCode do AppError gắn.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status: number = err.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
  const body: Record<string, unknown> = {
    message: err.message || MESSAGES.INTERNAL_ERROR,
  };
  if (err.details) body.details = err.details;
  if (status >= HttpStatus.INTERNAL_SERVER_ERROR) console.error(err);
  res.status(status).json(body);
};
