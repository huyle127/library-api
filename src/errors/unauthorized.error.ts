import { AppError } from './app-error';
import { HttpStatus } from '../constants/http-status';

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
