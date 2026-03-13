import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

const userLogger = logger.createLogger("UserService");

/**
 * Shape returned by user queries that include role information.
 */
interface UserWithRoles {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roles: { id: string; name: string }[];
}

/**
 * Selects used for consistent user queries.
 */
const userSelectWithRoles = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    select: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

/**
 * Transform raw Prisma result into a flat UserWithRoles shape.
 */
function toUserWithRoles(raw: any): UserWithRoles {
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    avatarUrl: raw.avatarUrl,
    isActive: raw.isActive,
    lastLoginAt: raw.lastLoginAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    roles: raw.userRoles?.map((ur: any) => ur.role) ?? [],
  };
}

/**
 * Find all users with pagination and optional search.
 */
export async function findAll(
  page: number = 1,
  limit: number = 20,
  search?: string,
): Promise<{ users: UserWithRoles[]; total: number }> {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: userSelectWithRoles,
    }),
    prisma.user.count({ where }),
  ]);

  userLogger.debug("findAll", { page, limit, search, total });

  return {
    users: users.map(toUserWithRoles),
    total,
  };
}

/**
 * Find a single user by ID, including their roles.
 */
export async function findById(id: string): Promise<UserWithRoles | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelectWithRoles,
  });

  if (!user) return null;

  return toUserWithRoles(user);
}

/**
 * Update a user by ID. Only provided fields are updated.
 */
export async function update(
  id: string,
  data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    isActive?: boolean;
    lastLoginAt?: Date;
  },
): Promise<UserWithRoles | null> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return null;

  const updateData: any = {};
  if (data.email !== undefined) updateData.email = data.email;
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.lastLoginAt !== undefined) updateData.lastLoginAt = data.lastLoginAt;

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelectWithRoles,
  });

  userLogger.info(`User updated: ${updated.email}`);
  return toUserWithRoles(updated);
}

/**
 * Soft-delete a user by setting isActive to false.
 */
export async function softDelete(id: string): Promise<UserWithRoles | null> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return null;

  const deleted = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: userSelectWithRoles,
  });

  userLogger.info(`User soft-deleted: ${deleted.email}`);
  return toUserWithRoles(deleted);
}

/**
 * Create or upsert a user record (used during signup/login sync).
 */
export async function upsertByEmail(
  email: string,
  data?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  },
): Promise<UserWithRoles> {
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      lastLoginAt: new Date(),
      ...(data?.firstName !== undefined && { firstName: data.firstName }),
      ...(data?.lastName !== undefined && { lastName: data.lastName }),
    },
    create: {
      ...(data?.id && { id: data.id }),
      email,
      firstName: data?.firstName ?? null,
      lastName: data?.lastName ?? null,
    },
    select: userSelectWithRoles,
  });

  return toUserWithRoles(user);
}

export default {
  findAll,
  findById,
  update,
  softDelete,
  upsertByEmail,
};
