"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupUser = exports.DuplicateEmailError = exports.SignupValidationError = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
// Service layer owns business rules and DB interaction.
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
// Small helper to avoid printing full email in logs.
const maskEmail = (email) => {
    const [localPart, domainPart] = email.split("@");
    if (!domainPart) {
        return "***";
    }
    if (localPart.length <= 2) {
        return `**@${domainPart}`;
    }
    return `${localPart.slice(0, 2)}***@${domainPart}`;
};
// Custom error type for input validation failures.
class SignupValidationError extends Error {
    constructor(errors) {
        super("Validation failed");
        this.errors = errors;
        this.name = "SignupValidationError";
    }
}
exports.SignupValidationError = SignupValidationError;
// Custom error type for unique-email conflict.
class DuplicateEmailError extends Error {
    constructor() {
        super("Email is already registered");
        this.name = "DuplicateEmailError";
    }
}
exports.DuplicateEmailError = DuplicateEmailError;
// Basic email format check.
const isEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
// Validation happens before any DB operation.
const validateSignupInput = (input) => {
    const errors = [];
    if (!input || typeof input !== "object") {
        throw new SignupValidationError(["Request body must be a valid JSON object"]);
    }
    if (!input.email || typeof input.email !== "string" || !isEmail(input.email.trim())) {
        errors.push("Email must be a valid format");
    }
    if (!input.password || typeof input.password !== "string" || input.password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }
    if (!input.username || typeof input.username !== "string" || input.username.trim().length === 0) {
        errors.push("Username is required");
    }
    if (!input.gender || typeof input.gender !== "string" || input.gender.trim().length === 0) {
        errors.push("Gender is required");
    }
    if (!Number.isInteger(input.age) || input.age <= 0) {
        errors.push("Age must be a positive integer");
    }
    if (!Number.isFinite(input.height) || input.height <= 0) {
        errors.push("Height must be a positive number");
    }
    if (!Number.isFinite(input.weight) || input.weight <= 0) {
        errors.push("Weight must be a positive number");
    }
    if (!input.location || typeof input.location !== "string" || input.location.trim().length === 0) {
        errors.push("Location is required");
    }
    if (errors.length > 0) {
        throw new SignupValidationError(errors);
    }
};
// Map Prisma-specific DB errors to domain-friendly errors.
const mapKnownPrismaError = (error) => {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002") {
        return new DuplicateEmailError();
    }
    return error instanceof Error ? error : new Error("Unexpected signup error");
};
// Core signup workflow:
// 1) validate input
// 2) normalize and check duplicate email
// 3) hash password
// 4) create user
// 5) generate JWT
const signupUser = async (input) => {
    validateSignupInput(input);
    const normalizedEmail = input.email.trim().toLowerCase();
    const emailForLogs = maskEmail(normalizedEmail);
    logger_1.logger.info("Signup attempt received", { email: emailForLogs });
    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
    });
    if (existingUser) {
        logger_1.logger.warn("Duplicate signup attempt blocked", { email: emailForLogs });
        throw new DuplicateEmailError();
    }
    const hashedPassword = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
    try {
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                username: input.username.trim(),
                gender: input.gender.trim(),
                age: input.age,
                height: input.height,
                weight: input.weight,
                location: input.location.trim(),
            },
            // Password is deliberately excluded from selection for API safety.
            select: {
                id: true,
                email: true,
                username: true,
                gender: true,
                age: true,
                height: true,
                weight: true,
                location: true,
                createdAt: true,
            },
        });
        const payload = {
            userId: user.id,
            email: user.email,
        };
        const token = (0, jwt_1.generateToken)(payload);
        logger_1.logger.info("User created from signup", {
            userId: user.id,
            email: emailForLogs,
        });
        return { token, user };
    }
    catch (error) {
        logger_1.logger.error("Signup persistence failed", {
            email: emailForLogs,
            error,
        });
        throw mapKnownPrismaError(error);
    }
};
exports.signupUser = signupUser;
//# sourceMappingURL=authService.js.map