import { Request } from "express";

/**
 * Express Request extended with an authenticated Supabase user.
 */
export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response envelope.
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// RBAC Types
// ---------------------------------------------------------------------------

/**
 * Permission actions mirror the Prisma PermissionAction enum.
 */
export enum PermissionAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  MANAGE = "MANAGE",
}

/**
 * A single permission record.
 */
export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: PermissionAction;
  createdAt: Date;
}

/**
 * A role with its associated permissions.
 */
export interface Role {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: Permission[];
}

/**
 * A user-role assignment record.
 */
export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
}

/**
 * An audit log entry.
 */
export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
