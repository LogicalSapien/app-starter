import { Request } from "express";
import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

const auditLogger = logger.createLogger("AuditService");

/**
 * Filters accepted by the audit log query.
 */
interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Write an audit log entry. Extracts IP and User-Agent from the request when
 * provided. Failures are logged but never thrown so audit logging cannot break
 * the caller's flow.
 */
export async function log(
  userId: string | null,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  req?: Request,
): Promise<void> {
  try {
    const ipAddress = req
      ? (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        req.ip ??
        null
      : null;

    const userAgent = req
      ? (req.headers["user-agent"] ?? null)
      : null;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId: resourceId ?? null,
        details: details ?? undefined,
        ipAddress,
        userAgent: typeof userAgent === "string" ? userAgent : null,
      },
    });

    auditLogger.debug("Audit entry created", { userId, action, resource, resourceId });
  } catch (error: any) {
    auditLogger.error("Failed to write audit log", {
      error: error.message,
      userId,
      action,
      resource,
    });
  }
}

/**
 * Retrieve paginated audit logs with optional filters.
 */
export async function getAuditLogs(
  page: number = 1,
  limit: number = 50,
  filters?: AuditLogFilters,
): Promise<{ logs: any[]; total: number }> {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters?.userId) {
    where.userId = filters.userId;
  }
  if (filters?.action) {
    where.action = filters.action;
  }
  if (filters?.resource) {
    where.resource = filters.resource;
  }
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.createdAt.lte = filters.dateTo;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  auditLogger.debug("getAuditLogs", { page, limit, total });

  return { logs, total };
}

export default {
  log,
  getAuditLogs,
};
