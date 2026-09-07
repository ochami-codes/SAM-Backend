import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.ts";
import { loginUser } from "../services/auth/authService.ts";
import { refreshAccessToken } from "../services/auth/refreshTokenService.ts";
import { changePassword } from "../services/auth/changePasswordService.ts";
import { requestPasswordReset } from "../services/auth/forgotPassword.ts";
import { resetPassword } from "../services/auth/resetPasswordService.ts";
import { logoutUser } from "../services/auth/logoutService.ts";
import { getCurrentUser } from "../services/auth/getCurrentUserService.ts";
import { acceptAdminInvitation } from "../services/auth/adminInvitationAcceptanceService.ts";
import  type{ AuthenticatedRequest } from "../middleware/authenticate.ts";
export async function login(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const result = await loginUser({
    email,
    password,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: result.user,
    accessToken: result.accessToken,
  });
}
export async function refresh(
  req: Request,
  res: Response
): Promise<void> {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(
      "Refresh token required",
      401,
      "REFRESH_TOKEN_REQUIRED"
    );
  }

  const result = await refreshAccessToken(refreshToken);

  // Replace the old refresh token with the rotated one
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    accessToken: result.accessToken,
  });
}
export async function logout(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}
export async function changeUserPassword(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError(
      "Current password and new password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  await changePassword({
    userId: req.user.userId,
    currentPassword,
    newPassword,
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
}
export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { email } = req.body;

  if (!email) {
    throw new AppError(
      "Email is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  await requestPasswordReset(email);

  res.status(200).json({
    success: true,
    message:
      "If an account exists for that email, password reset instructions have been sent.",
  });
}
export async function resetUserPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { token, password } = req.body;
  console.log("Reset token:", token);
  if (!token || !password) {
    throw new AppError(
      "Reset token and new password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  await resetPassword({
    token,
    password,
  });

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
}
export async function me(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.userId;

  const user = await getCurrentUser(req.user.userId);

  res.status(200).json(user);
}
export async function acceptAdminInvitations(
  req: Request,
  res: Response
): Promise<void> {
  const { password, token } = req.body;
  await acceptAdminInvitation({password, token});
  res.status(200).json({
    success: true,
    message: "Admin invitation accepted successfully",
  });
}