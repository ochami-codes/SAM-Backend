import { UserModel } from "../../models/User.ts";
import { AppError } from "../../errors/AppError.ts";

import { createAuditLog } from "../audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

import type { UpdateProfileInput } from "../../utils/validation/profile/updateProfileSchema.ts";

interface UpdateProfileAuditContext {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

interface UpdatedProfile {
  id: string;
  fullName: string;
  email: string;
  profileImage: string | null;
  role: "super_admin" | "admin";
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
  auditContext: UpdateProfileAuditContext = {}
): Promise<UpdatedProfile> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "Account is inactive",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  const changedFields: string[] = [];

  if (
    input.fullName !== undefined &&
    input.fullName !== user.fullName
  ) {
    user.fullName = input.fullName;
    changedFields.push("fullName");
  }

  if (changedFields.length === 0) {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage ?? null,
      role: user.role,
    };
  }

  await user.save();

  await createAuditLog({
    actor: {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    action: AUDIT_ACTIONS.PROFILE_UPDATED,
    category: "administrators",
    description: "Administrator updated their profile",
    resource: {
      type: "user",
      id: user._id.toString(),
    },
    metadata: {
      changedFields,
    },
    ...auditContext,
  });

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    profileImage: user.profileImage ?? null,
    role: user.role,
  };
}