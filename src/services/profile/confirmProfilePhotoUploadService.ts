import mongoose from "mongoose";

import cloudinary from "../../config/cloudinary.ts";
import { UserModel } from "../../models/User.ts";
import { AppError } from "../../errors/AppError.ts";

import { createAuditLog } from "../audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface ProfilePhotoAuditContext {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export async function confirmProfilePhotoUpload(
  assetId: string,
  userId: string,
  auditContext: ProfilePhotoAuditContext = {}
): Promise<void> {
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

  // Verify that the uploaded asset belongs to this administrator.
  const result = await cloudinary.search
    .expression(
      `asset_id=${assetId} AND resource_type:image AND folder:"sam/profiles/${userId}"`
    )
    .max_results(1)
    .execute();

  const asset = result.resources?.[0];

  if (!asset) {
    throw new AppError(
      "Uploaded image could not be verified in your profile folder.",
      400,
      "PROFILE_IMAGE_VERIFICATION_FAILED"
    );
  }

  if (
    asset.resource_type !== "image" ||
    !asset.secure_url ||
    !asset.asset_id
  ) {
    throw new AppError(
      "The uploaded asset is not a valid profile image.",
      400,
      "INVALID_PROFILE_IMAGE"
    );
  }

  // Avoid duplicate updates and audit events on retries.
  if (user.profileImage === asset.secure_url) {
    return;
  }

  const previousProfileImage = user.profileImage ?? null;

  user.profileImage = asset.secure_url;

  await user.save();

  await createAuditLog({
    actor: {
      userId: new mongoose.Types.ObjectId(user._id.toString()),
      fullName: user.fullName,
      email: user.email,
    },
    action: AUDIT_ACTIONS.PROFILE_PHOTO_UPDATED,
    category: "administrators",
    description: "Administrator updated their profile photo",
    resource: {
      type: "user",
      id: user._id.toString(),
    },
    metadata: {
      assetId: asset.asset_id,
      publicId: asset.public_id,
      previousPhotoReplaced: previousProfileImage !== null,
    },
    ...(auditContext.ipAddress !== undefined && {
      ipAddress: auditContext.ipAddress,
    }),
    ...(auditContext.userAgent !== undefined && {
      userAgent: auditContext.userAgent,
    }),
  });
}