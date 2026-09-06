import crypto from "node:crypto";

import { RefreshSessionModel } from "../../models/RefreshSession.ts";

export async function logoutUser(
  refreshToken: string
): Promise<void> {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await RefreshSessionModel.deleteOne({
    tokenHash,
  });
}