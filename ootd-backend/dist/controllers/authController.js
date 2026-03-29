"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const authService_1 = require("../services/authService");
const logger_1 = require("../utils/logger");
// Controller layer:
// 1) reads HTTP request data
// 2) calls service/business logic
// 3) converts domain errors into API status codes
const signup = async (req, res, next) => {
    const requestId = res.locals.requestId ?? "unknown";
    try {
        // Type assertion here tells TypeScript what shape we expect in req.body.
        const payload = req.body;
        const result = await (0, authService_1.signupUser)(payload);
        logger_1.logger.info("Signup succeeded", {
            requestId,
            userId: result.user.id,
            email: result.user.email,
        });
        res.status(201).json(result);
    }
    catch (error) {
        // Validation errors are client-side input issues -> 400 Bad Request.
        if (error instanceof authService_1.SignupValidationError) {
            logger_1.logger.warn("Signup validation failed", {
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
        if (error instanceof authService_1.DuplicateEmailError) {
            logger_1.logger.warn("Signup failed due to duplicate email", { requestId });
            res.status(409).json({
                message: error.message,
            });
            return;
        }
        // Unknown errors are passed to centralized error middleware.
        logger_1.logger.error("Unexpected signup controller error", {
            requestId,
            error,
        });
        next(error);
    }
};
exports.signup = signup;
//# sourceMappingURL=authController.js.map