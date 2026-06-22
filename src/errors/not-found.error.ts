import { AppError } from './app-error';
import { HttpStatus } from '../constants/http-status';

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}
