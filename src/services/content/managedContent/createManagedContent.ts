import { AppError } from "../../../errors/AppError.ts";
import { AUDIT_ACTIONS } from "../../../constants/auditActions.ts";
import { ManagedContentModel } from "../../../models/ManagedContent.ts";
import type { CreateManagedContentBody } from "../../../utils/validation/managedContentValidation.ts";
import { toObjectId } from "../../../utils/validation/ObjectId.ts";
import {
auditManagedContent,
type ManagedContentAuditContext,
} from "../helpers/auditManagedContent.ts";
import {
findByIdentifier,
toContentData,
} from "../helpers/managedContentHelpers.ts";
import type { ManagedContentData } from "../managedContentService.ts";

export async function createManagedContent(
input: CreateManagedContentBody,
context: ManagedContentAuditContext
): Promise<ManagedContentData> {
const existing = await findByIdentifier({
section: input.section,
...(input.category && { category: input.category }),
slug: input.slug,
});

if (existing) {
throw new AppError(
"Managed content with this identifier already exists",
409,
"CONTENT_ALREADY_EXISTS"
);
}

const userObjectId = toObjectId(context.userId, "userId");

const content = await ManagedContentModel.create({
title: input.title,
slug: input.slug,
section: input.section,
...(input.category && { category: input.category }),
content: input.content,
...(input.description && { description: input.description }),
...(input.heroImage && { heroImage: input.heroImage }),
...(input.order !== undefined && { order: input.order }),
status: input.status,
createdBy: userObjectId,
updatedBy: userObjectId,
...(input.status === "published" && { publishedAt: new Date() }),
});

if (!content) {
throw new AppError(
"Managed content creation failed",
500,
"CONTENT_CREATION_FAILED"
);
}

await auditManagedContent({
context,
action: AUDIT_ACTIONS.CONTENT_CREATED,
content,
description: `Created managed content: ${content.title}`,
});

return toContentData(content);
}
