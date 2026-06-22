import { RequestHandler } from 'express';
import { Schema } from './field-rule';
import { validate } from './validate';
import { BadRequestError } from '../errors';
import { MESSAGES } from '../constants/messages';

type Source = 'body' | 'query' | 'params';

const make =
  (source: Source, schema: Schema, options?: { partial?: boolean }): RequestHandler =>
  (req, _res, next) => {
    const errors = validate(req[source] as Record<string, unknown>, schema, options);
    if (errors.length) return next(new BadRequestError(MESSAGES.VALIDATION_FAILED, errors));
    next();
  };

export const validateBody = (schema: Schema, options?: { partial?: boolean }) =>
  make('body', schema, options);
export const validateQuery = (schema: Schema) => make('query', schema);
export const validateParams = (schema: Schema) => make('params', schema);
