declare namespace Express {
  export interface Request {
    // Set by JWT auth middleware after successful token verification.
    userId?: string;
  }
}
