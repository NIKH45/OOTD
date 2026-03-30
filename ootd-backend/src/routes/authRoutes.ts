import { Router } from "express";
import { login, signup } from "../controllers/authController";

const authRoutes = Router();

// Route layer: map endpoint + HTTP method to a controller function.
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);

export default authRoutes;
