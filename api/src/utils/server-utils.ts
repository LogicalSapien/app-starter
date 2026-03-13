/**
 * Testable utility functions extracted from src/index.ts for better test coverage.
 */

import config from "../config/config.js";
import logger from "./logger.js";
import prisma from "../config/prisma.js";

/**
 * CORS origin validation function.
 * Supports comma-separated FRONTEND_URLS for multi-origin setups.
 */
export const corsOriginFunction = (
  origin: string | undefined,
  callback: (error: Error | null, allowed?: boolean) => void,
) => {
  const frontendUrls = config.frontendUrls;

  // Allow requests with no origin (mobile apps, curl, server-to-server)
  if (!origin) {
    callback(null, true);
    return;
  }

  if (!frontendUrls) {
    logger.warn("FRONTEND_URLS not set in environment", { origin });
    return callback(
      new Error("FRONTEND_URLS environment variable not configured"),
    );
  }

  // Parse allowed origins (supports comma-separated list)
  const allowedOrigins = frontendUrls.split(",").map((url) => url.trim());

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    logger.warn("CORS blocked origin", {
      origin,
      allowedOrigins,
    });
    callback(new Error("Not allowed by CORS"));
  }
};

/**
 * Basic health check response.
 */
export const generateBasicHealthResponse = () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    uptime: process.uptime(),
  };
};

/**
 * Comprehensive API health check including database connectivity.
 */
export const generateApiHealthResponse = async () => {
  const startTime = Date.now();
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "unknown",
    environment: config.nodeEnv,
    services: {} as any,
    performance: {} as any,
  };

  // Database connectivity check
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = {
      status: "connected",
      responseTime: Date.now() - startTime,
    };
  } catch (_error) {
    health.services.database = {
      status: "error",
      error: "Database connection failed",
    };
    health.status = "degraded";
  }

  // Memory usage check
  const memory = process.memoryUsage();
  health.performance.memory = {
    used: Math.round(memory.heapUsed / 1024 / 1024) + "MB",
    total: Math.round(memory.heapTotal / 1024 / 1024) + "MB",
    usage: Math.round((memory.heapUsed / memory.heapTotal) * 100) + "%",
  };

  health.performance.responseTime = Date.now() - startTime + "ms";

  return health;
};

/**
 * Database-specific health check with detailed diagnostics.
 */
export const generateDatabaseHealthResponse = async () => {
  const startTime = Date.now();
  const dbHealth = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: {} as any,
    tests: {} as any,
  };

  try {
    // Basic connection test
    const connectionStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const connectionTime = Date.now() - connectionStart;

    dbHealth.tests.connection = {
      status: "passed",
      responseTime: connectionTime + "ms",
    };

    // Database version
    const dbResult = (await prisma.$queryRaw`SELECT version()`) as any[];
    dbHealth.database.version = dbResult[0]?.version || "unknown";

    dbHealth.database.url = config.databaseUrl ? "configured" : "missing";

    // Table count check
    try {
      const tables = (await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `) as any[];

      dbHealth.tests.queryExecution = {
        status: "passed",
        tableCount: parseInt(tables[0]?.count || "0"),
      };
    } catch (_queryError) {
      dbHealth.tests.queryExecution = {
        status: "failed",
        error: "Query execution test failed",
      };
      dbHealth.status = "degraded";
    }
  } catch (_error) {
    dbHealth.status = "error";
    dbHealth.tests.connection = {
      status: "failed",
      error: "Database connection failed",
    };
  }

  dbHealth.tests.responseTime = Date.now() - startTime + "ms";

  return dbHealth;
};

/**
 * Error response generator.
 */
export const generateErrorResponse = (error: Error, isDevelopment: boolean) => {
  return {
    error: "Internal server error",
    message: isDevelopment ? error.message : "Something went wrong",
  };
};

/**
 * 404 response generator.
 */
export const generate404Response = () => {
  return {
    error: "Not found",
    message: "The requested resource was not found",
  };
};

/**
 * Rate limiting configuration.
 * Returns null when rate limiting is disabled (e.g., in development).
 */
export const configureRateLimit = (
  enabled: boolean,
  windowMs: number,
  max: number,
) => {
  if (enabled) {
    logger.info("HTTP rate limiter enabled", {
      windowMs,
      max,
      environment: config.nodeEnv,
    });
    return {
      windowMs,
      max,
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    };
  } else {
    logger.info("HTTP rate limiter disabled", { environment: config.nodeEnv });
    return null;
  }
};

/**
 * Server startup logging.
 */
export const logServerStartup = (port: number, frontendUrls?: string) => {
  if (!frontendUrls) {
    logger.warn(
      "FRONTEND_URLS environment variable not set - CORS will be restrictive",
    );
  }

  const allowedOrigins = frontendUrls
    ? frontendUrls.split(",").map((url) => url.trim())
    : [];

  logger.info("Server started successfully", {
    port,
    environment: config.nodeEnv,
    logLevel: config.logLevel,
    corsOrigins: allowedOrigins.length > 0 ? allowedOrigins : "not configured",
  });
};
