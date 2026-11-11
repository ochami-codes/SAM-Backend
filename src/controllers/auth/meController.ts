import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { getCurrentUser } from "../../services/auth/getCurrentUserService.ts";

export async function me(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = await getCurrentUser(req.user!.userId);

  res.status(200).json(user);
}