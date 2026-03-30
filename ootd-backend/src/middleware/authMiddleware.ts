import { NextFunction, Request, Response } from "express";
import { TokenVerificationError, verifyToken } from "../utils/jwt";
import { logger } from "../utils/logger";

// Extracts token from "Authorization: Bearer <token>" format.
const extractBearerToken = (authorizationHeader?: string): string => {
  if (!authorizationHeader) {
    throw new TokenVerificationError();
  }

  const [scheme, token, ...rest] = authorizationHeader.trim().split(/\s+/);

  // Reject anything that is not exactly "Bearer <token>".
  if (scheme !== "Bearer" || !token || rest.length > 0) {
    throw new TokenVerificationError();
  }

  return token;
};

// JWT auth middleware that protects private routes.
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (res.locals.requestId as string | undefined) ?? "unknown";

  try {
    const authorizationHeader = req.header("authorization");
    const token = extractBearerToken(authorizationHeader);
    const payload = verifyToken(token);

    // Attach userId to request so protected controllers can use it.
    req.userId = payload.userId;
    next();
  } catch (error) {
    if (error instanceof TokenVerificationError) {
      logger.warn("JWT authentication rejected request", {
        requestId,
        method: req.method,
        path: req.originalUrl,
      });

      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    next(error);
  }
};
