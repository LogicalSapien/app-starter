import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import rbacService from "../services/rbac-service.js";
import logger from "../utils/logger.js";

const rbacLogger = logger.createLogger("RbacMiddleware");

/**
 * Express middleware factory that checks whether the authenticated user has the
 * named permission. Must be placed AFTER the auth middleware so that
 * `req.user` is populated.
 *
 * Usage:
 *   router.get("/", authenticateUser, requirePermission("user:read"), handler);
 */
export function requirePermission(permissionName: string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const allowed = await rbacService.hasPermission(userId, permissionName);

      if (!allowed) {
        rbacLogger.warn("Permission denied", {
          userId,
          permission: permissionName,
          method: req.method,
          path: req.path,
        });
        res.status(403).json({
          error: "Forbidden",
          message: `Missing required permission: ${permissionName}`,
        });
        return;
      }

      next();
    } catch (error: any) {
      rbacLogger.error("Permission check failed", {
        error: error.message,
        userId: req.user?.id,
        permission: permissionName,
      });
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}

/**
 * Express middleware factory that checks whether the authenticated user holds a
 * specific role by name.
 *
 * Usage:
 *   router.post("/", authenticateUser, requireRole("admin"), handler);
 */
export function requireRole(roleName: string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const allowed = await rbacService.hasRole(userId, roleName);

      if (!allowed) {
        rbacLogger.warn("Role denied", {
          userId,
          role: roleName,
          method: req.method,
          path: req.path,
        });
        res.status(403).json({
          error: "Forbidden",
          message: `Missing required role: ${roleName}`,
        });
        return;
      }

      next();
    } catch (error: any) {
      rbacLogger.error("Role check failed", {
        error: error.message,
        userId: req.user?.id,
        role: roleName,
      });
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}
