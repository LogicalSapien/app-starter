import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

/**
 * CSRF Protection Middleware
 *
 * For JWT-based APIs, CSRF is less of a concern since:
 * 1. JWTs are sent via Authorization header (not cookies)
 * 2. Authorization headers cannot be set by simple form POSTs from other domains
 * 3. CORS prevents unauthorized origins from making requests
 *
 * However, we add an additional layer by requiring a custom header
 * for all state-changing operations (POST, PUT, PATCH, DELETE).
 *
 * This prevents simple form-based CSRF attacks and ensures requests
 * are coming from legitimate AJAX/fetch calls from our frontend.
 */

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
const REQUIRED_HEADER = "X-Requested-With";
const REQUIRED_VALUE = "XMLHttpRequest";

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Skip CSRF check for safe methods
  if (SAFE_METHODS.includes(req.method)) {
    next();
    return;
  }

  // Skip CSRF check for health check endpoints
  if (req.path.startsWith("/health") || req.path.startsWith("/api/health")) {
    next();
    return;
  }

  // Check for required custom header
  const requestedWith = req.headers[REQUIRED_HEADER.toLowerCase()];

  if (!requestedWith || requestedWith !== REQUIRED_VALUE) {
    logger.warn(
      "CSRF check failed - missing or invalid X-Requested-With header",
      {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        headers: Object.keys(req.headers),
      },
    );

    res.status(403).json({
      error: "CSRF validation failed",
      message: "Missing required security header for state-changing operations",
    });
    return;
  }

  next();
};

/**
 * Alternative: Origin/Referer validation.
 * Can be used in addition to or instead of the custom header check.
 */
export const validateOrigin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Skip for safe methods
  if (SAFE_METHODS.includes(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = process.env.FRONTEND_URLS?.split(",") || [];

  if (!origin) {
    // Allow requests without origin (could be from same origin or server-to-server)
    next();
    return;
  }

  const isAllowed = allowedOrigins.some((allowed) => {
    try {
      const originUrl = new URL(origin as string);
      const allowedUrl = new URL(allowed);
      return originUrl.origin === allowedUrl.origin;
    } catch {
      return false;
    }
  });

  if (!isAllowed) {
    logger.warn("Origin validation failed", {
      origin,
      allowedOrigins,
      method: req.method,
      path: req.path,
    });

    res.status(403).json({
      error: "Invalid origin",
      message: "Request origin not allowed",
    });
    return;
  }

  next();
};
