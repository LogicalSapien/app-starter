import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { AuthenticatedRequest } from "../types/index.js";
import userService from "../services/user-service.js";
import auditService from "../services/audit-service.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * GET /api/v1/users
 * List all users with pagination (requires user:read permission).
 */
router.get(
  "/",
  authenticateUser,
  requirePermission("user:read"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const search = (req.query.search as string) || undefined;

      const { users, total } = await userService.findAll(page, limit, search);

      res.json({
        data: users,
        pagination: {
          page,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error("Error fetching users:", error);
      res.status(500).json({
        error: "Failed to fetch users",
        details: error.message,
      });
    }
  },
);

/**
 * GET /api/v1/users/:id
 * Get a user by ID (requires user:read permission).
 */
router.get(
  "/:id",
  authenticateUser,
  requirePermission("user:read"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ data: user });
    } catch (error: any) {
      logger.error("Error fetching user:", error);
      res.status(500).json({
        error: "Failed to fetch user",
        details: error.message,
      });
    }
  },
);

/**
 * PUT /api/v1/users/:id
 * Update a user by ID (requires user:update permission).
 */
router.put(
  "/:id",
  authenticateUser,
  requirePermission("user:update"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, avatarUrl } = req.body;

      const updated = await userService.update(id, {
        email,
        firstName,
        lastName,
        avatarUrl,
      });

      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      await auditService.log(
        req.user?.id ?? null,
        "user:update",
        "user",
        id,
        { fields: Object.keys(req.body) },
        req,
      );

      res.json({
        message: "User updated successfully",
        data: updated,
      });
    } catch (error: any) {
      logger.error("Error updating user:", error);
      res.status(500).json({
        error: "Failed to update user",
        details: error.message,
      });
    }
  },
);

/**
 * DELETE /api/v1/users/:id
 * Soft-delete a user (requires user:delete permission).
 */
router.delete(
  "/:id",
  authenticateUser,
  requirePermission("user:delete"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      const deleted = await userService.softDelete(id);

      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      await auditService.log(
        req.user?.id ?? null,
        "user:delete",
        "user",
        id,
        null,
        req,
      );

      res.json({
        message: "User deactivated successfully",
        data: deleted,
      });
    } catch (error: any) {
      logger.error("Error deleting user:", error);
      res.status(500).json({
        error: "Failed to delete user",
        details: error.message,
      });
    }
  },
);

export default router;
