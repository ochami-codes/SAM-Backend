import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";
import { createAuditLog } from "../audit/auditCreationService.ts";
import { AuditLogModel } from "../../models/AuditLog.ts";

export interface CloudinaryUploadSignature {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
  uploadPreset?: never;
}

export interface CloudinaryMediaItem {
  asset_id: string;
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: string;
}

export interface CloudinaryMediaPage {
  items: CloudinaryMediaItem[];
  nextCursor: string | null;
}

interface MediaAuditContext {
   fullName?: string | undefined;
   email?: string | undefined;
   adminId: string;
   ipAddress?: string; 
   userAgent?: string; 
  }
  export interface MediaUploadAuditContext {
  fullName?: string;
  email?: string;  
  adminId: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export function createCloudinaryUploadSignature(): CloudinaryUploadSignature {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "sam";

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    apiSecret
  );

  return {
    timestamp,
    signature,
    cloudName,
    apiKey,
    folder,
  };
}

export async function listCloudinaryMedia(
  limit = 24,
  nextCursor?: string
): Promise<CloudinaryMediaPage> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);

  const search = cloudinary.search
    .expression('resource_type:image AND folder:"sam"')
    .sort_by("created_at", "desc")
    .max_results(safeLimit);

  if (nextCursor) {
    search.next_cursor(nextCursor);
  }

  const result = await search.execute();

  const items: CloudinaryMediaItem[] = result.resources.map(
    (resource: CloudinaryMediaItem) => ({
      asset_id: resource.asset_id,
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      created_at: resource.created_at,
      resource_type: resource.resource_type,
    })
  );

  return {
    items,
    nextCursor: result.next_cursor ?? null,
  };
}
export interface CloudinaryAssetDetails {
  publicId: string;
  secureUrl: string;
}

export async function getCloudinaryAsset(
  publicId: string
): Promise<CloudinaryAssetDetails | null> {
  const normalizedPublicId = publicId.trim();

  if (
    !normalizedPublicId.startsWith("sam/") ||
    normalizedPublicId.length <= 4 ||
    normalizedPublicId.includes("..")
  ) {
    throw new Error("Invalid Cloudinary public ID.");
  }

  try {
    const asset = await cloudinary.api.resource(normalizedPublicId, {
      resource_type: "image",
    });

    return {
      publicId: asset.public_id,
      secureUrl: asset.secure_url,
    };
  } catch (error: unknown) {
    const cloudinaryError = error as {
      http_code?: number;
    };

    if (cloudinaryError.http_code === 404) {
      return null;
    }

    throw error;
  }
}

export async function deleteCloudinaryMedia(
  publicId: string,
  auditContext: MediaAuditContext
): Promise<{ result: string }> {
  const asset = await getCloudinaryAsset(publicId);

  if (!asset) {
    throw new Error("Cloudinary image not found.");
  }

  const result = await cloudinary.uploader.destroy(asset.publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok") {
    return { result: result.result };
  }

  await createAuditLog({
    actor: {
      userId: new mongoose.Types.ObjectId(auditContext.adminId),
      ...(auditContext.fullName !== undefined && {
        fullName: auditContext.fullName,
      }),
      ...(auditContext.email !== undefined && {
        email: auditContext.email,
      }),
    },
    action: AUDIT_ACTIONS.MEDIA_DELETED,
    category: "media",
    resource: {
      type: "cloudinary_asset",
      id: asset.publicId,
    },
    description: "Media asset deleted successfully",
    metadata: {
      publicId: asset.publicId,
      secureUrl: asset.secureUrl,
      resourceType: "image",
    },
    ...(auditContext.ipAddress !== undefined && {
      ipAddress: auditContext.ipAddress,
    }),
    ...(auditContext.userAgent !== undefined && {
      userAgent: auditContext.userAgent,
    }),
  });

  return { result: result.result };
}

export async function confirmCloudinaryUpload(
  assetId: string,
  auditContext: MediaUploadAuditContext
): Promise<void> {
  // Find the uploaded asset using its Cloudinary asset ID.
  const result = await cloudinary.search
    .expression(
      `asset_id=${assetId} AND resource_type:image AND folder:"sam"`
    )
    .max_results(1)
    .execute();

  const asset = result.resources?.[0];

  if (!asset) {
    throw new Error(
      "Uploaded image could not be verified in the SAM media folder."
    );
  }

  // Prevent ordinary retries from creating duplicate audit events.
  const existingAudit = await AuditLogModel.exists({
    action: AUDIT_ACTIONS.MEDIA_UPLOADED,
    "resource.id": asset.asset_id,
  });

  if (existingAudit) {
    return;
  }

  await createAuditLog({
    actor: {
      userId: new mongoose.Types.ObjectId(auditContext.adminId),
      ...(auditContext.fullName !== undefined && {
        fullName: auditContext.fullName,
      }),
      ...(auditContext.email !== undefined && {
        email: auditContext.email,
      })},
    action: AUDIT_ACTIONS.MEDIA_UPLOADED,
    category: "media",
    resource: {
      type: "cloudinary_asset",
      id: asset.asset_id,
    },
    description: "Media asset uploaded successfully",
    metadata: {
      assetId: asset.asset_id,
      publicId: asset.public_id,
      secureUrl: asset.secure_url,
      format: asset.format,
      bytes: asset.bytes,
      resourceType: asset.resource_type,
    },
    ...(auditContext.ipAddress !== undefined && {
      ipAddress: auditContext.ipAddress,
    }),
    ...(auditContext.userAgent !== undefined && {
      userAgent: auditContext.userAgent,
    }),
  });
}                    