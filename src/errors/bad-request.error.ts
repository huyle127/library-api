import { AppError } from './app-error';
import { HttpStatus } from '../constants/http-status';
import { MESSAGES } from '../constants/messages';

export class BadRequestError extends AppError {
  constructor(message: string = MESSAGES.VALIDATION_FAILED, details?: string[]) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}
