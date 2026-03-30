import { Request, Response, Router } from "express";
import { authenticateJWT } from "../middleware/authMiddleware";

const protectedRoutes = Router();

// Example protected endpoint: only accessible with a valid Bearer token.
protectedRoutes.get("/user/profile", authenticateJWT, (req: Request, res: Response) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    userId: req.userId,
  });
});

// Example protected endpoint: only accessible with a valid Bearer token.
protectedRoutes.post("/outfit/upload", authenticateJWT, (req: Request, res: Response) => {
  res.status(200).json({
    message: "Outfit upload authorized",
    userId: req.userId,
  });
});

export default protectedRoutes;
