import { AuditLogModel } from "../../models/AuditLog.ts";
import { auditLogInputSchema } from "../../utils/validation/auditValidation.ts";
import type { AuditLogInput } from "../../types/audit/audit.ts";

export async function createAuditLog(input: AuditLogInput): Promise<void> {
const validatedInput = auditLogInputSchema.parse(input);

const document = {
action: validatedInput.action,
category: validatedInput.category,
description: validatedInput.description,

...(validatedInput.actor && {
  actor: {
    ...(validatedInput.actor.userId && {
      userId: validatedInput.actor.userId,
    }),
    ...(validatedInput.actor.fullName !== undefined && {
      fullName: validatedInput.actor.fullName,
    }),
    ...(validatedInput.actor.email !== undefined && {
      email: validatedInput.actor.email,
    }),
  },
}),

...(validatedInput.resource && {
  resource: {
    type: validatedInput.resource.type,
    ...(validatedInput.resource.id !== undefined && {
      id: validatedInput.resource.id,
    }),
  },
}),

...(validatedInput.metadata !== undefined && {
  metadata: validatedInput.metadata,
}),

...(validatedInput.ipAddress !== undefined && {
  ipAddress: validatedInput.ipAddress,
}),

...(validatedInput.userAgent !== undefined && {
  userAgent: validatedInput.userAgent,
}),

};

await AuditLogModel.create(document);
}
