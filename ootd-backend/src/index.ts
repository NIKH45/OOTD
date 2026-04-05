import cors, { CorsOptions } from "cors";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const isDevelopment = process.env.NODE_ENV !== "production";
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // In local/dev allow all origins to prevent CORS blocking during setup.
    if (isDevelopment) {
      callback(null, true);
      return;
    }

    // In production, enforce explicit allow-list from env.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    logger.warn("CORS blocked request origin", { origin });
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  optionsSuccessStatus: 200,
};

// Global middlewares applied before routes.
app.use(cors(corsOptions));
app.options(/^.*$/, cors(corsOptions));
app.use(express.json());

// Lightweight request logging with a requestId for easy traceability.
app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();
  const requestId = req.header("x-request-id") || randomUUID();

  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  // Debug logging for auth requests. Password values are redacted.
  if (req.originalUrl.includes("/auth") && req.body && typeof req.body === "object") {
    const redactedBody = {
      ...req.body,
      password: typeof req.body.password === "string" ? "[REDACTED]" : req.body.password,
    };

    logger.info("Auth request body", {
      requestId,
      path: req.originalUrl,
      body: redactedBody,
    });
  }

  logger.info("Incoming request", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on("finish", () => {
    logger.info("Request completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Mount all auth endpoints under /auth (example: POST /auth/signup).
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

// Mount protected sample endpoints that require JWT middleware.
app.use("/", protectedRoutes);

// Centralized error handler to keep controllers focused on domain logic.
app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const requestId = (res.locals.requestId as string | undefined) ?? "unknown";

  logger.error("Unhandled application error", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    error,
  });

  res.status(500).json({ message });
});

app.listen(port, () => {
  logger.info("Server started", { port });
});
