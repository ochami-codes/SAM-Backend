import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { logoutUser } from "../../services/auth/logoutService.ts";
import { getClientIp } from "../../utils/getClientIp.ts";
import type { Response } from "express";

export async function logout(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const ipAddress = getClientIp(req);
const userAgent = req.get("user-agent");

await logoutUser(
  refreshToken,
  {
    ...(ipAddress !== undefined && { ipAddress }),
    ...(userAgent !== undefined && { userAgent }),
  }
);
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