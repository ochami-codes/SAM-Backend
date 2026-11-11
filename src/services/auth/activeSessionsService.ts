import { RefreshSessionModel } from "../../models/refreshSession.ts";

export interface ActiveSession {
  sessionId: string;
  deviceName: string;
  ipAddress: string | null;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

export async function getActiveSessions(
  userId: string,
  currentSessionId: string
): Promise<ActiveSession[]> {
  const sessions = await RefreshSessionModel.find({
    userId,
    expiresAt: { $gt: new Date() },
  })
    .select(
      "sessionId deviceName ipAddress createdAt lastActiveAt expiresAt"
    )
    .sort({ lastActiveAt: -1 })
    .lean();

  return sessions.map((session) => ({
    sessionId: session.sessionId,
    deviceName: session.deviceName ?? "Unknown device",
    ipAddress: session.ipAddress ?? null,
    createdAt: session.createdAt,
    lastActiveAt: session.lastActiveAt,
    expiresAt: session.expiresAt,
    isCurrent: session.sessionId === currentSessionId,
  }));
}