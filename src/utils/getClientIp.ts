import type { Request } from "express";

export function getClientIp(req: Request): string {
  const cloudflareIp = req.headers["cf-connecting-ip"];

  if (
    typeof cloudflareIp === "string" &&
    cloudflareIp.trim()
  ) {
    return cloudflareIp.trim();
  }

  return req.ip || "unknown";
}