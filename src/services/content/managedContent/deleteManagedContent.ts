import { AppError } from "../../../errors/AppError.ts";
import { AUDIT_ACTIONS } from "../../../constants/auditActions.ts";
import { ManagedContentModel } from "../../../models/ManagedContent.ts";
import type {
ManagedContentIdentifier,
} from "../../../utils/validation/managedContentValidation.ts";
import {
auditManagedContent,
type ManagedContentAuditContext,
} from "../helpers/auditManagedContent.ts";
import { findByIdentifier } from "../helpers/managedContentHelpers.ts";

export async function deleteManagedContent(
identifier: ManagedContentIdentifier,
context: ManagedContentAuditContext
): Promise<void> {
const content = await findByIdentifier(identifier);

if (!content) {
throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
}

const result = await ManagedContentModel.deleteOne({
_id: content._id,
});

if (result.deletedCount !== 1) {
throw new AppError(
"Managed content deletion failed",
500,
"CONTENT_DELETION_FAILED"
);
}

await auditManagedContent({
context,
action: AUDIT_ACTIONS.CONTENT_DELETED,
content,
description: `Deleted managed content: ${content.title}`,
});
}
