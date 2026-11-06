import { AppError } from "../../../errors/AppError.ts";
import { AUDIT_ACTIONS } from "../../../constants/auditActions.ts";
import type { ManagedContentIdentifier } from "../../../utils/validation/managedContentValidation.ts";
import {
auditManagedContent,
type ManagedContentAuditContext,
} from "../helpers/auditManagedContent.ts";
import { findByIdentifier, toContentData } from "../helpers/managedContentHelpers.ts";
import type { ManagedContentData } from "../managedContentService.ts";

export async function publishManagedContent(
identifier: ManagedContentIdentifier,
context: ManagedContentAuditContext
): Promise<ManagedContentData> {
const content = await findByIdentifier(identifier);

if (!content) {
throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
}

if (content.status === "published") {
return toContentData(content);
}

Object.assign(content, {
status: "published",
publishedAt: new Date(),
updatedBy: context.userId,
});

await content.save();

await auditManagedContent({
context,
action: AUDIT_ACTIONS.CONTENT_PUBLISHED,
content,
description: `Published managed content: ${content.title}`,
});

return toContentData(content);
}