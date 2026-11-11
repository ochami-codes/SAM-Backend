import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate.ts";

import {
  getGlobalTwoFactorSettings,
  updateGlobalTwoFactorEnforcement,
} from "../services/security/securitySettingsService.ts";

export async function getGlobalTwoFactorSettingsController(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const settings = await getGlobalTwoFactorSettings();

  res.status(200).json({
    success: true,
    data: settings,
  });
}

export async function updateGlobalTwoFactorEnforcementController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { requireTwoFactor } = req.body ?? {};

  if (typeof requireTwoFactor !== "boolean") {
    res.status(400).json({
      success: false,
      message: "requireTwoFactor must be a boolean.",
    });
    return;
  }

  const admin = req.user;

  if (!admin) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  const settings = await updateGlobalTwoFactorEnforcement({
    requireTwoFactor,
    actor: {
      userId: admin.userId,
      fullName: admin.fullName,
      email: admin.email,
    },
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? undefined,
  });

  res.status(200).json({
    success: true,
    message: requireTwoFactor
      ? "Global two-factor authentication enforcement enabled."
      : "Global two-factor authentication enforcement disabled.",
    data: settings,
  });
}