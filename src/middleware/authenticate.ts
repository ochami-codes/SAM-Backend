import type { Request, Response, NextFunction } from "express";

import { UserModel } from "../models/User.ts";
import { verifyAccessToken } from "../utils/tokens.ts";
import { AppError } from "../errors/AppError.ts";

export interface AuthenticatedUser {
  userId: string;
  role: "admin" | "super_admin";
  fullName?: string | undefined;
  email?: string | undefined;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
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

    const user = await UserModel.findById(payload.userId).select(
      "_id role isActive fullName email"
    );

    if (!user) {
      return next(
        new AppError(
          "User account not found",
          401,
          "USER_NOT_FOUND"
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          "Account is inactive",
          403,
          "ACCOUNT_INACTIVE"
        )
      );
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(
      new AppError(
        "Invalid or expired access token",
        401,
        "INVALID_ACCESS_TOKEN"
      )
    );
  }
}