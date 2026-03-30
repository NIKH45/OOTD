import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "./logger";

// Minimal data we embed inside JWT token.
export interface AuthTokenPayload {
  userId: string;
  email: string;
}

// Custom error class used by auth middleware to return consistent 401 responses.
export class TokenVerificationError extends Error {
  constructor() {
    super("Invalid or expired token");
    this.name = "TokenVerificationError";
  }
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

// Verifies JWT and returns a validated payload shape for downstream middleware.
export const verifyToken = (token: string): AuthTokenPayload => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // jwt.verify can return a string or object; we only accept the expected object shape.
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.userId !== "string" ||
      typeof decoded.email !== "string"
    ) {
      throw new TokenVerificationError();
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    logger.warn("Token verification failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    throw new TokenVerificationError();
  }
};
