declare global {
  namespace Express {
    interface Request {
      // Set by JWT auth middleware after successful token verification.
      userId?: string;
    }
  }
}

export {};
