import { NextFunction, Request, Response } from "express";
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  LoginInput,
  LoginValidationError,
  SignupInput,
  SignupValidationError,
  loginUser,
  signupUser,
} from "../services/authService";
import { logger } from "../utils/logger";

// Controller layer:
// 1) reads HTTP request data
// 2) calls service/business logic
// 3) converts domain errors into API status codes
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const requestId = (res.locals.requestId as string | undefined) ?? "unknown";

  try {
    // Type assertion here tells TypeScript what shape we expect in req.body.
    const payload = req.body as SignupInput;
    const result = await signupUser(payload);

    logger.info("Signup succeeded", {
      requestId,
      userId: result.user.id,
      email: result.user.email,
    });

    res.status(201).json(result);
  } catch (error) {
    // Validation errors are client-side input issues -> 400 Bad Request.
    if (error instanceof SignupValidationError) {
      logger.warn("Signup validation failed", {
        requestId,
        errors: error.errors,
      });

      res.status(400).json({
        message: error.message,
        errors: error.errors,
      });
      return;
    }

    // Duplicate email is a conflict with existing data -> 409 Conflict.
    if (error instanceof DuplicateEmailError) {
      logger.warn("Signup failed due to duplicate email", { requestId });

      res.status(409).json({
        message: error.message,
      });
      return;
    }

    // Unknown errors are passed to centralized error middleware.
    logger.error("Unexpected signup controller error", {
      requestId,
      error,
    });

    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const requestId = (res.locals.requestId as string | undefined) ?? "unknown";

  try {
    const payload = req.body as LoginInput;
    const result = await loginUser(payload);

    logger.info("Login response sent", {
      requestId,
      userId: result.user.id,
      email: result.user.email,
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof LoginValidationError) {
      logger.warn("Login validation failed", {
        requestId,
        errors: error.errors,
      });

      res.status(400).json({
        message: error.message,
        errors: error.errors,
      });
      return;
    }

    if (error instanceof InvalidCredentialsError) {
      logger.warn("Login failed due to invalid credentials", { requestId });

      res.status(401).json({
        message: error.message,
      });
      return;
    }

    logger.error("Unexpected login controller error", {
      requestId,
      error,
    });

    next(error);
  }
};
