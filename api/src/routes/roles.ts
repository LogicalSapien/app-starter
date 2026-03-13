import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { AuthenticatedRequest } from "../types/index.js";
import rbacService from "../services/rbac-service.js";
import auditService from "../services/audit-service.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * GET /api/v1/roles
 * List all roles with their permissions (requires role:read).
 */
router.get(
  "/",
  authenticateUser,
  requirePermission("role:read"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const roles = await rbacService.getRoles();
      res.json({ data: roles });
    } catch (error: any) {
      logger.error("Error fetching roles:", error);
      res.status(500).json({
        error: "Failed to fetch roles",
        details: error.message,
      });
    }
  },
);

/**
 * GET /api/v1/roles/permissions
 * List all available permissions (requires role:read).
 */
router.get(
  "/permissions",
  authenticateUser,
  requirePermission("role:read"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const permissions = await rbacService.getPermissions();
      res.json({ data: permissions });
    } catch (error: any) {
      logger.error("Error fetching permissions:", error);
      res.status(500).json({
        error: "Failed to fetch permissions",
        details: error.message,
      });
    }
  },
);

/**
 * GET /api/v1/roles/:id
 * Get a single role by ID (requires role:read).
 */
router.get(
  "/:id",
  authenticateUser,
  requirePermission("role:read"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const role = await rbacService.getRoleById(id);

      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      res.json({ data: role });
    } catch (error: any) {
      logger.error("Error fetching role:", error);
      res.status(500).json({
        error: "Failed to fetch role",
        details: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/roles
 * Create a new role (requires role:create).
 */
router.post(
  "/",
  authenticateUser,
  requirePermission("role:create"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description, permissionIds } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Role name is required" });
      }

      const role = await rbacService.createRole(
        name,
        description ?? null,
        permissionIds ?? [],
      );

      await auditService.log(
        req.user?.id ?? null,
        "role:create",
        "role",
        role.id,
        { name, permissionCount: permissionIds?.length ?? 0 },
        req,
      );

      res.status(201).json({
        message: "Role created successfully",
        data: role,
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "A role with that name already exists" });
      }
      logger.error("Error creating role:", error);
      res.status(500).json({
        error: "Failed to create role",
        details: error.message,
      });
    }
  },
);

/**
 * PUT /api/v1/roles/:id
 * Update a role (requires role:update).
 */
router.put(
  "/:id",
  authenticateUser,
  requirePermission("role:update"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { name, description, isDefault } = req.body;

      const updated = await rbacService.updateRole(id, {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isDefault !== undefined && { isDefault }),
      });

      if (!updated) {
        return res.status(404).json({ error: "Role not found" });
      }

      await auditService.log(
        req.user?.id ?? null,
        "role:update",
        "role",
        id,
        { fields: Object.keys(req.body) },
        req,
      );

      res.json({
        message: "Role updated successfully",
        data: updated,
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "A role with that name already exists" });
      }
      logger.error("Error updating role:", error);
      res.status(500).json({
        error: "Failed to update role",
        details: error.message,
      });
    }
  },
);

/**
 * DELETE /api/v1/roles/:id
 * Delete a role (requires role:delete).
 */
router.delete(
  "/:id",
  authenticateUser,
  requirePermission("role:delete"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      const deleted = await rbacService.deleteRole(id);

      if (!deleted) {
        return res.status(404).json({ error: "Role not found" });
      }

      await auditService.log(
        req.user?.id ?? null,
        "role:delete",
        "role",
        id,
        null,
        req,
      );

      res.json({ message: "Role deleted successfully" });
    } catch (error: any) {
      logger.error("Error deleting role:", error);
      res.status(500).json({
        error: "Failed to delete role",
        details: error.message,
      });
    }
  },
);

/**
 * POST /api/v1/roles/:id/permissions
 * Replace all permissions on a role (requires role:update).
 * Body: { permissionIds: string[] }
 */
router.post(
  "/:id/permissions",
  authenticateUser,
  requirePermission("role:update"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return res
          .status(400)
          .json({ error: "permissionIds must be an array of permission IDs" });
      }

      const success = await rbacService.setRolePermissions(id, permissionIds);

      if (!success) {
        return res.status(404).json({ error: "Role not found" });
      }

      await auditService.log(
        req.user?.id ?? null,
        "role:update_permissions",
        "role",
        id,
        { permissionIds },
        req,
      );

      // Return the updated role
      const updatedRole = await rbacService.getRoleById(id);

      res.json({
        message: "Role permissions updated successfully",
        data: updatedRole,
      });
    } catch (error: any) {
      logger.error("Error updating role permissions:", error);
      res.status(500).json({
        error: "Failed to update role permissions",
        details: error.message,
      });
    }
  },
);

export default router;
