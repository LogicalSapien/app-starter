// Initialize configuration
import config, { validateConfig } from "./config/config.js";
validateConfig();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import { requestLogger, errorLogger } from "./middleware/logging.js";
import { csrfProtection } from "./middleware/csrf.js";
import logger from "./utils/logger.js";
import {
  corsOriginFunction,
  configureRateLimit,
  generateBasicHealthResponse,
  generateApiHealthResponse,
  generateDatabaseHealthResponse,
  generateErrorResponse,
  generate404Response,
  logServerStartup,
} from "./utils/server-utils.js";

const app = express();
const PORT = config.port;

// Trust proxy — needed when running behind a reverse proxy (Nginx, load balancer, etc.)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

// CORS configuration — supports multiple origins via FRONTEND_URLS
const corsOptions = {
  origin: corsOriginFunction,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["Content-Length", "X-Total-Count"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Pre-flight requests
app.options("*", cors(corsOptions));

// Rate limiting — configurable via env, can be disabled in dev
const rateLimitConfig = configureRateLimit(
  config.rateLimitEnabled,
  config.rateLimitWindowMs,
  config.rateLimitMax,
);
if (rateLimitConfig) {
  const limiter = rateLimit({
    ...rateLimitConfig,
    handler: (_req, res, _next, options) => {
      res.set("Retry-After", Math.ceil(options.windowMs / 1000).toString());
      return res.status(429).json({ message: options.message });
    },
  });
  app.use("/api/", limiter);
}

// Custom request logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ---------------------------------------------------------------------------
// Health check endpoints (before CSRF so they remain publicly accessible)
// ---------------------------------------------------------------------------

app.get("/health", (_req, res) => {
  const healthResponse = generateBasicHealthResponse();
  res.json(healthResponse);
});

app.get("/api/health", async (_req, res) => {
  const health = await generateApiHealthResponse();
  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get("/api/health/database", async (_req, res) => {
  const dbHealth = await generateDatabaseHealthResponse();
  const statusCode = dbHealth.status === "error" ? 503 : 200;
  res.status(statusCode).json(dbHealth);
});

// ---------------------------------------------------------------------------
// CSRF protection — require X-Requested-With header for state-changing ops
// ---------------------------------------------------------------------------
app.use("/api", csrfProtection);

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error("Unhandled error", {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      origin: req.headers.origin,
    });

    const errorResponse = generateErrorResponse(err, config.isDevelopment());
    res.status(500).json(errorResponse);
  },
);

// 404 handler
app.use("*", (_req, res) => {
  const notFoundResponse = generate404Response();
  res.status(404).json(notFoundResponse);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  logServerStartup(PORT, config.frontendUrls);
});

export default app;
