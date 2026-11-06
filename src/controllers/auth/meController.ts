import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { getCurrentUser } from "../../services/auth/getCurrentUserService.ts";
import type { Response } from "express";
export async function me(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.userId;

  const user = await getCurrentUser(req.user!.userId);

  res.status(200).json(user);
}