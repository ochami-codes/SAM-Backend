import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { getClientIp } from "../../utils/getClientIp.ts";

import {
deleteContent,
getContent,
listContent,
updateContent,
} from "../../services/content/contentAdminService.ts";

import {
validateContentIdentifier,
validateDeleteContentBody,
validateUpdateContentBody,
} from "../../utils/validation/contentValidation.ts";

export async function listContentController(
_req: AuthenticatedRequest,
res: Response
): Promise<void> {
const content = await listContent();

res.status(200).json({
success: true,
data: content,
});
}

export async function getContentController(
req: AuthenticatedRequest,
res: Response
): Promise<void> {
const identifier = validateContentIdentifier(
req.params.section,
req.params.category,
req.params.slug
);

const content = await getContent(identifier);

res.status(200).json({
success: true,
data: content,
});
}

export async function updateContentController(
req: AuthenticatedRequest,
res: Response
): Promise<void> {
const identifier = validateContentIdentifier(
req.params.section,
req.params.category,
req.params.slug
);

const input = validateUpdateContentBody(req.body);
const fullName = req.user?.fullName;
const email = req.user?.email;
const ipAddress = getClientIp(req);
const userAgent = req.get("user-agent");

const updatedContent = await updateContent(identifier, input, {
adminId: req.user!.userId,
...(ipAddress !== undefined && { ipAddress }),
...(userAgent !== undefined && { userAgent }),
...(fullName !== undefined && { fullName }),
...(email !== undefined && { email }),
});

res.status(200).json({
success: true,
data: updatedContent,
});
}

export async function deleteContentController(
req: AuthenticatedRequest,
res: Response
): Promise<void> {
const identifier = validateContentIdentifier(
req.params.section,
req.params.category,
req.params.slug
);

const input = validateDeleteContentBody(req.body);
const fullName = req.user?.fullName;
const email = req.user?.email;
const ipAddress = getClientIp(req);
const userAgent = req.get("user-agent");

const deletedContent = await deleteContent(identifier, input, {
adminId: req.user!.userId,
...(ipAddress !== undefined && { ipAddress }),
...(userAgent !== undefined && { userAgent }),
...(fullName !== undefined && { fullName }),
...(email !== undefined && { email }),
});

res.status(200).json({
success: true,
data: deletedContent,
});
}