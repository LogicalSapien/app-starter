import { PrismaClient, PermissionAction } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Default permissions for the RBAC system.
 * Format: { name, description, resource, action }
 */
const DEFAULT_PERMISSIONS = [
  // User permissions
  {
    name: "user:read",
    description: "View user profiles and listings",
    resource: "user",
    action: PermissionAction.READ,
  },
  {
    name: "user:create",
    description: "Create new user accounts",
    resource: "user",
    action: PermissionAction.CREATE,
  },
  {
    name: "user:update",
    description: "Update user profiles",
    resource: "user",
    action: PermissionAction.UPDATE,
  },
  {
    name: "user:delete",
    description: "Delete (deactivate) user accounts",
    resource: "user",
    action: PermissionAction.DELETE,
  },
  // Role permissions
  {
    name: "role:read",
    description: "View roles and permissions",
    resource: "role",
    action: PermissionAction.READ,
  },
  {
    name: "role:create",
    description: "Create new roles",
    resource: "role",
    action: PermissionAction.CREATE,
  },
  {
    name: "role:update",
    description: "Update existing roles",
    resource: "role",
    action: PermissionAction.UPDATE,
  },
  {
    name: "role:delete",
    description: "Delete roles",
    resource: "role",
    action: PermissionAction.DELETE,
  },
  // Audit permissions
  {
    name: "audit:read",
    description: "View audit logs",
    resource: "audit",
    action: PermissionAction.READ,
  },
];

/**
 * Default roles and which permissions they receive.
 */
const DEFAULT_ROLES: {
  name: string;
  description: string;
  isDefault: boolean;
  permissions: string[];
}[] = [
  {
    name: "admin",
    description: "Full system access — all permissions",
    isDefault: false,
    permissions: DEFAULT_PERMISSIONS.map((p) => p.name),
  },
  {
    name: "moderator",
    description: "Read access plus some write operations",
    isDefault: false,
    permissions: ["user:read", "user:update", "role:read", "audit:read"],
  },
  {
    name: "user",
    description: "Basic read-only access",
    isDefault: true,
    permissions: ["user:read"],
  },
];

async function seed() {
  console.log("Seeding database...\n");

  // -----------------------------------------------------------------------
  // 1. Upsert permissions
  // -----------------------------------------------------------------------
  console.log("Creating permissions...");
  const permissionMap = new Map<string, string>(); // name -> id

  for (const perm of DEFAULT_PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {
        description: perm.description,
        resource: perm.resource,
        action: perm.action,
      },
      create: perm,
    });
    permissionMap.set(record.name, record.id);
    console.log(`  ✓ ${record.name}`);
  }

  // -----------------------------------------------------------------------
  // 2. Upsert roles and assign permissions
  // -----------------------------------------------------------------------
  console.log("\nCreating roles...");
  const roleMap = new Map<string, string>(); // name -> id

  for (const roleDef of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        description: roleDef.description,
        isDefault: roleDef.isDefault,
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        isDefault: roleDef.isDefault,
      },
    });
    roleMap.set(role.name, role.id);

    // Clear existing role-permission relations and re-create
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    for (const permName of roleDef.permissions) {
      const permId = permissionMap.get(permName);
      if (permId) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permId,
          },
        });
      }
    }

    console.log(
      `  ✓ ${role.name} (${roleDef.permissions.length} permissions${roleDef.isDefault ? ", default" : ""})`,
    );
  }

  // -----------------------------------------------------------------------
  // 3. Create test user and assign admin role
  // -----------------------------------------------------------------------
  console.log("\nCreating test user...");

  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      isActive: true,
    },
  });

  console.log(`  ✓ ${testUser.email} (${testUser.id})`);

  // Assign admin role to test user
  const adminRoleId = roleMap.get("admin");
  if (adminRoleId) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: testUser.id,
          roleId: adminRoleId,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        roleId: adminRoleId,
      },
    });
    console.log("  ✓ Assigned admin role to test user");
  }

  console.log("\nSeeding complete.");
}

async function main() {
  // When `prisma migrate dev` auto-runs the seed immediately after applying
  // migrations and regenerating the client, the Prisma query engine can
  // fail to find newly created tables on its first connection. Retrying
  // with a fresh connection resolves this race condition.
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await prisma.$connect();
      await seed();
      return;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      const isTableMissing = msg.includes("does not exist");
      if (isTableMissing && attempt < MAX_ATTEMPTS) {
        console.log(
          `Database schema not ready (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${RETRY_DELAY_MS / 1000}s...`,
        );
        await prisma.$disconnect();
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        throw error;
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
