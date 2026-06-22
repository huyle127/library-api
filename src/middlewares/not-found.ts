import { RequestHandler } from 'express';
import { NotFoundError } from '../errors';
import { MESSAGES } from '../constants/messages';

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new NotFoundError(MESSAGES.ROUTE_NOT_FOUND));
};
