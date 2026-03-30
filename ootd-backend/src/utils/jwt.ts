import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "./logger";

// Minimal data we embed inside JWT token.
export interface AuthTokenPayload {
  userId: string;
  email: string;
}

// Token utility keeps JWT logic in one place for reuse.
export const generateToken = (
  payload: AuthTokenPayload,
  expiresInOverride?: SignOptions["expiresIn"]
): string => {
  // JWT_SECRET must exist in environment variables.
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  // Expiry can be configured via env, default is 7 days.
  const expiresIn =
    expiresInOverride || (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  logger.debug("Generating JWT token", { userId: payload.userId, expiresIn });

  return jwt.sign(payload, jwtSecret, { expiresIn });
};
