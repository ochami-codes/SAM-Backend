import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: "super_admin" | "admin";
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  sessionId: string;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return secret;
}

function isAccessTokenPayload(
  payload: string | JwtPayload
): payload is AccessTokenPayload {
  return (
    typeof payload !== "string" &&
    typeof payload.userId === "string" &&
    (payload.role === "admin" ||
      payload.role === "super_admin")
  );
}

function isRefreshTokenPayload(
  payload: string | JwtPayload
): payload is RefreshTokenPayload {
  return (
    typeof payload !== "string" &&
    typeof payload.userId === "string" &&
    typeof payload.sessionId === "string"
  );
}

export function createAccessToken(
  payload: AccessTokenPayload
): string {
  const options: SignOptions = {
    expiresIn: "15m",
  };

  return jwt.sign(payload, getAccessSecret(), options);
}

export function createRefreshToken(
  payload: RefreshTokenPayload
): string {
  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, getRefreshSecret(), options);
}

export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  const payload = jwt.verify(
    token,
    getAccessSecret()
  );

  if (!isAccessTokenPayload(payload)) {
    throw new Error("Invalid access token payload");
  }

  return payload;
}

export function verifyRefreshToken(
  token: string
): RefreshTokenPayload {
  const payload = jwt.verify(
    token,
    getRefreshSecret()
  );

  if (!isRefreshTokenPayload(payload)) {
    throw new Error("Invalid refresh token payload");
  }

  return payload;
}