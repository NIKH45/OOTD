import bcrypt from "bcrypt";
import { Prisma, PrismaClient } from "@prisma/client";
import { SignOptions } from "jsonwebtoken";
import { AuthTokenPayload, generateToken } from "../utils/jwt";
import { logger } from "../utils/logger";

// Service layer owns business rules and DB interaction.
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Small helper to avoid printing full email in logs.
const maskEmail = (email: string): string => {
  const [localPart, domainPart] = email.split("@");
  if (!domainPart) {
    return "***";
  }

  if (localPart.length <= 2) {
    return `**@${domainPart}`;
  }

  return `${localPart.slice(0, 2)}***@${domainPart}`;
};

// Input contract for signup operation.
export interface SignupInput {
  email: string;
  password: string;
  username: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  location: string;
}

// Response-safe user shape (intentionally excludes password).
export interface SafeUser {
  id: string;
  email: string;
  username: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  location: string;
  createdAt: Date;
}

// Service result returned to the controller.
export interface SignupResponse {
  token: string;
  user: SafeUser;
}

// Input contract for login operation.
export interface LoginInput {
  email: string;
  password: string;
}

// Service result for login endpoint.
export interface LoginResponse {
  token: string;
  user: SafeUser;
}

// Custom error type for input validation failures.
export class SignupValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super("Validation failed");
    this.name = "SignupValidationError";
  }
}

// Custom error type for unique-email conflict.
export class DuplicateEmailError extends Error {
  constructor() {
    super("Email is already registered");
    this.name = "DuplicateEmailError";
  }
}

// Custom error type for login input validation failures.
export class LoginValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super("Validation failed");
    this.name = "LoginValidationError";
  }
}

// Generic auth failure error to avoid leaking whether email or password was wrong.
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

// Basic email format check.
const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

// Validation happens before any DB operation.
const validateSignupInput = (input: SignupInput): void => {
  const errors: string[] = [];

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

// Login validation keeps requirements minimal and explicit.
const validateLoginInput = (input: LoginInput): void => {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    throw new LoginValidationError(["Request body must be a valid JSON object"]);
  }

  if (!input.email || typeof input.email !== "string" || !isEmail(input.email.trim())) {
    errors.push("Email must be a valid format");
  }

  if (!input.password || typeof input.password !== "string" || input.password.trim().length === 0) {
    errors.push("Password must not be empty");
  }

  if (errors.length > 0) {
    throw new LoginValidationError(errors);
  }
};

// Map Prisma-specific DB errors to domain-friendly errors.
const mapKnownPrismaError = (error: unknown): Error => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
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
export const signupUser = async (input: SignupInput): Promise<SignupResponse> => {
  validateSignupInput(input);

  const normalizedEmail = input.email.trim().toLowerCase();
  const emailForLogs = maskEmail(normalizedEmail);

  logger.info("Signup attempt received", { email: emailForLogs });

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    logger.warn("Duplicate signup attempt blocked", { email: emailForLogs });
    throw new DuplicateEmailError();
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

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

    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = generateToken(payload);

    logger.info("User created from signup", {
      userId: user.id,
      email: emailForLogs,
    });

    return { token, user };
  } catch (error) {
    logger.error("Signup persistence failed", {
      email: emailForLogs,
      error,
    });

    throw mapKnownPrismaError(error);
  }
};

// Core login workflow:
// 1) validate input
// 2) find user by email
// 3) compare password using bcrypt.compare
// 4) generate short-lived JWT
// 5) return safe user (without password)
export const loginUser = async (input: LoginInput): Promise<LoginResponse> => {
  validateLoginInput(input);

  const normalizedEmail = input.email.trim().toLowerCase();
  const emailForLogs = maskEmail(normalizedEmail);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      password: true,
      username: true,
      gender: true,
      age: true,
      height: true,
      weight: true,
      location: true,
      createdAt: true,
    },
  });

  if (!user) {
    logger.warn("Failed login attempt: user not found", { email: emailForLogs });
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    logger.warn("Failed login attempt: incorrect password", {
      userId: user.id,
      email: emailForLogs,
    });
    throw new InvalidCredentialsError();
  }

  // Login token expiry is intentionally short for better security.
  const loginTokenExpiry = (process.env.JWT_LOGIN_EXPIRES_IN || "1h") as SignOptions["expiresIn"];
  const token = generateToken(
    {
      userId: user.id,
      email: user.email,
    },
    loginTokenExpiry
  );

  // Remove password before returning user object.
  const { password: _password, ...safeUser } = user;

  logger.info("Login succeeded", {
    userId: safeUser.id,
    email: emailForLogs,
  });

  return { token, user: safeUser };
};
