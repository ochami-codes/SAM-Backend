import { AppError } from "../../../errors/AppError.ts";
import { AUDIT_ACTIONS } from "../../../constants/auditActions.ts";
import type {
ManagedContentIdentifier,
UpdateManagedContentBody,
} from "../../../utils/validation/managedContentValidation.ts";
import {
auditManagedContent,
type ManagedContentAuditContext,
} from "../helpers/auditManagedContent.ts";
import {
findByIdentifier,
toContentData,
} from "../helpers/managedContentHelpers.ts";
import type { ManagedContentData } from "../managedContentService.ts";

export async function updateManagedContent(
identifier: ManagedContentIdentifier,
input: UpdateManagedContentBody,
context: ManagedContentAuditContext
): Promise<ManagedContentData> {
const content = await findByIdentifier(identifier);

if (!content) {
throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
}

const previousState = {
title: content.title,
section: content.section,
slug: content.slug,
category: content.category,
status: content.status,
};

const identifierChanged =
(input.section !== undefined && content.section !== input.section) ||
(input.slug !== undefined && content.slug !== input.slug) ||
(input.category !== undefined && content.category !== input.category);

if (identifierChanged) {
const duplicate = await findByIdentifier({
section: input.section ?? content.section,
...(input.category !== undefined
? { category: input.category }
: content.category && { category: content.category }),
slug: input.slug ?? content.slug,
});

if (duplicate && duplicate._id.toString() !== content._id.toString()) {
  throw new AppError(
    "Managed content with this identifier already exists",
    409,
    "CONTENT_ALREADY_EXISTS"
  );
}
}

Object.assign(content, {
...(input.title !== undefined && { title: input.title }),
...(input.slug !== undefined && { slug: input.slug }),
...(input.section !== undefined && { section: input.section }),
...(input.category !== undefined && { category: input.category }),
...(input.content !== undefined && { content: input.content }),
...(input.description !== undefined && {
description: input.description,
}),
...(input.heroImage !== undefined && { heroImage: input.heroImage }),
...(input.order !== undefined && { order: input.order }),
updatedBy: context.userId,
});

await content.save();

await auditManagedContent({
context,
action: AUDIT_ACTIONS.CONTENT_UPDATED,
content,
description: `Updated managed content: ${content.title}`,
metadata: {
previousState,
newState: {
title: content.title,
section: content.section,
slug: content.slug,
category: content.category,
status: content.status,
},
},
});

return toContentData(content);
}
