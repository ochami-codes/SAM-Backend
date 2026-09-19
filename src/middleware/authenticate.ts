import type { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../utils/tokens.ts";
import { AppError } from "../errors/AppError.ts";

export interface AuthenticatedUser {
  userId: string;
  role: "admin" | "super_admin";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return next(
      new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED"
      )
    );
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(
      new AppError(
        "Invalid authorization header",
        401,
        "INVALID_AUTHORIZATION"
      )
    );
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    return next(
      new AppError(
        "Invalid or expired access token",
        401,
        "INVALID_ACCESS_TOKEN"
      )
    );
  }
}