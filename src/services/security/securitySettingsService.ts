import mongoose from "mongoose";

import { UserModel } from "../../models/User.ts";
import { SecuritySettingsModel } from "../../models/SecuritySettings.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";

import { createAuditLog } from "../audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface UpdateGlobalTwoFactorInput {
  requireTwoFactor: boolean;
  actor: {
    userId: string;
    fullName?: string | undefined;
    email?: string | undefined;
  };
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

interface GlobalTwoFactorSettings {
  requireTwoFactor: boolean;
}

export async function getGlobalTwoFactorSettings(): Promise<GlobalTwoFactorSettings> {
  const settings = await SecuritySettingsModel.findOne({
    key: "global",
  }).select("requireTwoFactor");

  return {
    requireTwoFactor: settings?.requireTwoFactor ?? false,
  };
}

export async function updateGlobalTwoFactorEnforcement(
  input: UpdateGlobalTwoFactorInput
): Promise<GlobalTwoFactorSettings> {
  const session = await mongoose.startSession();

  let previousValue = false;
  let changed = false;

  try {
    await session.withTransaction(async () => {
      const currentSettings = await SecuritySettingsModel.findOne({
        key: "global",
      }).session(session);

      previousValue = currentSettings?.requireTwoFactor ?? false;

      // Avoid unnecessary session invalidation and audit events.
      if (previousValue === input.requireTwoFactor) {
        return;
      }

      await SecuritySettingsModel.updateOne(
        { key: "global" },
        {
          $set: {
            requireTwoFactor: input.requireTwoFactor,
            updatedBy: new mongoose.Types.ObjectId(input.actor.userId),
          },
          $setOnInsert: {
            key: "global",
          },
        },
        {
          upsert: true,
          runValidators: true,
          session,
        }
      );

      // Invalidate all existing administrator access tokens.
      await UserModel.updateMany(
        {},
        {
          $inc: { authVersion: 1 },
        },
        { session }
      );

      // Revoke all existing refresh sessions.
      await RefreshSessionModel.deleteMany({}, { session });

      changed = true;
    });
  } finally {
    await session.endSession();
  }

  if (changed) {
    await createAuditLog({
      action: AUDIT_ACTIONS.GLOBAL_TWO_FACTOR_ENFORCEMENT_UPDATED,
      category: "settings",
      description: input.requireTwoFactor
        ? "Global two-factor authentication enforcement enabled."
        : "Global two-factor authentication enforcement disabled.",
      actor: {
        userId: new mongoose.Types.ObjectId(input.actor.userId),
        fullName: input.actor.fullName,
        email: input.actor.email,
      },
      resource: {
        type: "security_settings",
        id: "global",
      },
      metadata: {
        previousValue,
        newValue: input.requireTwoFactor,
      },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }

  return {
    requireTwoFactor: input.requireTwoFactor,
  };
}