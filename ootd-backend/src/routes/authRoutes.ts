import { Router } from "express";
import { completeProfile, login, signup } from "../controllers/authController";
import { authenticateJWT } from "../middleware/authMiddleware";

const authRoutes = Router();

// Route layer: map endpoint + HTTP method to a controller function.
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/profile", authenticateJWT, completeProfile);

export default authRoutes;
