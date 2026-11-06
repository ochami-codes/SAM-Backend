import mongoose from "mongoose";

import { createAuditLog } from "../../../services/audit/auditCreationService.ts";
import { toObjectId } from "../../../utils/validation/ObjectId.ts";

export interface ManagedContentAuditContext {
  userId: string;
  fullName?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function auditManagedContent({
  context,
  action,
  content,
  description,
  metadata = {},
}: {
  context: ManagedContentAuditContext;
  action: string;
  content: {
    _id: mongoose.Types.ObjectId;
    section: string;
    slug: string;
    category?: string;
    status: string;
  };
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await createAuditLog({
    actor: {
      userId: toObjectId(context.userId, "userId"),
      ...(context.fullName !== undefined && {
        fullName: context.fullName,
      }),
      ...(context.email !== undefined && {
        email: context.email,
      }),
    },
    action,
    category: "content",
    resource: {
      type: "managed_content",
      id: content._id.toHexString(),
    },
    description,
    metadata: {
      section: content.section,
      slug: content.slug,
      ...(content.category && { category: content.category }),
      status: content.status,
      ...metadata,
    },
    ...(context.ipAddress !== undefined && {
      ipAddress: context.ipAddress,
    }),
    ...(context.userAgent !== undefined && {
      userAgent: context.userAgent,
    }),
  });
}