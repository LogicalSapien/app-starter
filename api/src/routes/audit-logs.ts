import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { AuthenticatedRequest } from "../types/index.js";
import auditService from "../services/audit-service.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * GET /api/v1/audit-logs
 * List audit logs with pagination and optional filters (requires audit:read).
 *
 * Query params:
 *   page      - Page number (default 1)
 *   limit     - Items per page (default 50, max 200)
 *   userId    - Filter by user ID
 *   action    - Filter by action (e.g. "user:update")
 *   resource  - Filter by resource (e.g. "user", "role")
 *   dateFrom  - Filter from date (ISO string)
 *   dateTo    - Filter to date (ISO string)
 */
router.get(
  "/",
  authenticateUser,
  requirePermission("audit:read"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 50));

      const filters: {
        userId?: string;
        action?: string;
        resource?: string;
        dateFrom?: Date;
        dateTo?: Date;
      } = {};

      if (req.query.userId) {
        filters.userId = req.query.userId as string;
      }
      if (req.query.action) {
        filters.action = req.query.action as string;
      }
      if (req.query.resource) {
        filters.resource = req.query.resource as string;
      }
      if (req.query.dateFrom) {
        const dateFrom = new Date(req.query.dateFrom as string);
        if (!isNaN(dateFrom.getTime())) {
          filters.dateFrom = dateFrom;
        }
      }
      if (req.query.dateTo) {
        const dateTo = new Date(req.query.dateTo as string);
        if (!isNaN(dateTo.getTime())) {
          filters.dateTo = dateTo;
        }
      }

      const { logs, total } = await auditService.getAuditLogs(page, limit, filters);

      res.json({
        data: logs,
        pagination: {
          page,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error("Error fetching audit logs:", error);
      res.status(500).json({
        error: "Failed to fetch audit logs",
        details: error.message,
      });
    }
  },
);

export default router;
