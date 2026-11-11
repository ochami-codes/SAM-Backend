import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

export type AccessTokenPurpose =
  | "access"
  | "two_factor_enrollment";

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  sessionId: string;
  role: "super_admin" | "admin";
  authVersion: number;
  tokenPurpose: AccessTokenPurpose;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  sessionId: string;
}

type CreateAccessTokenPayload = Omit<
  AccessTokenPayload,
  "tokenPurpose"
> & {
  tokenPurpose?: AccessTokenPurpose;
};

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
    typeof payload.sessionId === "string" &&
    typeof payload.userId === "string" &&
    (payload.role === "admin" ||
      payload.role === "super_admin") &&
    typeof payload.authVersion === "number" &&
    Number.isInteger(payload.authVersion) &&
    payload.authVersion >= 0 &&
    (payload.tokenPurpose === "access" ||
      payload.tokenPurpose === "two_factor_enrollment")
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
  payload: CreateAccessTokenPayload
): string {
  const options: SignOptions = {
    expiresIn: "15m",
  };

  return jwt.sign(
    {
      ...payload,
      tokenPurpose: payload.tokenPurpose ?? "access",
    },
    getAccessSecret(),
    options
  );
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