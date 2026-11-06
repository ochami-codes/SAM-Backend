import type { Response, Request } from "express";
import { refreshAccessToken } from "../../services/auth/refreshTokenService.ts";
import { AppError } from "../../errors/AppError.ts";

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