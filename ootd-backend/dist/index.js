"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3001;
// Global middlewares applied before routes.
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Lightweight request logging with a requestId for easy traceability.
app.use((req, res, next) => {
    const startedAt = Date.now();
    const requestId = req.header("x-request-id") || (0, crypto_1.randomUUID)();
    res.locals.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    logger_1.logger.info("Incoming request", {
        requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
    });
    res.on("finish", () => {
        logger_1.logger.info("Request completed", {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });
    next();
});
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
// Mount all auth endpoints under /auth (example: POST /auth/signup).
app.use("/auth", authRoutes_1.default);
// Centralized error handler to keep controllers focused on domain logic.
app.use((error, req, res, _next) => {
    const message = error instanceof Error ? error.message : "Internal server error";
    const requestId = res.locals.requestId ?? "unknown";
    logger_1.logger.error("Unhandled application error", {
        requestId,
        method: req.method,
        path: req.originalUrl,
        error,
    });
    res.status(500).json({ message });
});
app.listen(port, () => {
    logger_1.logger.info("Server started", { port });
});
//# sourceMappingURL=index.js.map