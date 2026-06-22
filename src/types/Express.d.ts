import { Role } from '../enums/role';

// Mở rộng Request của Express để có req.user (do authenticate gắn vào).
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};