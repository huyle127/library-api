import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";
import { Role } from "../enums/role";

interface JwtPayload{
    userId:string;
    role:Role;
}
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError(MESSAGES.TOKEN_MISSING));
  }
 
  const token = header.slice('Bearer '.length);  //lấy token
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    next(new UnauthorizedError(MESSAGES.TOKEN_INVALID));
  }
};
 