import type { Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "./authenticate.ts";
import { AppError } from "../errors/AppError.ts";

export type UserRole = "super_admin" | "admin";

export function authorize(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    const role = req.user?.role;

    const isAllowed = role
      ? allowedRoles.includes(role)
      : false;

    if (!req.user) {
      return next(
        new AppError(
          "Authentication required",
          401,
          "AUTHENTICATION_REQUIRED"
        )
      );
    }

    if (!isAllowed) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          403,
          "FORBIDDEN"
        )
      );
    }

    next();
  };
}