"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
// Token utility keeps JWT logic in one place for reuse.
const generateToken = (payload) => {
    // JWT_SECRET must exist in environment variables.
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
    }
    // Expiry can be configured via env, default is 7 days.
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d");
    logger_1.logger.debug("Generating JWT token", { userId: payload.userId, expiresIn });
    return jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn });
};
exports.generateToken = generateToken;
//# sourceMappingURL=jwt.js.map