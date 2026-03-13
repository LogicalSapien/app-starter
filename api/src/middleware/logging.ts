import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

/**
 * Express middleware that records inbound requests and their latency using the shared logger.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  // Log the request at DEBUG level
  logger.debug(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.get("User-Agent"),
    ip: req.ip || (req.connection as any)?.remoteAddress,
  });

  // Override res.end to log response timing
  const originalEnd = res.end.bind(res);
  (res as any).end = function (chunk: any, encoding?: any) {
    const duration = Date.now() - start;

    // Log at HTTP level for all completed requests
    logger.http(req.method, req.path, res.statusCode, duration);

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Express error-handling middleware that captures request context before delegating.
 */
export const errorLogger = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error("Request error", {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
  });

  next(err);
};
