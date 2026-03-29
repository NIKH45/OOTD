"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authRoutes = (0, express_1.Router)();
// Route layer: map endpoint + HTTP method to a controller function.
authRoutes.post("/signup", authController_1.signup);
exports.default = authRoutes;
//# sourceMappingURL=authRoutes.js.map