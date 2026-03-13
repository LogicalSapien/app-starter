import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

const rbacLogger = logger.createLogger("RbacService");

// ---------------------------------------------------------------------------
// In-memory permission cache with TTL
// ---------------------------------------------------------------------------

interface CacheEntry {
  permissions: string[];
  cachedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const permissionCache = new Map<string, CacheEntry>();

/**
 * Evict a specific user from the cache, or clear the entire cache.
 */
function invalidateCache(userId?: string): void {
  if (userId) {
    permissionCache.delete(userId);
  } else {
    permissionCache.clear();
  }
}

/**
 * Return cached permissions if still valid, or null.
 */
function getCachedPermissions(userId: string): string[] | null {
  const entry = permissionCache.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    permissionCache.delete(userId);
    return null;
  }
  return entry.permissions;
}

// ---------------------------------------------------------------------------
// Permission queries
// ---------------------------------------------------------------------------

/**
 * Retrieve all permission names for a user via their assigned roles.
 * Results are cached in memory with a 5-minute TTL.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const cached = getCachedPermissions(userId);
  if (cached) {
    rbacLogger.debug("Permissions cache hit", { userId });
    return cached;
  }

  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    select: {
      role: {
        select: {
          rolePermissions: {
            select: {
              permission: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  const permissionSet = new Set<string>();
  for (const ur of userRoles) {
    for (const rp of ur.role.rolePermissions) {
      permissionSet.add(rp.permission.name);
    }
  }

  const permissions = Array.from(permissionSet);

  permissionCache.set(userId, {
    permissions,
    cachedAt: Date.now(),
  });

  rbacLogger.debug("Permissions loaded from DB", {
    userId,
    count: permissions.length,
  });

  return permissions;
}

/**
 * Check if a user possesses a specific permission name.
 */
export async function hasPermission(
  userId: string,
  permissionName: string,
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionName);
}

/**
 * Check if a user has a specific role by name.
 */
export async function hasRole(
  userId: string,
  roleName: string,
): Promise<boolean> {
  const count = await prisma.userRole.count({
    where: {
      userId,
      role: { name: roleName },
    },
  });
  return count > 0;
}

// ---------------------------------------------------------------------------
// Role assignment
// ---------------------------------------------------------------------------

/**
 * Assign a role to a user. No-op if the assignment already exists.
 */
export async function assignRole(
  userId: string,
  roleId: string,
): Promise<void> {
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId, roleId },
    },
    update: {},
    create: { userId, roleId },
  });

  invalidateCache(userId);
  rbacLogger.info("Role assigned", { userId, roleId });
}

/**
 * Remove a role from a user.
 */
export async function removeRole(
  userId: string,
  roleId: string,
): Promise<void> {
  await prisma.userRole.deleteMany({
    where: { userId, roleId },
  });

  invalidateCache(userId);
  rbacLogger.info("Role removed", { userId, roleId });
}

/**
 * Assign the default role(s) to a user (roles where isDefault = true).
 */
export async function assignDefaultRoles(userId: string): Promise<void> {
  const defaultRoles = await prisma.role.findMany({
    where: { isDefault: true },
    select: { id: true },
  });

  if (defaultRoles.length === 0) {
    rbacLogger.warn("No default roles configured");
    return;
  }

  for (const role of defaultRoles) {
    await assignRole(userId, role.id);
  }

  rbacLogger.info("Default roles assigned", {
    userId,
    roles: defaultRoles.map((r) => r.id),
  });
}

// ---------------------------------------------------------------------------
// Role CRUD
// ---------------------------------------------------------------------------

/**
 * List all roles with their associated permissions.
 */
export async function getRoles() {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { userRoles: true },
      },
    },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isDefault: role.isDefault,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    userCount: role._count.userRoles,
    permissions: role.rolePermissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      resource: rp.permission.resource,
      action: rp.permission.action,
    })),
  }));
}

/**
 * Get a single role by ID with its permissions.
 */
export async function getRoleById(roleId: string) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { userRoles: true },
      },
    },
  });

  if (!role) return null;

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isDefault: role.isDefault,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    userCount: role._count.userRoles,
    permissions: role.rolePermissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      resource: rp.permission.resource,
      action: rp.permission.action,
    })),
  };
}

/**
 * Create a new role and optionally attach permissions by ID.
 */
export async function createRole(
  name: string,
  description: string | null,
  permissionIds: string[] = [],
) {
  const role = await prisma.role.create({
    data: {
      name,
      description,
      rolePermissions: {
        create: permissionIds.map((permissionId) => ({
          permissionId,
        })),
      },
    },
    include: {
      rolePermissions: {
        include: { permission: true },
      },
    },
  });

  // Invalidate all caches since a new role may affect any user
  invalidateCache();

  rbacLogger.info("Role created", { roleId: role.id, name });

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isDefault: role.isDefault,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    permissions: role.rolePermissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      resource: rp.permission.resource,
      action: rp.permission.action,
    })),
  };
}

/**
 * Update an existing role.
 */
export async function updateRole(
  roleId: string,
  data: { name?: string; description?: string; isDefault?: boolean },
) {
  const existing = await prisma.role.findUnique({ where: { id: roleId } });
  if (!existing) return null;

  const updated = await prisma.role.update({
    where: { id: roleId },
    data,
    include: {
      rolePermissions: {
        include: { permission: true },
      },
      _count: {
        select: { userRoles: true },
      },
    },
  });

  invalidateCache();
  rbacLogger.info("Role updated", { roleId, name: updated.name });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    isDefault: updated.isDefault,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    userCount: updated._count.userRoles,
    permissions: updated.rolePermissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      resource: rp.permission.resource,
      action: rp.permission.action,
    })),
  };
}

/**
 * Delete a role by ID. All user-role and role-permission relations cascade.
 */
export async function deleteRole(roleId: string): Promise<boolean> {
  const existing = await prisma.role.findUnique({ where: { id: roleId } });
  if (!existing) return false;

  await prisma.role.delete({ where: { id: roleId } });

  invalidateCache();
  rbacLogger.info("Role deleted", { roleId, name: existing.name });

  return true;
}

/**
 * Replace all permissions on a role with a new set.
 */
export async function setRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<boolean> {
  const existing = await prisma.role.findUnique({ where: { id: roleId } });
  if (!existing) return false;

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    ...permissionIds.map((permissionId) =>
      prisma.rolePermission.create({
        data: { roleId, permissionId },
      }),
    ),
  ]);

  invalidateCache();
  rbacLogger.info("Role permissions updated", {
    roleId,
    permissionCount: permissionIds.length,
  });

  return true;
}

/**
 * List all available permissions.
 */
export async function getPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });
}

export default {
  getUserPermissions,
  hasPermission,
  hasRole,
  assignRole,
  removeRole,
  assignDefaultRoles,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
  getPermissions,
};
