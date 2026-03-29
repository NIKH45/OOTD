import { Router } from "express";
import { signup } from "../controllers/authController";

const authRoutes = Router();

// Route layer: map endpoint + HTTP method to a controller function.
authRoutes.post("/signup", signup);

export default authRoutes;
